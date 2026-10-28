/* Progressive enhancement: every lesson and navigation link works without JS. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const STORAGE_KEY = 'cellwise.excel.v1';
  const ids = [1, 2, 3, 4, 5];
  let state = { completed: [], score: null };
  let storageAvailable = true;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && Array.isArray(stored.completed)) {
      state.completed = [...new Set(stored.completed.filter(id => ids.includes(id)))];
      state.score = Number.isInteger(stored.score) && stored.score >= 0 && stored.score <= 5 ? stored.score : null;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { storageAvailable = false; }

  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('#course-navigation');
  if (toggle && panel) {
    toggle.hidden = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape' && window.matchMedia('(max-width: 620px)').matches) {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { storageAvailable = false; }
    render();
  }
  function render() {
    const count = state.completed.length;
    document.querySelectorAll('[data-progress-count]').forEach(el => { el.textContent = `${count} of 5`; });
    document.querySelectorAll('[data-progress]').forEach(el => { el.value = count; });
    document.querySelectorAll('[data-storage-note]').forEach(el => {
      el.textContent = storageAvailable ? 'Progress is saved in this browser.' : 'Storage is unavailable. Progress lasts for this page only.';
    });
    document.querySelectorAll('[data-lesson-link]').forEach(link => {
      const done = state.completed.includes(Number(link.dataset.lessonLink));
      link.classList.toggle('completed', done);
      const status = link.querySelector('[data-completion-status]');
      if (status) status.textContent = done ? ' — completed' : '';
      const number = link.querySelector('.nav-number');
      if (number) number.textContent = done ? '✓' : String(link.dataset.lessonLink).padStart(2, '0');
    });
    document.querySelectorAll('[data-complete]').forEach(button => {
      const done = state.completed.includes(Number(button.dataset.complete));
      button.textContent = done ? '✓ Lesson completed' : 'Mark lesson complete';
      button.disabled = done;
    });
    document.querySelectorAll('[data-resume]').forEach(link => {
      const next = ids.find(id => !state.completed.includes(id));
      link.href = next ? `lesson${next}.html` : 'lesson5.html#knowledge-check';
      link.querySelector('[data-resume-label]').textContent = count === 0 ? 'Start learning' : count === 5 ? 'Review the course' : 'Continue learning';
    });
    document.querySelectorAll('[data-saved-score]').forEach(el => {
      el.textContent = state.score === null ? '' : `Last quiz score: ${state.score}/5.`;
    });
    document.querySelectorAll('[data-course-status]').forEach(el => {
      el.textContent = count === 5 ? 'Course complete. You’ve built a solid foundation.' : 'Five small steps. One useful new skill.';
    });
  }

  document.querySelectorAll('[data-complete]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const id = Number(button.dataset.complete);
      if (!state.completed.includes(id)) state.completed.push(id);
      save();
      const message = document.querySelector('[data-completion-message]');
      if (message) message.textContent = 'Lesson completed. You’re ready for the next step.';
    });
  });
  document.querySelectorAll('[data-reset-progress]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      if (!window.confirm('Reset all lesson progress and your saved quiz score in this browser?')) return;
      state = { completed: [], score: null };
      save();
      const message = document.querySelector('[data-completion-message]');
      if (message) message.textContent = 'Course progress reset.';
      const quiz = document.querySelector('#knowledge-quiz');
      if (quiz) { quiz.reset(); clearQuiz(quiz); }
    });
  });

  // Answers are intentionally visible in the source: this is a practice quiz.
  const explanations = {
    q1: ['b', 'B3 means column B, row 3. Columns use letters and rows use numbers.'],
    q2: ['a', 'Store 4.5 as a number, then apply INR Currency formatting. Typing words into the amount can make it text.'],
    q3: ['c', '=SUM(D2:D5) adds the four line totals: 108 + 45 + 24 + 30 = 207 INR.'],
    q4: ['b', 'A filter temporarily hides rows that do not match your choice. Clearing it shows the rows again.'],
    q5: ['a', 'A bar or column chart compares categories clearly. A line chart is usually a better fit for change over time.']
  };
  function clearQuiz(form) {
    form.querySelectorAll('[data-feedback]').forEach(el => { el.hidden = true; el.textContent = ''; });
    form.querySelectorAll('input').forEach(el => el.removeAttribute('aria-invalid'));
    document.querySelector('#quiz-result').hidden = true;
    document.querySelector('#quiz-error').hidden = true;
  }
  const form = document.querySelector('#knowledge-quiz');
  if (form) {
    form.querySelector('[type=submit]').hidden = false;
    const retry = form.querySelector('[data-retry]');
    retry.hidden = false;
    form.addEventListener('submit', event => {
      event.preventDefault();
      clearQuiz(form);
      const answers = new FormData(form);
      const missing = Object.keys(explanations).filter(name => !answers.has(name));
      if (missing.length) {
        const error = document.querySelector('#quiz-error');
        error.textContent = `Please answer all five questions. ${missing.length} ${missing.length === 1 ? 'question needs' : 'questions need'} an answer.`;
        error.hidden = false;
        missing.forEach(name => form.querySelectorAll(`input[name="${name}"]`).forEach(input => input.setAttribute('aria-invalid', 'true')));
        error.focus();
        return;
      }
      let score = 0;
      Object.entries(explanations).forEach(([name, [correct, explanation]]) => {
        const right = answers.get(name) === correct;
        if (right) score++;
        const feedback = document.querySelector(`#${name}-feedback`);
        feedback.textContent = `${right ? 'Correct.' : 'Review this one.'} ${explanation}`;
        feedback.classList.toggle('incorrect', !right);
        feedback.hidden = false;
      });
      state.score = score;
      const passed = score >= 4;
      if (passed && !state.completed.includes(5)) state.completed.push(5);
      save();
      const result = document.querySelector('#quiz-result');
      result.querySelector('h3').textContent = `${score} out of 5 — ${passed ? 'nicely done!' : 'keep practicing'}`;
      result.querySelector('p').textContent = passed
        ? 'You passed the knowledge check. Lesson 5 is complete. Review the explanations below or revisit any lesson.'
        : 'Get 4 out of 5 to complete Lesson 5. Review the explanations below, then try again. There is no attempt limit.';
      result.hidden = false;
      result.focus();
    });
    retry.addEventListener('click', () => {
      form.reset();
      clearQuiz(form);
      form.querySelector('input').focus();
    });
  }
  render();
})();
