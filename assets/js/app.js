/**
 * MARGDARSHAK (SCG-GEP) - Master Application Engine
 * Multi-Agent AI-Based Student Career Guidance & Government Exam Preparation System
 * 
 * Vanilla JavaScript Core:
 * - State Management via localStorage
 * - Accessibility Controls (Font Scaling, High Contrast, Screen Reader hooks)
 * - Navigation & Breadcrumbs
 * - Modal Dialog System & Toast Notifications
 * - Exam Explorer Filter & Search Engine
 * - Multi-Agent AI Recommendation & Eligibility Simulator
 * - Interactive Mock Test System
 * - Application Status Tracker & Deadline Reminders
 * - Photo & Signature Requirement Validator
 * - Exam Pattern Comparison & Preparation Overlap Analyzer
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Storage Keys & State Initialization
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    PROFILE: 'margdarshak_student_profile',
    SAVED_EXAMS: 'margdarshak_saved_exams',
    NOTIFICATIONS: 'margdarshak_notifications',
    CHECKLIST: 'margdarshak_syllabus_checklist',
    SETTINGS: 'margdarshak_user_settings',
    AUTH_SESSION: 'margdarshak_auth_session',
    APPLICATIONS: 'margdarshak_applications',
    REMINDERS: 'margdarshak_deadline_reminders',
    EXAM_DAY_CHECKS: 'margdarshak_examday_checklist'
  };

  const MargDarshakState = {
    // 1. Profile
    getProfile() {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { /* fallback */ }
      }
      if (typeof DEFAULT_STUDENT_PROFILE !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_STUDENT_PROFILE));
        return DEFAULT_STUDENT_PROFILE;
      }
      return { 
        fullName: "Sachin K. Rao", 
        category: "OBC-NCL", 
        domicileState: "Karnataka",
        dob: "2002-08-15",
        qualifications: [{ degree: "B.Tech in Computer Science & Engineering", cgpa: "8.42", yearOfPassing: 2026 }]
      };
    },

    calculateAge(dobString) {
      const birth = parseIndianDate(dobString);
      if (!birth || Number.isNaN(birth.getTime()) || birth > new Date()) return null;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    },

    saveProfile(profileData) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
      window.dispatchEvent(new CustomEvent('margdarshak:profileUpdated', { detail: profileData }));
    },

    // 2. Saved/Bookmarked Exams
    getSavedExamIds() {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_EXAMS);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { return []; }
      }
      const initial = (typeof DEFAULT_STUDENT_PROFILE !== 'undefined' && DEFAULT_STUDENT_PROFILE.bookmarkedExams)
        ? DEFAULT_STUDENT_PROFILE.bookmarkedExams
        : ["isro-sc-2026", "ssc-cgl-2026", "nic-scientist-tech-2026", "ugc-net-cs-2026"];
      localStorage.setItem(STORAGE_KEYS.SAVED_EXAMS, JSON.stringify(initial));
      return initial;
    },

    toggleSaveExam(examId) {
      let saved = this.getSavedExamIds();
      let isSaved = false;
      if (saved.includes(examId)) {
        saved = saved.filter(id => id !== examId);
        isSaved = false;
      } else {
        saved.push(examId);
        isSaved = true;
      }
      localStorage.setItem(STORAGE_KEYS.SAVED_EXAMS, JSON.stringify(saved));
      window.dispatchEvent(new CustomEvent('margdarshak:bookmarksUpdated', { detail: { examId, isSaved, list: saved } }));
      return isSaved;
    },

    isExamSaved(examId) {
      return this.getSavedExamIds().includes(examId);
    },

    // 3. Application Status Tracker
    getApplicationRecords() {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      if (typeof DEFAULT_APPLICATION_RECORDS !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATION_RECORDS));
        return DEFAULT_APPLICATION_RECORDS;
      }
      return [];
    },

    saveApplicationRecord(record) {
      const records = this.getApplicationRecords();
      const existingIndex = records.findIndex(r => r.id === record.id || r.examId === record.examId);
      if (existingIndex >= 0) {
        records[existingIndex] = { ...records[existingIndex], ...record };
      } else {
        record.id = record.id || "app-rec-" + Date.now();
        records.push(record);
      }
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent('margdarshak:applicationsUpdated', { detail: records }));
      return records;
    },

    deleteApplicationRecord(id) {
      let records = this.getApplicationRecords();
      records = records.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent('margdarshak:applicationsUpdated', { detail: records }));
      return records;
    },

    // 4. Personalized Deadline Reminders
    getReminders() {
      const stored = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const initial = [
        { id: "rem-01", examId: "upsc-cse-2026", title: "UPSC CSE 2026 Application Closing", date: "05-03-2026", daysBefore: 3, alertType: "Application Deadline" },
        { id: "rem-02", examId: "isro-scientist-sc-2026", title: "ISRO Scientist Written Exam", date: "19-04-2026", daysBefore: 7, alertType: "Exam Hall Ticket Release" }
      ];
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initial));
      return initial;
    },

    addReminder(reminder) {
      const reminders = this.getReminders();
      reminder.id = reminder.id || "rem-" + Date.now();
      reminders.push(reminder);
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return reminders;
    },

    removeReminder(id) {
      let reminders = this.getReminders();
      reminders = reminders.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return reminders;
    },

    // 5. Exam Day Checklist
    getExamDayChecklist() {
      const stored = localStorage.getItem(STORAGE_KEYS.EXAM_DAY_CHECKS);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const initial = {
        "ed-admit": true,
        "ed-id": true,
        "ed-id-copy": false,
        "ed-photos": true,
        "ed-pen": true,
        "ed-water": false
      };
      localStorage.setItem(STORAGE_KEYS.EXAM_DAY_CHECKS, JSON.stringify(initial));
      return initial;
    },

    toggleExamDayCheck(itemId) {
      const checks = this.getExamDayChecklist();
      checks[itemId] = !checks[itemId];
      localStorage.setItem(STORAGE_KEYS.EXAM_DAY_CHECKS, JSON.stringify(checks));
      return checks;
    },

    // 6. Notifications state
    getNotifications() {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      if (typeof GOV_NOTIFICATIONS_DATA !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(GOV_NOTIFICATIONS_DATA));
        return GOV_NOTIFICATIONS_DATA;
      }
      return [];
    },

    markNotificationRead(notifId) {
      const notifs = this.getNotifications();
      const updated = notifs.map(n => n.id === notifId ? { ...n, isRead: true } : n);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    },

    getUnreadNotifCount() {
      const notifs = this.getNotifications();
      return notifs.filter(n => !n.isRead).length;
    },

    // 7. Syllabus Checklist
    getChecklist() {
      const stored = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const initial = (typeof DEFAULT_STUDENT_PROFILE !== 'undefined' && DEFAULT_STUDENT_PROFILE.checklistProgress)
        ? DEFAULT_STUDENT_PROFILE.checklistProgress
        : {};
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(initial));
      return initial;
    },

    toggleChecklistItem(itemId) {
      const list = this.getChecklist();
      list[itemId] = !list[itemId];
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(list));
      return list;
    },

    // 8. Settings
    getSettings() {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const defaults = { fontSize: 'normal', highContrast: false, lang: 'en' };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaults));
      return defaults;
    },

    saveSettings(newSettings) {
      const current = this.getSettings();
      const merged = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      this.applySettings(merged);
    },

    applySettings(settings) {
      document.body.classList.remove('font-small', 'font-normal', 'font-large');
      if (settings.fontSize === 'small') document.body.classList.add('font-small');
      else if (settings.fontSize === 'large') document.body.classList.add('font-large');
      else document.body.classList.add('font-normal');

      if (settings.highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    },

    // Session
    isAuthenticated() {
      const session = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      return session === 'active';
    },

    login(email, role = 'student') {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'active');
      window.dispatchEvent(new CustomEvent('margdarshak:authChanged', { detail: { loggedIn: true, email, role } }));
    },

    logout() {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      window.dispatchEvent(new CustomEvent('margdarshak:authChanged', { detail: { loggedIn: false } }));
      window.location.href = 'login.html';
    }
  };

  window.MargDarshakState = MargDarshakState;

  // --------------------------------------------------------------------------
  // 2. Date & Countdown Helpers (Feature 17 & 29)
  // --------------------------------------------------------------------------
  window.parseIndianDate = function(dateStr) {
    if (!dateStr) return null;
    // Format: DD-MM-YYYY or YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return new Date(parts[0], parseInt(parts[1], 10) - 1, parts[2]);
      } else if (parts[2].length === 4) {
        return new Date(parts[2], parseInt(parts[1], 10) - 1, parts[0]);
      }
    }
    return new Date(dateStr);
  };

  window.getCountdown = function(targetDateStr) {
    const target = parseIndianDate(targetDateStr);
    if (!target || isNaN(target.getTime())) {
      return { days: 0, hours: 0, minutes: 0, isPast: true, text: "Date TBA" };
    }
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, isPast: true, text: "Concluded / Today" };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      days,
      hours,
      minutes,
      isPast: false,
      text: `${days}d ${hours}h ${minutes}m left`
    };
  };

  // --------------------------------------------------------------------------
  // 3. Exam Eligibility Diagnostic Checker (Feature 11)
  // --------------------------------------------------------------------------
  window.checkExamEligibility = function(examId, customProfile = null) {
    if (typeof GOV_EXAMS_DATA === 'undefined') return null;
    const exam = GOV_EXAMS_DATA.find(e => e.id === examId);
    if (!exam) return null;

    const profile = customProfile || MargDarshakState.getProfile();
    
    // 1. Age Calculation
    const candidateAge = MargDarshakState.calculateAge(profile.dob);

    // 2. Age Relaxation Rules
    let maxRelaxedAge = exam.ageLimit.maxGeneral;
    let relaxationClause = "Standard Unreserved General Category Age Limit";
    
    if (profile.category === 'OBC-NCL') {
      maxRelaxedAge = exam.ageLimit.maxOBC || (typeof maxRelaxedAge === 'number' ? maxRelaxedAge + 3 : maxRelaxedAge);
      relaxationClause = "+3 Years Relaxation under Central/State OBC Non-Creamy Layer quota";
    } else if (profile.category === 'SC' || profile.category === 'ST') {
      maxRelaxedAge = exam.ageLimit.maxSCST || (typeof maxRelaxedAge === 'number' ? maxRelaxedAge + 5 : maxRelaxedAge);
      relaxationClause = "+5 Years Relaxation under SC/ST Reservation Mandate";
    }

    if (profile.isPwd && typeof maxRelaxedAge === 'number') {
      maxRelaxedAge += 10;
      relaxationClause += " + 10 Years PwD Benchmark Relaxation";
    }

    const minAge = exam.ageLimit.min;
    const ageEligible = candidateAge !== null &&
      ((maxRelaxedAge === "No limit" || maxRelaxedAge === "No upper age limit for Assistant Professor eligibility")
        ? candidateAge >= minAge
        : candidateAge >= minAge && candidateAge <= maxRelaxedAge);

    // 3. Qualification Check
    const candidateDegree = (profile.qualifications && profile.qualifications[0]) 
      ? profile.qualifications[0].degree 
      : "B.Tech in Computer Science & Engineering";
    
    const streamMatched = exam.eligibleStreams.some(st => 
      candidateDegree.toLowerCase().includes("b.tech") || 
      candidateDegree.toLowerCase().includes("engineering") || 
      st === "Any Graduate" || 
      st === "Arts/Humanities"
    );

    // 4. Overall Status
    const isOverallEligible = ageEligible && streamMatched;

    return {
      exam,
      candidateAge,
      minAge,
      maxRelaxedAge,
      relaxationClause,
      ageEligible,
      candidateDegree,
      streamMatched,
      isOverallEligible,
      category: profile.category || "General",
      domicile: profile.domicileState || "Karnataka"
    };
  };

  // --------------------------------------------------------------------------
  // 4. Common Syllabus & Preparation Overlap Analyzer (Features 14 & 15)
  // --------------------------------------------------------------------------
  window.analyzeSyllabusOverlap = function(examAId, examBId) {
    if (typeof GOV_EXAMS_DATA === 'undefined') return null;
    const examA = GOV_EXAMS_DATA.find(e => e.id === examAId);
    const examB = GOV_EXAMS_DATA.find(e => e.id === examBId);
    if (!examA || !examB) return null;

    // Check pre-calculated matrix first
    const key1 = `${examAId}_${examBId}`;
    const key2 = `${examBId}_${examAId}`;
    if (typeof EXAM_COMPARISON_DATA !== 'undefined' && EXAM_COMPARISON_DATA.overlapMatrix) {
      if (EXAM_COMPARISON_DATA.overlapMatrix[key1]) {
        return { examA, examB, ...EXAM_COMPARISON_DATA.overlapMatrix[key1] };
      }
      if (EXAM_COMPARISON_DATA.overlapMatrix[key2]) {
        return { examA, examB, ...EXAM_COMPARISON_DATA.overlapMatrix[key2] };
      }
    }

    // Dynamic heuristic calculation
    const isBothTech = examA.category.includes("Engineering") && examB.category.includes("Engineering");
    const isBothAdmin = (examA.category.includes("Civil") || examA.category.includes("Staff")) && (examB.category.includes("Civil") || examB.category.includes("Staff"));
    const isBothBanking = examA.category.includes("Banking") && examB.category.includes("Banking");

    let pct = 60;
    let shared = ["Quantitative Aptitude", "General Intelligence & Reasoning", "General English Comprehension"];
    let uniqueA = ["Domain Specific Paper-A"];
    let uniqueB = ["Domain Specific Paper-B"];

    if (isBothTech) {
      pct = 88;
      shared = ["Algorithms & Data Structures", "Operating Systems", "Computer Networks", "Database Systems (DBMS)", "Theory of Computation"];
      uniqueA = ["Specialized Project Domain Focus (A)"];
      uniqueB = ["Specialized Project Domain Focus (B)"];
    } else if (isBothAdmin) {
      pct = 75;
      shared = ["Indian Polity & Constitution", "Modern Indian History", "Indian Geography", "General Science", "Elementary Arithmetic"];
      uniqueA = ["State Administration Special Papers / Optional Subjects (A)"];
      uniqueB = ["Procedural Rules & Central Secretariat Codes (B)"];
    } else if (isBothBanking) {
      pct = 85;
      shared = ["Data Interpretation & Speed Math", "Analytical Puzzles & Seating Arrangement", "Banking & Economic Awareness", "English Vocabulary"];
      uniqueA = ["Internal Bank Specific Patterns (A)"];
      uniqueB = ["Internal Bank Specific Patterns (B)"];
    }

    return {
      examA,
      examB,
      overlapPercentage: pct,
      sharedTopics: shared,
      distinctTopicsExamA: uniqueA,
      distinctTopicsExamB: uniqueB
    };
  };

  // --------------------------------------------------------------------------
  // 5. Photo & Signature Requirement Validator (Feature 35)
  // --------------------------------------------------------------------------
  window.validateUploadFile = function(file, type = 'photo', commissionKey = 'upsc') {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ valid: false, message: "No file selected." });
        return;
      }

      const specs = (typeof COMMISSION_PHOTO_SPECS !== 'undefined' && COMMISSION_PHOTO_SPECS[commissionKey])
        ? COMMISSION_PHOTO_SPECS[commissionKey]
        : (COMMISSION_PHOTO_SPECS ? COMMISSION_PHOTO_SPECS.upsc : null);

      if (!specs) {
        resolve({ valid: false, message: "Commission specs unavailable." });
        return;
      }

      const targetSpec = type === 'photo' ? specs.photo : specs.signature;
      const sizeKb = file.size / 1024;
      const errors = [];

      // 1. File Type Check
      const allowedFormats = targetSpec.format || ["image/jpeg", "image/jpg"];
      if (!allowedFormats.includes(file.type.toLowerCase())) {
        errors.push(`Invalid format (${file.type}). Allowed: JPG/JPEG.`);
      }

      // 2. File Size Check
      if (sizeKb < targetSpec.minKb) {
        errors.push(`File size is too small (${Math.round(sizeKb)} KB). Minimum required: ${targetSpec.minKb} KB.`);
      }
      if (sizeKb > targetSpec.maxKb) {
        errors.push(`File size is too large (${Math.round(sizeKb)} KB). Maximum allowed: ${targetSpec.maxKb} KB.`);
      }

      // 3. Dimension Check via Image Element
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        if (targetSpec.minWidth && width < targetSpec.minWidth) {
          errors.push(`Width (${width}px) is less than required minimum (${targetSpec.minWidth}px).`);
        }
        if (targetSpec.minHeight && height < targetSpec.minHeight) {
          errors.push(`Height (${height}px) is less than required minimum (${targetSpec.minHeight}px).`);
        }

        resolve({
          valid: errors.length === 0,
          sizeKb: Math.round(sizeKb),
          width,
          height,
          errors,
          commission: specs.name,
          notes: targetSpec.notes
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, message: "Failed to read image dimensions. Ensure file is a valid image." });
      };

      img.src = objectUrl;
    });
  };

  // --------------------------------------------------------------------------
  // 6. Toast Notification Engine
  // --------------------------------------------------------------------------
  function createToastContainer() {
    let container = document.getElementById('govToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'govToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function (message, type = 'info', duration = 4000) {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `gov-toast toast-${type}`;
    
    let iconSvg = 'ℹ️';
    if (type === 'success') iconSvg = '✅';
    if (type === 'error') iconSvg = '⚠️';
    if (type === 'warning') iconSvg = '🔔';

    toast.innerHTML = `
      <span style="font-size: 1.1rem; line-height: 1;">${iconSvg}</span>
      <div style="flex: 1;">
        <div style="font-weight: 700; margin-bottom: 2px;">${type.toUpperCase()} NOTICE</div>
        <div>${message}</div>
      </div>
      <button type="button" style="background:none; border:none; color:#cbd5e1; cursor:pointer; font-size:1.1rem; padding:0 4px;" aria-label="Dismiss">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  };

  function initDemoTransparencyAndWorkspaceLink() {
    const navbar = document.querySelector('.gov-navbar');
    const navLinks = document.querySelector('.gov-navbar .nav-links');
    if (navbar && !document.getElementById('portalDemoNotice')) {
      const notice = document.createElement('div');
      notice.id = 'portalDemoNotice';
      notice.className = 'portal-demo-notice';
      notice.setAttribute('role', 'note');
      notice.innerHTML = '<div class="gov-container"><strong>Prototype / sample data:</strong> Recruitment status, notifications, vacancies, dates, salaries and eligibility examples are illustrative and not live-verified. Confirm current details on the linked official agency website before acting.</div>';
      navbar.insertAdjacentElement('afterend', notice);
    }
    if (navLinks && !navLinks.querySelector('a[href="workspace.html"]')) {
      const item = document.createElement('li');
      item.className = 'nav-item';
      item.innerHTML = '<a href="workspace.html" class="nav-link">Study Workspace</a>';
      const dashboardItem = [...navLinks.querySelectorAll('.nav-item')].find(link => link.querySelector('a[href="dashboard.html"]'));
      navLinks.insertBefore(item, dashboardItem || null);
      if (window.location.pathname.endsWith('/workspace.html')) {
        item.querySelector('a').classList.add('active');
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. Modal Dialog Manager
  // --------------------------------------------------------------------------
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('gov-modal-backdrop')) {
      e.target.classList.remove('active');
      e.target.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.gov-modal-backdrop.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        activeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  });

  // --------------------------------------------------------------------------
  // 8. Global Header / Accessibility Initializer
  // --------------------------------------------------------------------------
  function initHeaderAndAccessibility() {
    const dateContainers = document.querySelectorAll('.topbar-date, #currentGovDate');
    const updateDateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      };
      const formattedDate = now.toLocaleDateString('en-IN', options);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const displayString = `${formattedDate} | ${hours}:${minutes} IST`;
      dateContainers.forEach(el => {
        el.innerHTML = `<span>📅</span> ${displayString}`;
      });
    };
    if (dateContainers.length > 0) {
      updateDateTime();
    }

    const currentSettings = MargDarshakState.getSettings();
    MargDarshakState.applySettings(currentSettings);

    const btnFontSmall = document.getElementById('btnFontSmall');
    const btnFontNormal = document.getElementById('btnFontNormal');
    const btnFontLarge = document.getElementById('btnFontLarge');
    const btnContrast = document.getElementById('btnContrast');
    const langSelect = document.getElementById('govLangSelect');

    if (btnFontSmall) {
      btnFontSmall.addEventListener('click', () => {
        MargDarshakState.saveSettings({ fontSize: 'small' });
        showToast("Font size adjusted to Small (90%)", "info", 2000);
      });
    }
    if (btnFontNormal) {
      btnFontNormal.addEventListener('click', () => {
        MargDarshakState.saveSettings({ fontSize: 'normal' });
        showToast("Font size restored to Standard (100%)", "info", 2000);
      });
    }
    if (btnFontLarge) {
      btnFontLarge.addEventListener('click', () => {
        MargDarshakState.saveSettings({ fontSize: 'large' });
        showToast("Font size enlarged to Large (115%)", "info", 2000);
      });
    }
    if (btnContrast) {
      btnContrast.addEventListener('click', () => {
        const isHigh = !document.body.classList.contains('high-contrast');
        MargDarshakState.saveSettings({ highContrast: isHigh });
        showToast(isHigh ? "High Contrast Mode Enabled" : "Standard Contrast Restored", "info", 2000);
      });
    }

    if (langSelect) {
      langSelect.value = currentSettings.lang || 'en';
      langSelect.addEventListener('change', (e) => {
        MargDarshakState.saveSettings({ lang: e.target.value });
        const langNames = { en: "English", hi: "हिन्दी (Hindi)", kn: "ಕನ್ನಡ (Kannada)" };
        showToast(`Language preference: ${langNames[e.target.value] || e.target.value}. Academic portal prototype.`, "info", 3000);
      });
    }

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
        const isOpen = navLinks.classList.contains('mobile-open');
        mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    const searchForms = document.querySelectorAll('.portal-search-form');
    searchForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.portal-search-input');
        const query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = `exams.html?search=${encodeURIComponent(query)}`;
        } else {
          showToast("Please enter an exam title or commission keyword.", "warning", 2500);
        }
      });
    });

    const unreadCount = MargDarshakState.getUnreadNotifCount();
    const notifBadges = document.querySelectorAll('.notification-unread-count, .nav-badge-pill');
    notifBadges.forEach(badge => {
      if (badge) {
        badge.textContent = unreadCount > 0 ? unreadCount : '0';
        if (unreadCount === 0) badge.style.display = 'none';
      }
    });

    const profile = MargDarshakState.getProfile();
    const userNameElements = document.querySelectorAll('.user-display-name, .header-user-name');
    userNameElements.forEach(el => {
      if (el) el.textContent = profile.fullName || "Student Aspirant";
    });
  }

  // --------------------------------------------------------------------------
  // 9. Exam Details Modal (Feature 12)
  // --------------------------------------------------------------------------
  window.viewExamDetails = function (examId) {
    if (typeof GOV_EXAMS_DATA === 'undefined') return;
    const exam = GOV_EXAMS_DATA.find(e => e.id === examId);
    if (!exam) return;

    let modal = document.getElementById('examDetailsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'examDetailsModal';
      modal.className = 'gov-modal-backdrop';
      modal.innerHTML = `
        <div class="gov-modal-dialog" role="dialog" aria-modal="true" style="max-width: 760px;">
          <div class="gov-modal-header">
            <div>
              <span id="examModalBodyTag" class="gov-badge badge-central"></span>
              <h3 id="examModalTitle" class="gov-modal-title" style="margin-top: 4px;"></h3>
            </div>
            <button type="button" class="gov-modal-close-btn" onclick="closeModal('examDetailsModal')" aria-label="Close dialog">&times;</button>
          </div>
          <div class="gov-modal-body" id="examModalContent"></div>
          <div class="gov-modal-footer">
            <button type="button" class="gov-btn gov-btn-outline" onclick="closeModal('examDetailsModal')">Close</button>
            <button type="button" id="examModalTrackBtn" class="gov-btn gov-btn-green">Track in Applications</button>
            <button type="button" id="examModalSaveBtn" class="gov-btn gov-btn-primary">Bookmark Exam</button>
            <a id="examModalApplyLink" href="#" target="_blank" rel="noopener noreferrer" class="gov-btn gov-btn-saffron">
              Official Portal Link ↗
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = modal.querySelector('#examModalTitle');
    const bodyTag = modal.querySelector('#examModalBodyTag');
    const contentEl = modal.querySelector('#examModalContent');
    const saveBtn = modal.querySelector('#examModalSaveBtn');
    const trackBtn = modal.querySelector('#examModalTrackBtn');
    const applyLink = modal.querySelector('#examModalApplyLink');

    titleEl.textContent = exam.title;
    bodyTag.textContent = exam.conductingBody;
    applyLink.href = exam.officialWebsite;

    const isSaved = MargDarshakState.isExamSaved(exam.id);
    saveBtn.textContent = isSaved ? '✓ Bookmarked' : '☆ Bookmark Exam';
    saveBtn.className = isSaved ? 'gov-btn gov-btn-green' : 'gov-btn gov-btn-outline';
    saveBtn.onclick = () => {
      const nowSaved = MargDarshakState.toggleSaveExam(exam.id);
      saveBtn.textContent = nowSaved ? '✓ Bookmarked' : '☆ Bookmark Exam';
      saveBtn.className = nowSaved ? 'gov-btn gov-btn-green' : 'gov-btn gov-btn-outline';
      showToast(nowSaved ? `Saved "${exam.code}" to bookmarks` : `Removed "${exam.code}" from bookmarks`, nowSaved ? 'success' : 'info');
    };

    trackBtn.onclick = () => {
      MargDarshakState.saveApplicationRecord({
        examId: exam.id,
        examCode: exam.code,
        examTitle: exam.title,
        status: "Interested",
        examDate: exam.prelimsDate
      });
      showToast(`Added ${exam.code} to your Application Status Tracker!`, "success", 2500);
      closeModal('examDetailsModal');
      setTimeout(() => { window.location.href = "applications.html"; }, 800);
    };

    let stagesHtml = '';
    if (exam.stages && exam.stages.length > 0) {
      stagesHtml = exam.stages.map((st, i) => `
        <div style="margin-bottom: 0.6rem; padding: 0.5rem 0.75rem; background: #f8fafc; border-left: 3px solid var(--gov-navy); border-radius: 2px;">
          <strong style="color: var(--gov-navy); font-size: 0.85rem;">Stage ${i + 1}: ${st.name}</strong>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${st.details}</p>
        </div>
      `).join('');
    }

    const countdown = getCountdown(exam.prelimsDate);

    contentEl.innerHTML = `
      <div style="background: #eef5fc; border: 1px solid #c7ddf5; border-radius: 4px; padding: 0.75rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Sample profile relevance (not AI-verified)</span>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--gov-navy);">${exam.aiMatchScore}% Sample Match</div>
        </div>
        <div style="text-align: right;">
          <span class="gov-badge badge-pay">${exam.payScale}</span>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--gov-saffron); margin-top: 3px;">
            ⏳ ${countdown.text}
          </div>
        </div>
      </div>

      <div class="exam-meta-grid" style="margin-top: 0; padding-top: 0;">
        <div class="meta-item">
          <span class="meta-item-label">Total Vacancies</span>
          <span class="meta-item-value">${exam.vacancies} Posts</span>
        </div>
        <div class="meta-item">
          <span class="meta-item-label">Age Limit (General)</span>
          <span class="meta-item-value">${exam.ageLimit.min} to ${exam.ageLimit.maxGeneral} Years</span>
        </div>
        <div class="meta-item">
          <span class="meta-item-label">Category Relaxation</span>
          <span class="meta-item-value">+3 Yrs (OBC) / +5 Yrs (SC/ST)</span>
        </div>
        <div class="meta-item">
          <span class="meta-item-label">Application Last Date</span>
          <span class="meta-item-value" style="color: var(--status-danger-text);">${exam.lastDateToApply}</span>
        </div>
        <div class="meta-item">
          <span class="meta-item-label">Negative Marking</span>
          <span class="meta-item-value">${exam.negativeMarking || '-0.33 per wrong'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-item-label">Application Fee</span>
          <span class="meta-item-value">${exam.applicationFee}</span>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <h4 style="font-size: 0.9rem; color: var(--gov-navy-dark); margin-bottom: 0.35rem;">Prescribed Minimum Educational Qualification:</h4>
        <p style="font-size: 0.85rem; color: var(--text-main); background: #fdfdfd; padding: 0.5rem; border: 1px solid var(--border-light); border-radius: 3px;">
          ${exam.minQualification}
        </p>
      </div>

      <div style="margin-top: 1rem;">
        <h4 style="font-size: 0.9rem; color: var(--gov-navy-dark); margin-bottom: 0.35rem;">Selection Process & Examination Stages:</h4>
        ${stagesHtml}
      </div>
    `;

    openModal('examDetailsModal');
  };

  // --------------------------------------------------------------------------
  // 10. AI Eligibility Screener Dialog (Feature 11)
  // --------------------------------------------------------------------------
  window.runAiEligibilityCheck = function () {
    const profile = MargDarshakState.getProfile();
    showToast("Showing a local demo comparison. Official eligibility is not verified.", "info", 2500);

    setTimeout(() => {
      let modal = document.getElementById('aiEligibilityModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aiEligibilityModal';
        modal.className = 'gov-modal-backdrop';
        modal.innerHTML = `
          <div class="gov-modal-dialog" role="dialog" aria-modal="true" style="max-width: 760px;">
            <div class="gov-modal-header">
              <div>
                <span class="gov-badge badge-state">Local demo comparison</span>
                <h3 class="gov-modal-title" style="margin-top: 4px;">Illustrative Eligibility Review</h3>
              </div>
              <button type="button" class="gov-modal-close-btn" onclick="closeModal('aiEligibilityModal')">&times;</button>
            </div>
            <div class="gov-modal-body" id="aiReportContent"></div>
            <div class="gov-modal-footer">
              <a href="profile.html" class="gov-btn gov-btn-outline">Edit Profile Parameters</a>
              <button type="button" class="gov-btn gov-btn-primary" onclick="closeModal('aiEligibilityModal')">Acknowledge Report</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const content = modal.querySelector('#aiReportContent');
      const sampleCheck = checkExamEligibility("isro-scientist-sc-2026", profile);

      content.innerHTML = `
        <div style="padding: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #166534;">
            <span>ℹ️</span> No official rule verification was performed
          </div>
          <p style="font-size: 0.8rem; color: #166534; margin-top: 0.25rem;">
            Candidate: <strong>${profile.fullName}</strong> | Age: <strong>${sampleCheck && sampleCheck.candidateAge !== null ? `${sampleCheck.candidateAge} Yrs` : 'Not provided'}</strong> | Category: <strong>${profile.category || 'General'}</strong> | Domicile: <strong>${profile.domicileState || 'Karnataka'}</strong>
          </p>
        </div>

        <div class="gov-table-wrapper">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Validation Scope</th>
                <th>Status</th>
                <th>Evaluation Metric</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Eligibility Screener</strong></td>
                <td>Age Rules, Degree Match & Reservation Relaxation</td>
                <td><span class="gov-badge badge-state">Check official notice</span></td>
                <td>Illustrative sample rules</td>
              </tr>
              <tr>
                <td><strong>Syllabus Planner</strong></td>
                <td>CS to Exam Subject Overlap</td>
                <td><span class="gov-badge badge-state">Sample overlap</span></td>
                <td>Static topic mapping</td>
              </tr>
              <tr>
                <td><strong>Notification Watchdog</strong></td>
                <td>Active Application Deadlines</td>
                <td><span class="gov-badge badge-state">Not checked</span></td>
                <td>No live portal monitoring</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 1rem; font-size: 0.85rem; line-height: 1.5;">
          <h4 style="color: var(--gov-navy); margin-bottom: 0.5rem;">Recommended Priority Examination Roadmap:</h4>
          <ol style="padding-left: 1.25rem;">
            <li><strong>ISRO Scientist 'SC' (Computer Science)</strong> - Sample technical pathway; check the official qualification and age rules.</li>
            <li><strong>NIC Scientist 'B' & Tech Assistant</strong> - 99% Software Architecture synergy.</li>
            <li><strong>SSC CGL 2026</strong> - Assistant Section Officer in CSS/MEA; strong quantitative alignment.</li>
            <li><strong>UGC-NET / JRF CS</strong> - Review the current NTA bulletin for qualification and marks criteria.</li>
          </ol>
        </div>
      `;

      openModal('aiEligibilityModal');
    }, 600);
  };

  // --------------------------------------------------------------------------
  // 11. Mock Test Simulator (from app.js)
  // --------------------------------------------------------------------------
  window.startMockTestSession = function () {
    if (typeof MOCK_QUESTIONS_DATA === 'undefined' || MOCK_QUESTIONS_DATA.length === 0) {
      showToast("Practice question bank currently unavailable.", "error");
      return;
    }

    let modal = document.getElementById('mockTestModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mockTestModal';
      modal.className = 'gov-modal-backdrop';
      modal.innerHTML = `
        <div class="gov-modal-dialog" role="dialog" aria-modal="true" style="max-width: 820px; height: 85vh;">
          <div class="gov-modal-header" style="background: var(--gov-navy); color: #fff;">
            <div>
              <span class="gov-badge badge-state">Adaptive Practice Simulation</span>
              <h3 class="gov-modal-title" style="color: #fff; margin-top: 4px;">Daily High-Yield Practice Test</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span id="mockTimerDisplay" style="font-family: var(--font-mono); font-weight: 700; background: rgba(0,0,0,0.3); padding: 0.25rem 0.6rem; border-radius: 3px; font-size: 1rem;">10:00</span>
              <button type="button" class="gov-modal-close-btn" style="color: #fff;" onclick="closeModal('mockTestModal')">&times;</button>
            </div>
          </div>
          <div class="gov-modal-body" id="mockTestBody" style="display: flex; flex-direction: column; justify-content: space-between;"></div>
          <div class="gov-modal-footer" id="mockTestFooter">
            <button type="button" id="prevQuestionBtn" class="gov-btn gov-btn-outline" disabled>Previous</button>
            <button type="button" id="nextQuestionBtn" class="gov-btn gov-btn-primary">Next Question</button>
            <button type="button" id="submitMockTestBtn" class="gov-btn gov-btn-saffron" style="margin-left: auto;">Submit Test</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    let currentIndex = 0;
    const userAnswers = {};
    const totalQuestions = MOCK_QUESTIONS_DATA.length;
    let timerSeconds = 600;
    let timerInterval = null;

    const timerDisplay = modal.querySelector('#mockTimerDisplay');
    const testBody = modal.querySelector('#mockTestBody');
    const prevBtn = modal.querySelector('#prevQuestionBtn');
    const nextBtn = modal.querySelector('#nextQuestionBtn');
    const submitBtn = modal.querySelector('#submitMockTestBtn');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        submitTest();
        return;
      }
      timerSeconds--;
      const m = Math.floor(timerSeconds / 60);
      const s = timerSeconds % 60;
      timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);

    function renderQuestion(index) {
      const q = MOCK_QUESTIONS_DATA[index];
      prevBtn.disabled = index === 0;
      nextBtn.textContent = index === totalQuestions - 1 ? "Finish Review" : "Next Question";

      testBody.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; margin-bottom: 1rem;">
            <span style="font-weight: 700; color: var(--gov-navy); font-size: 0.85rem;">Question ${index + 1} of ${totalQuestions}</span>
            <span class="gov-badge badge-central">${q.subject}</span>
          </div>

          <div style="font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 1.25rem; line-height: 1.5;">
            ${q.question}
          </div>

          <div class="mock-options-list" style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${q.options.map((opt, optIndex) => `
              <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 1px solid ${userAnswers[index] === optIndex ? 'var(--gov-navy)' : 'var(--border-medium)'}; background: ${userAnswers[index] === optIndex ? 'var(--gov-navy-light)' : '#ffffff'}; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;">
                <input type="radio" name="mock_option" value="${optIndex}" ${userAnswers[index] === optIndex ? 'checked' : ''} style="accent-color: var(--gov-navy); transform: scale(1.15);">
                <span style="font-size: 0.9rem; color: var(--text-main);">${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
          <span style="font-size: 0.75rem; color: var(--text-light); width: 100%; margin-bottom: 0.25rem;">Question Palette:</span>
          ${MOCK_QUESTIONS_DATA.map((_, i) => `
            <button type="button" class="gov-btn ${userAnswers[i] !== undefined ? 'gov-btn-primary' : 'gov-btn-outline'} gov-btn-sm" style="width: 32px; height: 30px; padding: 0; font-size: 0.75rem; ${i === index ? 'box-shadow: 0 0 0 2px var(--gov-saffron);' : ''}" onclick="window._jumpToMockQuestion(${i})">
              ${i + 1}
            </button>
          `).join('')}
        </div>
      `;

      const radios = testBody.querySelectorAll('input[name="mock_option"]');
      radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          userAnswers[index] = parseInt(e.target.value, 10);
          renderQuestion(index);
        });
      });
    }

    window._jumpToMockQuestion = function (idx) {
      currentIndex = idx;
      renderQuestion(currentIndex);
    };

    prevBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
      }
    };

    nextBtn.onclick = () => {
      if (currentIndex < totalQuestions - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      } else {
        submitTest();
      }
    };

    function submitTest() {
      clearInterval(timerInterval);
      let score = 0;
      let attempted = 0;
      let wrong = 0;

      MOCK_QUESTIONS_DATA.forEach((q, idx) => {
        if (userAnswers[idx] !== undefined) {
          attempted++;
          if (userAnswers[idx] === q.correctAnswer) {
            score++;
          } else {
            wrong++;
          }
        }
      });

      const percentage = Math.round((score / totalQuestions) * 100);
      const history = JSON.parse(localStorage.getItem('margdarshak_mock_history') || '[]');
      history.unshift({
        completedAt: new Date().toISOString(),
        score,
        total: totalQuestions,
        attempted,
        wrong,
        percentage,
        source: 'Daily practice sample'
      });
      localStorage.setItem('margdarshak_mock_history', JSON.stringify(history.slice(0, 50)));

      testBody.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <div style="width: 70px; height: 70px; border-radius: 50%; background: ${percentage >= 60 ? 'var(--gov-green-light)' : 'var(--gov-saffron-light)'}; color: ${percentage >= 60 ? 'var(--gov-green)' : 'var(--gov-saffron)'}; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">
            ${percentage >= 60 ? '✓' : '📊'}
          </div>
          <h3 style="color: var(--gov-navy-dark); font-size: 1.35rem; font-weight: 800;">Mock Test Completed</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
            Your Performance Score: <strong>${score} / ${totalQuestions}</strong> (${percentage}%)
          </p>

          <div style="display: flex; justify-content: center; gap: 1rem; margin: 1.5rem 0; flex-wrap: wrap;">
            <div style="background: #f8fafc; border: 1px solid var(--border-light); padding: 0.75rem 1.25rem; border-radius: 4px;">
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--gov-green);">${score}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">CORRECT</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border-light); padding: 0.75rem 1.25rem; border-radius: 4px;">
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--status-danger-text);">${wrong}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">INCORRECT</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border-light); padding: 0.75rem 1.25rem; border-radius: 4px;">
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-muted);">${totalQuestions - attempted}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">SKIPPED</div>
            </div>
          </div>

          <div style="text-align: left; background: #fdfdfd; border: 1px solid var(--border-light); border-radius: 4px; padding: 1rem; max-height: 250px; overflow-y: auto;">
            <h4 style="font-size: 0.9rem; color: var(--gov-navy); margin-bottom: 0.5rem;">Diagnostic Solution & Explanation Review:</h4>
            ${MOCK_QUESTIONS_DATA.map((q, idx) => `
              <div style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px dashed var(--border-light);">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Q${idx + 1}. ${q.question}</div>
                <div style="font-size: 0.78rem; color: ${userAnswers[idx] === q.correctAnswer ? 'var(--gov-green)' : 'var(--status-danger-text)'}; margin-top: 2px;">
                  Your Answer: ${userAnswers[idx] !== undefined ? q.options[userAnswers[idx]] : 'Skipped'}
                  ${userAnswers[idx] === q.correctAnswer ? ' (✓ Correct)' : ` | Correct: ${q.options[q.correctAnswer]}`}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; font-style: italic;">
                  💡 ${q.explanation}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      submitBtn.textContent = 'Close Test';
      submitBtn.onclick = () => closeModal('mockTestModal');
    }

    submitBtn.onclick = () => {
      if (confirm("Are you sure you want to finish and submit the test?")) {
        submitTest();
      }
    };

    renderQuestion(0);
    openModal('mockTestModal');
  };

  // --------------------------------------------------------------------------
  // 12. Global Safe Button Delegator
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initDemoTransparencyAndWorkspaceLink();
    initHeaderAndAccessibility();

    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href === '#' || href === 'javascript:void(0)') {
        e.preventDefault();
        const actionLabel = target.textContent.trim() || 'This module';
        showToast(`${actionLabel} is an academic demo feature configured in this prototype.`, "info", 2500);
      }
    });
  });

})();
