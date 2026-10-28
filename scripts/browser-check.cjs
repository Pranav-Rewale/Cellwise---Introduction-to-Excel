const { chromium } = require(process.env.CELLWISE_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = (process.env.CELLWISE_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const root = path.resolve(__dirname,'..');
const results = [];
async function run() {
  const browser = await chromium.launch({channel:process.env.CELLWISE_BROWSER || undefined,headless:true});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(base)) errors.push(`${r.status()} ${r.url()}`)});
    const response=await page.goto(base);assert.equal(response.status(),200);
    await page.goto(`${base}/lesson2.html`);
    assert.match(await page.locator('main').innerText(),/₹4\.50/);
    await page.goto(`${base}/lesson3.html`);
    assert.match(await page.locator('main').innerText(),/₹207\.00/);
    assert((await page.locator('main').innerText()).includes('$B$2'));
    await page.goto(`${base}/lesson5.html`);
    assert.match(await page.locator('main').innerText(),/Workshop supply costs \(INR\)/);
    results.push('INR content: rupee examples, INR chart title, and unchanged $B$2 fixed cell reference pass.');
    await page.goto(base);
    await page.screenshot({path:path.join(root,'docs/screenshots/desktop.png'),fullPage:true});
    for(const width of [320,390,768,820,1024,1440]){
      await page.setViewportSize({width,height:1000});
      for(const file of ['index.html',...Array.from({length:5},(_,i)=>`lesson${i+1}.html`),'template.html']){
        await page.goto(`${base}/${file}`);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${file}: horizontal overflow at ${width}`);
        assert.equal(await page.locator('h1').count(),1);
        if(file==='index.html') {
          assert(await page.evaluate(()=>{
            const range=document.createRange();range.selectNodeContents(document.querySelector('.hero h1'));
            const title=range.getBoundingClientRect(), image=document.querySelector('.hero-visual').getBoundingClientRect();
            return title.right<=image.left || image.right<=title.left || title.bottom<=image.top || image.bottom<=title.top;
          }), `Hero heading overlaps illustration at ${width}`);
        }

        assert(await page.locator('img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)),`${file}: image load`);
      }
    }
    results.push('All 7 pages: no horizontal document overflow at 320, 390, 768, 820, 1024, and 1440 pixels; images load; hero heading and illustration do not overlap.');
    await page.setViewportSize({width:820,height:1180});await page.goto(base);
    await page.screenshot({path:path.join(root,'docs/screenshots/tablet.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.goto(base);
    await page.screenshot({path:path.join(root,'docs/screenshots/mobile.png'),fullPage:true});
    const toggle=page.locator('[data-nav-toggle]');
    assert.equal(await page.locator('#course-navigation').isVisible(),false);
    await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await page.locator('.course-nav a').first().focus();await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    assert(await toggle.evaluate(el=>document.activeElement===el));
    results.push('Mobile menu opens, closes with Escape, and restores focus to the toggle.');
    await page.goto(base);await page.keyboard.press('Tab');
    assert(await page.locator('.skip-link').evaluate(el=>document.activeElement===el));
    await page.keyboard.press('Enter');
    assert(await page.locator('main').evaluate(el=>document.activeElement===el));
    results.push('Keyboard skip link moves focus into main content.');
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(`${base}/lesson1.html`);
    await page.locator('[data-complete]').click();
    assert.equal(await page.locator('[data-progress-count]').innerText(),'1 of 5');
    await page.reload();assert.equal(await page.locator('[data-progress-count]').innerText(),'1 of 5');
    await page.goto(base);assert.equal(await page.locator('[data-resume]').getAttribute('href'),'lesson2.html');
    results.push('Lesson completion persists after reload and updates overview resume link.');
    await page.goto(`${base}/lesson5.html#knowledge-check`);
    await page.locator('[type=submit]').click();
    assert(await page.locator('#quiz-error').isVisible());
    assert(await page.locator('#quiz-error').evaluate(el=>document.activeElement===el));
    for(const [q,v] of Object.entries({q1:'a',q2:'b',q3:'a',q4:'a',q5:'b'})) await page.check(`#${q}-${v}`);
    await page.locator('[type=submit]').click();
    assert.match(await page.locator('#quiz-result h3').innerText(),/0 out of 5/);
    assert.equal(await page.locator('[data-feedback]:visible').count(),5);
    assert.equal(await page.locator('[data-progress-count]').innerText(),'1 of 5');
    await page.locator('[data-retry]').click();
    assert.equal(await page.locator('input:checked').count(),0);
    assert.equal(await page.locator('#quiz-result').isVisible(),false);
    for(const [q,v] of Object.entries({q1:'b',q2:'a',q3:'c',q4:'b',q5:'b'})) await page.check(`#${q}-${v}`);
    await page.locator('[type=submit]').click();
    assert.match(await page.locator('#quiz-result h3').innerText(),/4 out of 5/);
    assert.equal(await page.locator('[data-progress-count]').innerText(),'2 of 5');
    assert(await page.locator('#quiz-result').evaluate(el=>document.activeElement===el));
    await page.reload();assert.match(await page.locator('[data-saved-score]').innerText(),/4\/5/);
    for(const [q,v] of Object.entries({q1:'b',q2:'a',q3:'c',q4:'b',q5:'a'})) await page.check(`#${q}-${v}`);
    await page.locator('[type=submit]').click();
    assert.match(await page.locator('#quiz-result h3').innerText(),/5 out of 5/);
    results.push('Quiz: incomplete submission focuses error; 0/5 fails; 4/5 and 5/5 pass; feedback, retry, score persistence, and completion pass.');
    await page.locator('#knowledge-check').screenshot({path:path.join(root,'docs/screenshots/quiz.png')});
    await page.goto(`${base}/lesson3.html`);
    await page.screenshot({path:path.join(root,'docs/screenshots/lesson-desktop.png'),fullPage:true});
    // Reset is destructive only to this browser context's demo progress.
    page.once('dialog',dialog=>dialog.accept());await page.locator('[data-reset-progress]').click();
    assert.equal(await page.locator('[data-progress-count]').innerText(),'0 of 5');
    results.push('Progress reset clears stored completions and quiz score.');
    await page.evaluate(()=>localStorage.setItem('cellwise.excel.v1','{malformed'));
    await page.reload();assert.equal(await page.locator('[data-progress-count]').innerText(),'0 of 5');
    results.push('Malformed stored data recovers without a runtime error.');
    const denied=await browser.newContext();
    await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage denied')}}));
    const dp=await denied.newPage();await dp.goto(`${base}/lesson1.html`);
    await dp.locator('[data-complete]').click();
    assert.equal(await dp.locator('[data-progress-count]').innerText(),'1 of 5');
    assert.match(await dp.locator('[data-storage-note]').innerText(),/Storage is unavailable/);
    results.push('Blocked storage falls back to page-local progress with an explicit notice.');
    const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const np=await nojs.newPage();await np.goto(`${base}/lesson5.html`);
    assert(await np.locator('#course-navigation').isVisible());
    assert.equal(await np.locator('#knowledge-quiz input').count(),15);
    await np.locator('.answer-key summary').click();assert(await np.locator('.answer-key ol').isVisible());
    assert.equal(await np.locator('[type=submit]').isVisible(),false);
    results.push('JavaScript disabled: mobile navigation, all content, practice reveals, and manual quiz answer key remain usable.');
    assert.equal(errors.length,0,JSON.stringify(errors));
    results.push('No JavaScript runtime errors or missing local network assets in the primary context.');
    await fs.writeFile(path.join(root,'docs/browser-results.json'),JSON.stringify({browser:await browser.version(),results},null,2));
    console.log(JSON.stringify({browser:await browser.version(),results},null,2));
  } finally {await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1});
