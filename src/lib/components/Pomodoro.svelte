<svelte:options runes />

<script>
  // 모드: focus(집중), short-break(짧은 휴식), long-break(긴 휴식), idle
  let mode = $state('idle');
  let completedFocusCount = $state(0);

  let focusMinutes = $state(25);
  let shortBreakMinutes = $state(5);
  let longBreakMinutes = $state(15);

  let remainingMs = $state(25 * 60 * 1000);
  let running = $state(false);

  let lastTick = 0;
  let intervalId = null;
  let audioContext = null;

  // 🔥 원을 더 크게
  const RADIUS = 62;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // 진행 원 dashoffset (0이면 꽉 찬 상태, CIRCUMFERENCE면 비어있는 상태)
  let progressDashoffset = $state(CIRCUMFERENCE);

  let currentSessionStartTime = $state(0);
  let totalFocusTimeMs = $state(0);

  let autoAdvance = $state(true);

  function getCurrentTotalMs() {
    if (mode === 'focus') return focusMinutes * 60 * 1000;
    if (mode === 'short-break') return shortBreakMinutes * 60 * 1000;
    if (mode === 'long-break') return longBreakMinutes * 60 * 1000;
    return focusMinutes * 60 * 1000; // idle도 현재 focusMinutes 기준으로
  }

  // ✅ 진행 계산은 여기 1곳에서만 - 12시에서 시계방향 채워짐
  $effect(() => {
    const totalMs = getCurrentTotalMs();
    if (!totalMs) return;

    // progress: 0 → 1 (채워지는 방향)
    const progressRatio = Math.max(0, Math.min(1, (getCurrentTotalMs() - remainingMs) / totalMs));
    // 12시 시작점에서 시계방향으로 진행: CIRCUMFERENCE → 0
    progressDashoffset = CIRCUMFERENCE * (1 - progressRatio);
  });

  function calculateTotalFocusTime() {
    const completedTime = completedFocusCount * focusMinutes * 60 * 1000;
    let currentTime = 0;

    if (mode === 'focus' && currentSessionStartTime > 0) {
      currentTime = Date.now() - currentSessionStartTime;
      const maxSession = focusMinutes * 60 * 1000;
      currentTime = Math.min(currentTime, maxSession);
    }

    return completedTime + currentTime;
  }

  $effect(() => {
    if (typeof window === 'undefined') return;

    let rafId = 0;
    function update() {
      totalFocusTimeMs = calculateTotalFocusTime();
      rafId = requestAnimationFrame(update);
    }

    if (running && mode === 'focus') update();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  // 완료된 세트/설정 변경 시 즉시 반영
  $effect(() => {
    totalFocusTimeMs = calculateTotalFocusTime();
  });

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function modeLabel() {
    if (mode === 'focus') return '집중';
    if (mode === 'short-break') return '짧은 휴식';
    if (mode === 'long-break') return '긴 휴식';
    return '대기';
  }

  function formattedTime() {
    return formatTime(remainingMs);
  }

  function setRemainingFromMinutes(minutes) {
    remainingMs = minutes * 60 * 1000;
  }

  function startTimer() {
    if (running) return;

    if (mode === 'idle') {
      mode = 'focus';
      setRemainingFromMinutes(focusMinutes);
      currentSessionStartTime = Date.now();
    }

    if (mode === 'focus' && currentSessionStartTime === 0) {
      currentSessionStartTime = Date.now();
    }

    running = true;
    lastTick = performance.now();

    intervalId = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTick;
      lastTick = now;

      remainingMs = Math.max(0, remainingMs - delta);
      if (remainingMs <= 0) handlePhaseEnd();
    }, 50);
  }

  function formatTotalFocusTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function stopTimer() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function resetTimer() {
    stopTimer();
    currentSessionStartTime = 0;
    totalFocusTimeMs = 0;
    completedFocusCount = 0;

    mode = 'idle';
    setRemainingFromMinutes(focusMinutes);
  }

  function handlePhaseEnd() {
    stopTimer();
    playAlarm();

    if (mode === 'focus') {
      completedFocusCount++;
      totalFocusTimeMs = completedFocusCount * focusMinutes * 60 * 1000;
      currentSessionStartTime = 0;

      if (completedFocusCount % 4 === 0) {
        mode = 'long-break';
        setRemainingFromMinutes(longBreakMinutes);
      } else {
        mode = 'short-break';
        setRemainingFromMinutes(shortBreakMinutes);
      }
    } else if (mode === 'short-break' || mode === 'long-break') {
      mode = 'focus';
      setRemainingFromMinutes(focusMinutes);
    }

    if (autoAdvance) startTimer();
  }

  function startFocus() {
    mode = 'focus';
    setRemainingFromMinutes(focusMinutes);
    startTimer();
  }

  function startShortBreak() {
    mode = 'short-break';
    setRemainingFromMinutes(shortBreakMinutes);
    startTimer();
  }

  function startLongBreak() {
    mode = 'long-break';
    setRemainingFromMinutes(longBreakMinutes);
    startTimer();
  }

  function updateFocusMinutes(value) {
    focusMinutes = Number(value) || 25;
    if ((mode === 'focus' || mode === 'idle') && !running) setRemainingFromMinutes(focusMinutes);
  }

  function updateShortBreakMinutes(value) {
    shortBreakMinutes = Number(value) || 5;
    if (mode === 'short-break' && !running) setRemainingFromMinutes(shortBreakMinutes);
  }

  function updateLongBreakMinutes(value) {
    longBreakMinutes = Number(value) || 25;
    if (mode === 'long-break' && !running) setRemainingFromMinutes(longBreakMinutes);
  }

  function playAlarm() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [
      { freq: 523.25, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.4 },
      { freq: 0, duration: 0.3 },
      { freq: 523.25, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.4 },
      { freq: 0, duration: 0.3 },
      { freq: 523.25, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.4 },
      { freq: 0, duration: 0.3 }
    ];

    let time = audioContext.currentTime;

    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

      oscillator.start(time);
      oscillator.stop(time + note.duration);
      time += note.duration;
    });

    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 300]);
  }

  $effect(() => {
    return () => stopTimer();
  });
</script>

<svelte:head>
  <title>뽀모도로 · Time Tools</title>
</svelte:head>

<div class="container">
  <div class="status">
    <span class="mode">{modeLabel()}</span>
    <span class="sets">완료된 집중 세트: {completedFocusCount}세트</span>
  </div>

  <div class="total-focus-time">
    <span>총 집중 {formatTotalFocusTime(totalFocusTimeMs)}</span>
  </div>

  <div class="main-display">
    <div class="timer-circle">
      <svg class="progress-ring" viewBox="0 0 140 140" aria-hidden="true">
        <!-- 배경 원 -->
        <circle
          class="progress-ring-bg"
          cx="70" cy="70" r={RADIUS}
          stroke-width="10"
          fill="transparent"
          stroke-dasharray={CIRCUMFERENCE}
          stroke-dashoffset="0"
        />
        <!-- 진행 원 - 12시에서 시계방향으로 채워짐 -->
        <circle
          class="progress-ring-progress"
          cx="70" cy="70" r={RADIUS}
          stroke-width="10"
          fill="transparent"
          stroke-dasharray={CIRCUMFERENCE}
          stroke-dashoffset={progressDashoffset}
        />
      </svg>

      <h2 class="timer-text">{formattedTime()}</h2>
    </div>
  </div>

  <div class="auto-advance-toggle">
    <button
      class="toggle-btn"
      onclick={() => (autoAdvance = !autoAdvance)}
    >
      {autoAdvance ? '수동으로 세트 넘기기' : '자동으로 세트 넘기기'}
    </button>
  </div>

  <!-- svelte-ignore a11y_label_has_associated_control -->
  <div class="settings">
    <div class="setting-group">
      <label>집중 시간 (분)</label>
      <input type="number" min="1" max="180" bind:value={focusMinutes} placeholder="25"
        onchange={(e) => updateFocusMinutes(e.target.value)} />
    </div>

    <div class="setting-group">
      <label>짧은 휴식 (분)</label>
      <input type="number" min="1" max="60" bind:value={shortBreakMinutes} placeholder="5"
        onchange={(e) => updateShortBreakMinutes(e.target.value)} />
    </div>

    <div class="setting-group">
      <label>긴 휴식 (분)</label>
      <input type="number" min="1" max="120" bind:value={longBreakMinutes} placeholder="25"
        onchange={(e) => updateLongBreakMinutes(e.target.value)} />
    </div>
  </div>

  <div class="main-buttons">
    <button onclick={startFocus} disabled={running && mode === 'focus'}>집중 시작</button>
    <button onclick={startShortBreak} disabled={running && mode === 'short-break'}>짧은 휴식</button>
    <button onclick={startLongBreak} disabled={running && mode === 'long-break'}>긴 휴식</button>
  </div>

  <div class="controls">
    <button onclick={startTimer} disabled={running}>시작</button>
    <button onclick={stopTimer} disabled={!running}>정지</button>
    <button onclick={resetTimer}>초기화</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    max-width: 760px;
    margin: -24px auto 20px;
    padding: 20px;

    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;

    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR",
      "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  .status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-size: 14px;
  }

  .status .mode {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface-2);

    color: var(--text);
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .status .sets {
    font-size: 13px;
    color: var(--muted);
  }

  .total-focus-time {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 700;
    color: var(--primary);
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }

  .total-focus-time span {
    background: rgba(37, 99, 235, 0.08);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(37, 99, 235, 0.2);
  }

  .main-display {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 8px 0;
    position: relative;
  }

  .timer-circle {
    position: relative;
    width: 260px;
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timer-text {
    position: absolute;
    margin: 0;
    font-size: 40px;
    line-height: 1.05;
    font-weight: 750;
    letter-spacing: 0.01em;
    font-family: inherit;
    font-variant-numeric: tabular-nums;
    z-index: 2;
    color: var(--text);
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg); /* 12시방향 시작점 */
    transform-origin: 50% 50%;
  }

  .progress-ring-bg {
    stroke: var(--border);
    opacity: 0.35;
  }

  .progress-ring-progress {
    stroke: var(--primary);
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-dashoffset 0.08s linear !important;
  }

  .auto-advance-toggle {
    display: flex;
    justify-content: center;
  }

  .toggle-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--primary);
    color: var(--btn-text);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .toggle-btn:hover {
    background: var(--hover);
  }

  .settings {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-2);
  }

  .setting-group label {
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  .setting-group input {
    width: 92px;
    padding: 10px 10px;
    text-align: right;

    background: var(--control-bg);
    color: var(--control-text);
    border: 1px solid var(--control-border);
    border-radius: 10px;

    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .setting-group input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--ring);
  }

  .main-buttons,
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  button {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid transparent;

    background: var(--primary);
    color: var(--btn-text);

    cursor: pointer;
    font-weight: 700;
    font-size: 14px;

    transition: background 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }

  button:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px var(--ring);
  }

  button:disabled {
    background: var(--btn-disabled-bg);
    color: var(--btn-disabled-text);
    cursor: not-allowed;
  }

  .main-buttons button {
    background: transparent;
    color: var(--text);
    border-color: var(--border);
  }

  .main-buttons button:hover:not(:disabled) {
    background: rgba(148, 163, 184, 0.10);
  }

  @media (max-width: 480px) {
    .container {
      margin: -36px auto 10px;
      padding: 14px;
      gap: 12px;
    }

    .timer-circle {
      width: 220px;
      height: 220px;
    }

    .timer-text {
      font-size: 32px;
    }

    .settings {
      width: 100%;
      flex-wrap: nowrap;
      gap: 8px;
      justify-content: space-between;
    }

    .setting-group {
      flex: 1 1 0;
      min-width: 0;
      padding: 8px 8px;
    }

    .setting-group input {
      width: 80%;
      padding: 9px 8px;
    }

    .setting-group label {
      font-size: 11px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-buttons {
      width: 100%;
      flex-wrap: nowrap;
      gap: 8px;
    }

    .main-buttons button {
      flex: 1 1 0;
      min-width: 0;
      padding: 10px 8px;
      font-size: 13px;
      white-space: nowrap;
    }

    .controls {
      width: 100%;
      flex-wrap: nowrap;
      gap: 8px;
    }

    .controls button {
      flex: 1 1 0;
      max-width: 60px;
      min-height: 40px;
      padding: 6px 10px;
      font-size: 14px;
      white-space: nowrap;
    }
  }
</style>