<svelte:options runes />

<script>
  // 모드: focus(집중), short-break(짧은 휴식), long-break(긴 휴식), idle
  let mode = $state('idle');

  // 세트 카운트 (현재까지 끝낸 집중 세션 수)
  let completedFocusCount = $state(0);

  // 남은 시간(ms)
  let remainingMs = $state(25 * 60 * 1000);

  // 사용자 설정 (분 단위)
  let focusMinutes = $state(25);
  let shortBreakMinutes = $state(5);
  let longBreakMinutes = $state(25);

  let running = $state(false);
  let lastTick = 0;
  let intervalId = null;
  let audioContext = null;

  // 현재 세트 번호 (1부터 시작, focus 모드일 때만 +1)
  let currentSet = $derived(completedFocusCount + (mode === 'focus' ? 1 : 0));

  // ms → HH:MM:SS 형식
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

  // ★ $derived 대신 함수로 변경 — 컴파일러 버그 회피
  function modeLabel() {
    if (mode === 'focus') {
      return '집중';
    }
    if (mode === 'short-break') {
      return '짧은 휴식';
    }
    if (mode === 'long-break') {
      return '긴 휴식';
    }
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

  // ★ 처음 재생(또는 idle 상태)일 때 자동으로 집중 모드로 세팅
  if (mode === 'idle') {
    mode = 'focus';
    setRemainingFromMinutes(focusMinutes);
  }

  running = true;
  lastTick = performance.now();

  intervalId = setInterval(() => {
    const now = performance.now();
    const diff = now - lastTick;
    lastTick = now;
    remainingMs = remainingMs - diff;

    if (remainingMs <= 0) {
      remainingMs = 0;
      handlePhaseEnd();
    }
  }, 200);
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
    // 현재 모드에 맞는 기본 시간으로 되돌리기
    if (mode === 'focus') {
      setRemainingFromMinutes(focusMinutes);
    } else if (mode === 'short-break') {
      setRemainingFromMinutes(shortBreakMinutes);
    } else if (mode === 'long-break') {
      setRemainingFromMinutes(longBreakMinutes);
    } else {
      // idle일 때 기본값은 집중 시간 기준
      setRemainingFromMinutes(focusMinutes);
    }
  }

  // 모드 전환 로직
  function handlePhaseEnd() {
    stopTimer();

    playAlarm();

    if (mode === 'focus') {
      completedFocusCount = completedFocusCount + 1;

      // 4세트마다 긴 휴식
      if (completedFocusCount % 4 === 0) {
        mode = 'long-break';
        setRemainingFromMinutes(longBreakMinutes);
      } else {
        mode = 'short-break';
        setRemainingFromMinutes(shortBreakMinutes);
      }
    } else if (mode === 'short-break' || mode === 'long-break') {
      // 휴식 끝나면 다시 집중
      mode = 'focus';
      setRemainingFromMinutes(focusMinutes);
    }

    // 여기서는 자동 시작 X (사용자가 다시 재생/시작을 눌러야 함)
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

  // 설정 변경 시 현재 모드에 맞춰 남은 시간도 같이 조정
  function updateFocusMinutes(value) {
    focusMinutes = Number(value) || 0;
    if (mode === 'focus' || mode === 'idle') {
      setRemainingFromMinutes(focusMinutes);
    }
  }

  function updateShortBreakMinutes(value) {
    shortBreakMinutes = Number(value) || 0;
    if (mode === 'short-break') {
      setRemainingFromMinutes(shortBreakMinutes);
    }
  }

  function updateLongBreakMinutes(value) {
    longBreakMinutes = Number(value) || 0;
    if (mode === 'long-break') {
      setRemainingFromMinutes(longBreakMinutes);
    }
  }

  function playAlarm() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // ★ 더 부드럽고 인지하기 쉬운 3음 멜로디
    const notes = [
      { freq: 523.25, duration: 0.2 },  
      { freq: 659.25, duration: 0.2 },  
      { freq: 783.99, duration: 0.4 },   
      { freq: 0, duration: 0.3},
      { freq: 523.25, duration: 0.2 },  
      { freq: 659.25, duration: 0.2 },  
      { freq: 783.99, duration: 0.4 },   
      { freq: 0, duration: 0.3},
      { freq: 523.25, duration: 0.2 },  
      { freq: 659.25, duration: 0.2 },  
      { freq: 783.99, duration: 0.4 },   
      { freq: 0, duration: 0.3},
    ];

    let time = audioContext.currentTime;

    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';  // 부드러운 소리

      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

      oscillator.start(time);
      oscillator.stop(time + note.duration);
      time += note.duration;
    });

    // ★ 모바일 진동 패턴 (더 부드럽게)
    if ('vibrate' in navigator) {
      navigator.vibrate([150, 50, 150, 50, 300]); // 짧게 짧게 길게
    }
}

  $effect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<svelte:head>
  <title>뽀모도로 · Time tools</title>
</svelte:head>

<div class="container">
  <!-- 현재 모드 / 세트 표시 -->
  <div class="status">
    <span class="mode">{modeLabel()}</span>
    <span class="sets">완료된 집중 세트: {completedFocusCount}세트</span>
  </div>

  <!-- 남은 시간 표시 -->
  <div class="main-display">
    <h2>{formattedTime()}</h2>
  </div>

  <!-- 설정 영역 (사용자 정의 집중/휴식 시간) -->
  <div class="settings">
    <div class="setting-group">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label>집중 시간 (분)</label>
      <input
        type="number"
        min="1"
        max="180"
        bindvalue={focusMinutes}
        placeholder="25"
        onchange={(e) => updateFocusMinutes(e.target.value)}
      />
    </div>
    <div class="setting-group">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label>짧은 휴식 (분)</label>
      <input
        type="number"
        min="1"
        max="60"
        bindvalue={shortBreakMinutes}
        placeholder="5"
        onchange={(e) => updateShortBreakMinutes(e.target.value)}
      />
    </div>
    <div class="setting-group">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label>긴 휴식 (분)</label>
      <input
        type="number"
        min="1"
        max="120"
        bindvalue={longBreakMinutes}
        placeholder="25"
        onchange={(e) => updateLongBreakMinutes(e.target.value)}
      />
    </div>
  </div>

  <!-- 메인 제어 버튼 -->
  <div class="main-buttons">
    <button onclick={startFocus} disabled={running && mode === 'focus'}>
      집중 시작
    </button>
    <button onclick={startShortBreak} disabled={running && mode === 'short-break'}>
      짧은 휴식
    </button>
    <button onclick={startLongBreak} disabled={running && mode === 'long-break'}>
      긴 휴식
    </button>
  </div>

  <!-- 재생/일시정지/리셋 -->
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
    margin: -24px auto;
    padding: 20px;

    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;

    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR",
      "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  /* 상태 영역 */
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

  /* 타이머 표시 */
  .main-display {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .main-display h2 {
    margin: 0;
    font-size: 56px;
    line-height: 1.05;
    font-weight: 750;
    letter-spacing: 0.01em;

    font-family: inherit;
    font-variant-numeric: tabular-nums;
  }

  /* 설정 */
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

  /* 버튼 그룹 */
  .main-buttons,
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* 버튼 기본(controls = primary) */
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

  /* 모드 선택 버튼(main-buttons)은 아웃라인으로 (더 심플) */
  .main-buttons button {
    background: transparent;
    color: var(--text);
    border-color: var(--border);
  }

  .main-buttons button:hover:not(:disabled) {
    background: rgba(148, 163, 184, 0.10);
  }

  /* 맨 아래 "소리" 버튼(컨테이너 직계 자식)도 아웃라인 + 작게 */
  .container > button {
    background: transparent;
    color: var(--muted);
    border-color: var(--border);
    padding: 9px 12px;
    font-weight: 700;
  }

  .container > button:hover:not(:disabled) {
    background: rgba(148, 163, 184, 0.10);
    color: var(--text);
  }

  /* 모바일 반응형 */
@media (max-width: 480px) {
  .container {
    margin: 0 auto; /* 모바일에서 위로 당기는 -24px 완화 */
    padding: 14px;
    gap: 12px;
  }

  .main-display h2 {
    font-size: 44px;
  }

  /* 1) 설정: 3개 인풋을 가로로 */
  .settings {
    width: 100%;
    flex-wrap: nowrap;       /* 한 줄 유지 */
    gap: 8px;
    justify-content: space-between;
  }

  .setting-group {
    flex: 1 1 0;             /* 3등분 */
    min-width: 0;            /* 넘침 방지 */
    padding: 8px 8px;
  }

  .setting-group input {
    width: 80%;             /* 그룹 폭에 맞춤 */
    padding: 9px 8px;
  }

  .setting-group label {
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;     /* 라벨이 길면 잘릴 수 있어요 */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 2) 모드 선택 버튼: 3개 가로로 */
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

  /* 3) 재생/일시정지/초기화: 3개 가로로 */
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


