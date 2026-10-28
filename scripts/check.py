"""Dependency-free static QA: run python scripts/check.py from any directory.

Checks local links/fragments/assets, page structure, image descriptions, tables,
quiz labels, duplicate IDs, and accidentally retained authoring placeholders.
Editorial review and real assistive-technology testing remain human checks.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import csv
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors = []
external = set()

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.links, self.images = path, set(), [], []
        self.labels, self.inputs, self.headings = set(), [], []
        self.tables = self.captions = self.h1s = self.mains = self.titles = 0
        self.lang = None
        self.feed(path.read_text(encoding='utf-8'))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids: errors.append(f'{self.path.name}: duplicate ID {a["id"]}')
            self.ids.add(a['id'])
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'a':
            if not a.get('href'): errors.append(f'{self.path.name}: link without href')
            self.links.append(a.get('href', ''))
        if tag in ('script', 'img', 'link'):
            asset = a.get('src') if tag != 'link' else a.get('href')
            if asset: self.links.append(asset)
        if tag == 'img': self.images.append(a)
        if tag == 'label' and 'for' in a: self.labels.add(a['for'])
        if tag == 'input': self.inputs.append(a)
        if tag == 'table': self.tables += 1
        if tag == 'caption': self.captions += 1
        if tag == 'th' and a.get('scope') not in ('row', 'col'): errors.append(f'{self.path.name}: table header missing scope')
        if tag == 'h1': self.h1s += 1
        if tag == 'main': self.mains += 1
        if tag == 'title': self.titles += 1
        if tag in ('h1','h2','h3','h4','h5','h6'): self.headings.append(int(tag[1]))

pages = {p.resolve(): Page(p) for p in sorted(ROOT.glob('*.html'))}
for path, p in pages.items():
    def fail(message): errors.append(f'{path.name}: {message}')
    if not p.lang: fail('document language missing')
    if p.h1s != 1: fail('expected exactly one h1')
    if p.mains != 1: fail('expected exactly one main landmark')
    if p.titles != 1: fail('expected exactly one title')
    if p.tables != p.captions: fail('table missing caption')
    if not p.images: fail('expected an informative illustration')
    for image in p.images:
        if len(image.get('alt', '').strip()) < 20: fail(f'image needs descriptive alt: {image.get("src")}')
        if not image.get('width') or not image.get('height'): fail('image needs explicit dimensions')
    for i in p.inputs:
        if i.get('id') not in p.labels: fail(f'input lacks explicit label: {i.get("id")}')
    start = p.headings.index(1) if 1 in p.headings else 0
    for prev, curr in zip(p.headings[start:], p.headings[start+1:]):
        if curr > prev + 1: fail(f'heading level skipped: h{prev} to h{curr}')
    for url in p.links:
        parsed = urlsplit(url)
        if parsed.scheme in ('http','https'):
            external.add(url); continue
        if parsed.scheme: fail(f'unsupported URL scheme: {url}'); continue
        target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
        if not target.is_relative_to(ROOT.resolve()): fail(f'link escapes project: {url}'); continue
        if not target.is_file(): fail(f'missing local target: {url}'); continue
        if parsed.fragment and target.suffix == '.html':
            if target not in pages or unquote(parsed.fragment) not in pages[target].ids: fail(f'broken fragment: {url}')
    if path.name != 'template.html':
        content = path.read_text(encoding='utf-8')
        for placeholder in ('TODO', 'Lorem ipsum', 'Your lesson title'):
            if placeholder.lower() in content.lower(): fail(f'placeholder found: {placeholder}')

for svg in ROOT.glob('assets/images/*.svg'):
    try: ET.parse(svg)
    except ET.ParseError as e: errors.append(f'{svg.name}: invalid SVG: {e}')

# Currency localization must preserve Excel's separate fixed-reference syntax.
for path in ROOT.rglob('*'):
    if path.suffix in ('.html', '.svg', '.md', '.js'):
        content = path.read_text(encoding='utf-8')
        if re.search(r'\bUSD\b|\bUS dollars?\b|(?<![A-Za-z])\$(?=\d)|four dollars', content):
            errors.append(f'{path.relative_to(ROOT)}: outdated currency reference')
if '$B$2' not in (ROOT/'lesson3.html').read_text(encoding='utf-8'):
    errors.append('Lesson 3 fixed cell reference was changed during currency localization')

with (ROOT/'assets/data/workshop-budget.csv').open(encoding='utf-8', newline='') as f:
    rows=list(csv.DictReader(f))
    total=sum(int(row['Quantity'])*float(row['Unit cost (INR)']) for row in rows)
    if len(rows)!=4 or total!=207: errors.append('Practice data does not match lesson totals')

expected = {'index.html', 'template.html', *(f'lesson{i}.html' for i in range(1,6))}
if {p.name for p in pages} != expected: errors.append('Expected index, five lessons, and template')

def luminance(color):
    values = [int(color[i:i+2], 16)/255 for i in (1,3,5)]
    linear = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in values]
    return sum(v*w for v,w in zip(linear,[.2126,.7152,.0722]))

contrast_pairs = [('#344c43','#fafbf7'),('#59695f','#fafbf7'),('#59695f','#f1f1e7'),('#ffffff','#176b49'),('#a94c24','#f1f1e7'),('#176b49','#e7efc9')]
for fg,bg in contrast_pairs:
    a,b = luminance(fg),luminance(bg)
    ratio = (max(a,b)+.05)/(min(a,b)+.05)
    if ratio < 4.5: errors.append(f'Primary palette contrast below 4.5:1: {fg} on {bg}')
if errors:
    print('\n'.join('FAIL: '+e for e in errors)); sys.exit(1)
print(f'PASS: {len(pages)} pages; local links, fragments, assets, IDs, heading order, labels, tables, image descriptions, SVG syntax, and dataset totals.')
print(f'{len(external)} unique external resource URLs require network/human verification; see docs/QA.md.')
print('PASS: six primary text/background color pairs meet 4.5:1 contrast.')
print('PASS: INR currency references and Excel fixed-reference syntax are consistent.')
