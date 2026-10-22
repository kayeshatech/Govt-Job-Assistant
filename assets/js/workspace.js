(function () {
  'use strict';

  const PREFIX = 'govexa_workspace_';
  const KEYS = {
    plan: PREFIX + 'plan',
    doubts: PREFIX + 'doubts',
    practice: PREFIX + 'practice',
    mistakes: PREFIX + 'mistakes',
    backlog: PREFIX + 'backlog',
    goal: PREFIX + 'goal',
    sessions: PREFIX + 'sessions',
    posts: PREFIX + 'posts'
  };
  const get = id => document.getElementById(id);

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error(`Unable to read saved workspace data (${key}).`, error);
      if (window.showToast) showToast('Saved workspace data could not be read. The page is using an empty view.', 'error');
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Unable to save workspace data (${key}).`, error);
      if (window.showToast) showToast('Could not save this change in browser storage. Check available storage space.', 'error');
      return false;
    }
  }

  function appendText(parent, text, tagName) {
    const element = document.createElement(tagName || 'p');
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function getPracticePool() {
    return typeof MOCK_QUESTIONS_DATA !== 'undefined' && Array.isArray(MOCK_QUESTIONS_DATA)
      ? MOCK_QUESTIONS_DATA
      : [];
  }

  function sentenceList(text) {
    return text.trim().split(/(?<=[.!?])\s+|\n+/).map(item => item.trim()).filter(Boolean);
  }

  function initDocuments() {
    const upload = get('documentUpload');
    upload.addEventListener('change', () => {
      const file = upload.files && upload.files[0];
      get('documentFileStatus').textContent = file
        ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB. Selected locally only; the PDF has not been read or uploaded.`
        : 'No file selected. The PDF will not be uploaded or parsed.';
    });

    const sourceText = () => get('documentText').value.trim();
    get('summarizeText').addEventListener('click', () => {
      const sentences = sentenceList(sourceText());
      const output = get('documentOutput');
      output.textContent = sentences.length
        ? `Local excerpt summary (first ${Math.min(3, sentences.length)} sentence${sentences.length === 1 ? '' : 's'}): ${sentences.slice(0, 3).join(' ')}`
        : 'Paste some text first. This local sample does not summarize an uploaded PDF.';
    });
    get('extractQuestions').addEventListener('click', () => {
      const lines = sentenceList(sourceText()).filter(sentence => /\?|\b(what|which|when|where|why|how|define|explain|describe)\b/i.test(sentence));
      get('documentOutput').textContent = lines.length
        ? `Possible question prompts from your pasted text:\n${lines.map(line => `• ${line}`).join('\n')}`
        : 'No question-like sentences found in the pasted text. This is a simple keyword demonstration, not PDF question extraction.';
    });
    get('makeNotes').addEventListener('click', () => {
      const lines = sentenceList(sourceText());
      get('revisionOutput').textContent = lines.length
        ? `Revision notes\n${lines.map((line, index) => `${index + 1}. ${line}`).join('\n')}`
        : 'Paste text to create notes.';
    });
    get('makeFlashcards').addEventListener('click', () => {
      const lines = sentenceList(sourceText());
      const output = get('revisionOutput');
      output.replaceChildren();
      if (!lines.length) return appendText(output, 'Paste text to create sample flashcards.');
      lines.slice(0, 8).forEach((line, index) => {
        const card = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `Card ${index + 1} · reveal sample text`;
        appendText(card, line);
        card.prepend(summary);
        output.appendChild(card);
      });
    });
    get('makeMindMap').addEventListener('click', () => {
      const lines = sentenceList(sourceText());
      const keywords = (sourceText().match(/\b[\p{L}\p{N}]{5,}\b/gu) || [])
        .filter((word, index, words) => words.findIndex(item => item.toLowerCase() === word.toLowerCase()) === index)
        .slice(0, 12);
      get('revisionOutput').textContent = lines.length
        ? `Topic map (simple keyword grouping)\n${keywords.length ? `Main topic\n${keywords.map(word => `  └ ${word}`).join('\n')}` : lines.slice(0, 3).join('\n')}`
        : 'Paste text to build a simple keyword map.';
    });
    get('makeQuiz').addEventListener('click', () => {
      const lines = sentenceList(sourceText()).slice(0, 5);
      const output = get('revisionOutput');
      output.replaceChildren();
      if (!lines.length) return appendText(output, 'Paste a few factual sentences to make a sample cloze quiz.');
      lines.forEach((line, index) => {
        const terms = line.match(/\b[\p{L}\p{N}]{5,}\b/gu) || [];
        const answer = terms[0];
        const item = document.createElement('details');
        const question = document.createElement('summary');
        question.textContent = answer
          ? `Q${index + 1}. ${line.replace(new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____')}`
          : `Q${index + 1}. Review this statement`;
        appendText(item, answer ? `Sample answer: ${answer}` : line);
        item.prepend(question);
        output.appendChild(item);
      });
    });
  }

  let practiceIndex = 0;
  function renderPractice() {
    const pool = getPracticePool();
    if (!pool.length) {
      get('practiceQuestion').textContent = 'Sample question data is unavailable.';
      return;
    }
    const topic = get('practiceTopic').value;
    const matching = pool.filter(question => question.subject === topic);
    const options = matching.length ? matching : pool;
    practiceIndex %= options.length;
    const question = options[practiceIndex];
    get('practiceQuestion').textContent = `${question.subject} · ${question.question}`;
    const list = get('practiceOptions');
    list.replaceChildren();
    question.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'workspace-option';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'practiceOption';
      radio.value = String(index);
      label.append(radio, document.createTextNode(option));
      list.appendChild(label);
    });
    get('practiceFeedback').textContent = '';
  }

  function initLearning() {
    const savedPlan = read(KEYS.plan, { hours: 4, done: [] });
    get('dailyStudyHours').value = savedPlan.hours || 4;
    get('practiceTopic').addEventListener('change', () => { practiceIndex = 0; renderPractice(); });
    renderPractice();
    get('studyPlanForm').addEventListener('submit', event => {
      event.preventDefault();
      const hours = Number(get('dailyStudyHours').value);
      if (!Number.isFinite(hours) || hours < 1 || hours > 16) {
        get('studyPlanStatus').textContent = 'Choose a daily target between 1 and 16 hours.';
        return;
      }
      save(KEYS.plan, { ...read(KEYS.plan, {}), hours });
      get('studyPlanStatus').textContent = `Saved a ${hours}-hour daily target on this device.`;
      updatePlanProgress();
    });
    get('adaptPlan').addEventListener('click', () => {
      const history = read('margdarshak_mock_history', []);
      const current = Number(get('dailyStudyHours').value) || 4;
      const suggestion = history.length && history[0].percentage < 50 ? Math.max(1, current - 1) : Math.min(16, current + 1);
      get('dailyStudyHours').value = suggestion;
      get('studyPlanStatus').textContent = `Rule-based suggestion: try ${suggestion} hours daily, then review your workload. This is not an AI-generated plan.`;
    });
    get('checkPracticeAnswer').addEventListener('click', () => {
      const pool = getPracticePool();
      if (!pool.length) return;
      const topic = get('practiceTopic').value;
      const matching = pool.filter(question => question.subject === topic);
      const question = (matching.length ? matching : pool)[practiceIndex];
      const answer = document.querySelector('input[name="practiceOption"]:checked');
      if (!answer) {
        get('practiceFeedback').textContent = 'Select an answer first.';
        return;
      }
      const correct = Number(answer.value) === question.correctAnswer;
      get('practiceFeedback').textContent = `${correct ? 'Correct.' : 'Review this one.'} ${question.explanation}`;
      const log = read(KEYS.practice, []);
      log.unshift({ topic: question.subject, correct, date: new Date().toISOString() });
      save(KEYS.practice, log.slice(0, 100));
      if (!correct) {
        const mistakes = read(KEYS.mistakes, []);
        mistakes.unshift({ text: question.question, topic: question.subject, date: new Date().toISOString() });
        save(KEYS.mistakes, mistakes.slice(0, 100));
        renderMistakes();
      }
      renderAnalytics();
    });
    get('nextPracticeQuestion').addEventListener('click', () => {
      practiceIndex++;
      renderPractice();
    });
    get('showConcept').addEventListener('click', () => {
      const explanations = {
        'binary-search': 'Binary search compares a target to the middle item of a sorted sequence and discards half of the remaining range at each step. Its time complexity is O(log n).',
        constitution: 'Directive Principles of State Policy are in Part IV of the Constitution. They guide the State; they are not enforceable by courts in the same manner as Fundamental Rights.',
        percentages: 'Percentage change = (new value − original value) ÷ original value × 100. Always use the original value as the denominator.'
      };
      get('conceptExplanation').textContent = explanations[get('doubtTopic').value];
    });
    get('saveDoubt').addEventListener('click', () => {
      const text = get('doubtText').value.trim();
      if (!text) return showToast('Enter a question before saving.', 'warning');
      const doubts = read(KEYS.doubts, []);
      doubts.unshift({ text, date: new Date().toLocaleDateString('en-IN') });
      if (save(KEYS.doubts, doubts.slice(0, 50))) {
        get('doubtText').value = '';
        renderDoubts();
      }
    });
    get('showCurrentAffairs').addEventListener('click', () => {
      get('currentAffairsPrompts').textContent = 'Sample revision prompts: Union Budget and fiscal policy; RBI monetary policy tools; recent Supreme Court constitutional judgments; climate commitments; digital public infrastructure. These are prompts only, not current news. Verify facts and dates from current official sources.';
    });
  }

  function updatePlanProgress() {
    const done = Object.values(read('margdarshak_syllabus_checklist', {})).filter(Boolean).length;
    const total = 23;
    const percent = Math.min(100, Math.round(done / total * 100));
    get('studyPlanProgress').style.width = `${percent}%`;
    get('studyPlanStatus').textContent = `${percent}% of the sample tracked syllabus items are marked complete (${done}/${total}).`;
  }

  function renderDoubts() {
    const list = get('savedDoubts');
    list.replaceChildren();
    read(KEYS.doubts, []).forEach(item => appendText(list, `${item.date}: ${item.text}`, 'li'));
  }

  function renderMistakes() {
    const list = get('mistakeList');
    list.replaceChildren();
    read(KEYS.mistakes, []).forEach((item, index) => {
      const li = document.createElement('li');
      appendText(li, `${item.topic ? `${item.topic}: ` : ''}${item.text}`);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gov-btn gov-btn-outline gov-btn-sm';
      button.textContent = 'Mark reviewed';
      button.addEventListener('click', () => {
        const all = read(KEYS.mistakes, []);
        all.splice(index, 1);
        save(KEYS.mistakes, all);
        renderMistakes();
      });
      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function renderBacklog() {
    const list = get('backlogList');
    list.replaceChildren();
    read(KEYS.backlog, []).forEach((item, index) => {
      const li = document.createElement('li');
      appendText(li, item);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gov-btn gov-btn-outline gov-btn-sm';
      button.textContent = 'Complete';
      button.addEventListener('click', () => {
        const backlog = read(KEYS.backlog, []);
        backlog.splice(index, 1);
        save(KEYS.backlog, backlog);
        renderBacklog();
      });
      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function renderAnalytics() {
    const history = read('margdarshak_mock_history', []);
    const practice = read(KEYS.practice, []);
    const attempts = history.reduce((sum, item) => sum + item.attempted, 0) + practice.length;
    const correct = history.reduce((sum, item) => sum + item.score, 0) + practice.filter(item => item.correct).length;
    const accuracy = attempts ? Math.round(correct / attempts * 100) : 0;
    get('performanceSummary').textContent = history.length || practice.length
      ? `${history.length} sample mock test${history.length === 1 ? '' : 's'} · ${practice.length} topic practice responses · ${accuracy}% overall accuracy (${correct}/${attempts} answers).`
      : 'No practice results yet. Complete a sample question or timed test to see a local summary.';
    const perTopic = {};
    practice.forEach(item => {
      perTopic[item.topic] ||= { correct: 0, total: 0 };
      perTopic[item.topic].total++;
      if (item.correct) perTopic[item.topic].correct++;
    });
    const bars = get('performanceBars');
    bars.replaceChildren();
    Object.entries(perTopic).forEach(([topic, result]) => {
      const value = Math.round(result.correct / result.total * 100);
      const row = document.createElement('div');
      row.className = 'performance-row';
      appendText(row, `${topic} · ${value}%`);
      const track = document.createElement('div');
      track.className = 'workspace-progress';
      const fill = document.createElement('div');
      fill.className = 'workspace-progress-fill';
      fill.style.width = `${value}%`;
      track.appendChild(fill);
      row.appendChild(track);
      bars.appendChild(row);
    });
    const strengths = Object.entries(perTopic).filter(([, result]) => result.correct / result.total >= 0.7).map(([topic]) => topic);
    const weak = Object.entries(perTopic).filter(([, result]) => result.correct / result.total < 0.5).map(([topic]) => topic);
    get('knowledgeMap').textContent = `Practice topics: ${Object.keys(perTopic).join(', ') || 'none yet'}. Strength signals: ${strengths.join(', ') || 'not enough practice data'}. Review candidates: ${weak.join(', ') || 'none identified yet'}. This is a simple calculation, not an AI knowledge graph.`;
  }

  function initAnalytics() {
    get('mistakeForm').addEventListener('submit', event => {
      event.preventDefault();
      const value = get('mistakeText').value.trim();
      if (!value) return;
      const mistakes = read(KEYS.mistakes, []);
      mistakes.unshift({ text: value, date: new Date().toISOString() });
      if (save(KEYS.mistakes, mistakes.slice(0, 100))) get('mistakeText').value = '';
      renderMistakes();
    });
    get('backlogForm').addEventListener('submit', event => {
      event.preventDefault();
      const value = get('backlogTopic').value.trim();
      if (!value) return;
      const backlog = read(KEYS.backlog, []);
      backlog.push(value);
      if (save(KEYS.backlog, backlog)) get('backlogTopic').value = '';
      renderBacklog();
    });
    get('makeRecoveryPlan').addEventListener('click', () => {
      const items = read(KEYS.backlog, []);
      get('recoveryPlan').textContent = items.length
        ? `Next 3 sessions: (1) Choose one high-priority topic: ${items[0]}. (2) Study for 25 minutes and do 5 practice questions. (3) Reassess remaining backlog; keep your usual rest and sleep.`
        : 'No backlog is recorded. Add missed topics above, then create a small recovery session.';
    });
    renderMistakes();
    renderBacklog();
    renderAnalytics();
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function renderGoal() {
    const goal = read(KEYS.goal, { minutes: 120, days: {} });
    const day = (goal.days || {})[todayKey()] || 0;
    get('todayGoal').value = goal.minutes || 120;
    get('goalSummary').textContent = `Today: ${day}/${goal.minutes || 120} minutes · ${day >= (goal.minutes || 120) ? 'Goal reached' : 'Keep going'} · ${Object.keys(goal.days || {}).length}-day activity history on this device.`;
  }

  let remainingSeconds = 25 * 60;
  let timerHandle = null;
  function updateTimer() {
    get('timerDisplay').textContent = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;
  }

  function initProductivity() {
    renderGoal();
    get('saveGoal').addEventListener('click', () => {
      const minutes = Number(get('todayGoal').value);
      if (!Number.isInteger(minutes) || minutes < 10 || minutes > 1440) return showToast('Set a daily goal between 10 and 1440 minutes.', 'warning');
      const goal = read(KEYS.goal, { days: {} });
      save(KEYS.goal, { ...goal, minutes });
      renderGoal();
    });
    get('logStudySession').addEventListener('click', () => {
      const goal = read(KEYS.goal, { minutes: 120, days: {} });
      const days = goal.days || {};
      days[todayKey()] = (days[todayKey()] || 0) + 25;
      save(KEYS.goal, { ...goal, days });
      const sessions = read(KEYS.sessions, []);
      sessions.unshift({ date: todayKey(), minutes: 25 });
      save(KEYS.sessions, sessions.slice(0, 400));
      renderGoal();
    });
    get('pomodoroMinutes').addEventListener('change', () => {
      clearInterval(timerHandle);
      timerHandle = null;
      remainingSeconds = Number(get('pomodoroMinutes').value) * 60;
      updateTimer();
    });
    get('timerStart').addEventListener('click', () => {
      if (timerHandle) return;
      timerHandle = setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          updateTimer();
        } else {
          clearInterval(timerHandle);
          timerHandle = null;
          showToast('Focus session complete. Take a short break.', 'success');
        }
      }, 1000);
    });
    get('timerPause').addEventListener('click', () => {
      clearInterval(timerHandle);
      timerHandle = null;
    });
    get('timerReset').addEventListener('click', () => {
      clearInterval(timerHandle);
      timerHandle = null;
      remainingSeconds = Number(get('pomodoroMinutes').value) * 60;
      updateTimer();
    });
    get('focusMode').addEventListener('click', event => {
      document.body.classList.toggle('workspace-focus-mode');
      const enabled = document.body.classList.contains('workspace-focus-mode');
      document.querySelectorAll('.workspace-section').forEach(section => section.removeAttribute('data-focused'));
      if (enabled) event.currentTarget.closest('.workspace-section').setAttribute('data-focused', 'true');
      event.currentTarget.setAttribute('aria-pressed', String(enabled));
      event.currentTarget.textContent = enabled ? 'Exit focus mode' : 'Enter focus mode';
    });
    document.querySelectorAll('[data-plan]').forEach(button => {
      button.addEventListener('click', () => {
        const days = Number(button.dataset.plan);
        const plans = {
          30: '30-day outline: 20 days for core topics, 6 for timed practice, 3 for revision, 1 for logistics and rest.',
          7: '7-day outline: revise high-priority notes, take short timed sets, review mistakes, prepare documents, and protect sleep.',
          3: 'Short-time outline: identify the official syllabus, prioritize familiar high-weight areas, practice a few timed questions, and avoid starting too many new resources.'
        };
        get('shortPlan').textContent = `${days}-day preparation mode · ${plans[days]}`;
      });
    });
  }

  function initNet() {
    const render = paper => {
      document.querySelectorAll('[data-net-paper]').forEach(button => {
        const active = button.dataset.netPaper === paper;
        button.className = active ? 'gov-btn gov-btn-primary' : 'gov-btn gov-btn-outline';
        button.setAttribute('aria-pressed', String(active));
      });
      get('netPaperContent').textContent = paper === 'paper1'
        ? 'Paper I sample topics: teaching aptitude, research methods, comprehension, communication, mathematical reasoning, logical reasoning, data interpretation, ICT, people and environment, and higher education.'
        : 'Paper II sample Computer Science topics: discrete structures, architecture, programming, algorithms, databases, operating systems, software engineering, networks, theory of computation, and AI/data science.';
    };
    document.querySelectorAll('[data-net-paper]').forEach(button => button.addEventListener('click', () => render(button.dataset.netPaper)));
    render('paper1');
  }

  function initCommunity() {
    const response = get('assistantResponse');
    get('askAssistant').addEventListener('click', () => {
      const question = get('assistantQuestion').value.trim();
      if (!question) return showToast('Enter a question to see the local guidance example.', 'warning');
      response.textContent = `Sample guidance (not AI): start with the official syllabus for your target exam, compare it with your current preparation, and choose a realistic weekly plan. For eligibility or dates, check the relevant commission directly. Your prompt was not sent to a service.`;
    });
    get('speakGuidance').addEventListener('click', () => {
      if (!('speechSynthesis' in window) || !response.textContent) return showToast('Add a sample guidance response first; browser speech output may not be available.', 'warning');
      const utterance = new SpeechSynthesisUtterance(response.textContent);
      const lang = read('margdarshak_user_settings', { lang: 'en' }).lang;
      utterance.lang = { hi: 'hi-IN', kn: 'kn-IN' }[lang] || 'en-IN';
      window.speechSynthesis.speak(utterance);
    });
    get('speechInput').addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return showToast('Speech recognition is not supported by this browser.', 'warning');
      const recognition = new SpeechRecognition();
      recognition.lang = { hi: 'hi-IN', kn: 'kn-IN' }[read('margdarshak_user_settings', { lang: 'en' }).lang] || 'en-IN';
      recognition.onresult = event => {
        get('assistantQuestion').value = event.results[0][0].transcript;
        showToast('Voice input captured by your browser.', 'success');
      };
      recognition.onerror = event => {
        console.error('Browser speech recognition failed.', event.error);
        showToast(`Voice input failed: ${event.error}. You can type your question instead.`, 'error');
      };
      recognition.start();
    });
    get('communityForm').addEventListener('submit', event => {
      event.preventDefault();
      const text = get('communityPost').value.trim();
      if (!text) return;
      const posts = read(KEYS.posts, []);
      posts.unshift({ text, date: new Date().toLocaleDateString('en-IN') });
      if (save(KEYS.posts, posts.slice(0, 30))) get('communityPost').value = '';
      renderPosts();
    });
    get('mentorView').addEventListener('change', renderMentor);
    renderPosts();
    renderMentor();
  }

  function renderPosts() {
    const list = get('communityPosts');
    list.replaceChildren();
    const posts = read(KEYS.posts, []);
    if (!posts.length) return appendText(list, 'No local posts yet. Start a discussion prompt above.', 'li');
    posts.forEach(post => appendText(list, `${post.date} · ${post.text}`, 'li'));
  }

  function renderMentor() {
    const target = get('mentorDashboard');
    if (get('mentorView').value === 'student') {
      target.textContent = 'Student view selected. Switch to mentor/teacher preview to see local progress-summary controls.';
      return;
    }
    const profile = window.MargDarshakState ? MargDarshakState.getProfile() : {};
    const appCount = window.MargDarshakState ? MargDarshakState.getApplicationRecords().length : 0;
    const practiceCount = read(KEYS.practice, []).length;
    target.textContent = `Mentor preview for ${profile.fullName || 'demo student'}: ${practiceCount} topic-practice responses and ${appCount} locally stored sample application record(s). There is no teacher account, permissions system, or remote student data.`;
  }

  function initSettings() {
    get('exportDemoData').addEventListener('click', () => {
      const exportData = {};
      Object.entries(KEYS).forEach(([name, key]) => { exportData[name] = read(key, null); });
      exportData.mockHistory = read('margdarshak_mock_history', []);
      exportData.profile = read('margdarshak_student_profile', null);
      exportData.applications = read('margdarshak_applications', []);
      const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'govexa-demo-data.json';
      link.click();
      URL.revokeObjectURL(url);
      get('settingsFeedback').textContent = 'A JSON export of local demo data was created. Store it safely; it may include personal profile details.';
    });
    get('clearWorkspaceData').addEventListener('click', () => {
      if (!window.confirm("Clear this workspace's study plans, activity, notes, and local discussion posts? Profile, application records, settings, and checklists will remain.")) return;
      Object.values(KEYS).forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('margdarshak_mock_history');
      get('settingsFeedback').textContent = 'Workspace-only data cleared from this browser.';
      renderGoal();
      renderMistakes();
      renderBacklog();
      renderDoubts();
      renderPosts();
      renderAnalytics();
      updatePlanProgress();
    });
    document.querySelectorAll('details').forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (detail.open) detail.setAttribute('aria-expanded', 'true');
        else detail.removeAttribute('aria-expanded');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDocuments();
    initLearning();
    initAnalytics();
    initProductivity();
    initNet();
    initCommunity();
    initSettings();
    updatePlanProgress();
    renderDoubts();
  });
})();
