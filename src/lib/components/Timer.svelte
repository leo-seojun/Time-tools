<svelte:options runes />

<script>
  import '../../app.css'
  // 상태
  let running = $state(false);
  let targetMs = $state(60 * 1000);  // 기본 60초
  let elapsedMs = $state(0);
  let lastTick = 0;
  let intervalId = null;
  let audioContext = null;

  // 시/분/초 입력 상태
  let hours = $state(0);
  let minutes = $state(1);
  let seconds = $state(0);

  // 모바일 여부 감지
  let isMobile = $state(false);

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  // 리사이즈 감지
  $effect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  function start() {
    if (running) return;
    running = true;
    elapsedMs = 0;
    lastTick = performance.now();
    intervalId = setInterval(() => {
      const now = performance.now();
      elapsedMs = elapsedMs + (now - lastTick);
      lastTick = now;
      
      if (elapsedMs >= targetMs) {
        elapsedMs = targetMs;
        playAlarm();
        stop();
      }
    }, 10);
  }

  function stop() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset() {
    stop();
    elapsedMs = 0;
  }

  // 시/분/초 입력으로 설정
  function setFromInputs() {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    targetMs = totalSeconds * 1000;
    reset();
  }

  // 빠른 설정 버튼들
  function setDuration(totalSeconds) {
    hours = Math.floor(totalSeconds / 3600);
    minutes = Math.floor((totalSeconds % 3600) / 60);
    seconds = totalSeconds % 60;
    targetMs = totalSeconds * 1000;
    reset();
  }

  // 남은 시간 포맷
  function formatRemaining() {
    const remainingMs = Math.max(0, targetMs - elapsedMs);
    const totalSeconds = remainingMs / 1000;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = (totalSeconds % 60).toFixed(2);

    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = (Number(s) < 10 ? '0' : '') + s;
    return `${hh}:${mm}:${ss}`;
  }

  $effect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });

  let formatted = $derived(formatRemaining())

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      setFromInputs();
    }
  }

  function playAlarm() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 꽤 잘 들리는 3음 멜로디 (최대 볼륨에 가깝게)
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

    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';

      // ★ 볼륨: 0.8 (상당히 크게)
      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

      oscillator.start(time);
      oscillator.stop(time + note.duration);
      time += note.duration;
    });

    // 진동 (모바일 지원 시)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  }
</script>

<svelte:head>
  <title>타이머 · Time tools</title>
</svelte:head>

<div class="container">
  <!-- 시계도 버튼처럼 중앙 배치 -->
  <div class="main-display">
    <h2>{formatted}</h2>
  </div>

  <!-- 시:분:초 입력 -->
  <div class="time-inputs">
    <input 
      type="number" 
      bind:value={hours}
      min="0" max="23"
      placeholder="시"
      size="2"
      onkeydown={handleKeydown}
    />
    :
    <input 
      type="number" 
      bind:value={minutes}
      min="0" max="59"
      placeholder="분"
      size="2"
      onkeydown={handleKeydown}
    />
    :
    <input 
      type="number" 
      bind:value={seconds}
      min="0" max="59"
      placeholder="초"
      size="2"
      onkeydown={handleKeydown}
    />
    <button onclick={setFromInputs}>설정</button>
  </div>

  <!-- 모바일에서는 숨김, 데스크톱에서만 보이는 빠른 설정 버튼들 -->
  {#if !isMobile}
    <div class="quick-buttons">
      <button onclick={() => setDuration(10)}>10초</button>
      <button onclick={() => setDuration(30)}>30초</button>
      <button onclick={() => setDuration(60)}>1분</button>
      <button onclick={() => setDuration(180)}>3분</button>
      <button onclick={() => setDuration(300)}>5분</button>
      <button onclick={() => setDuration(600)}>10분</button>
      <button onclick={() => setDuration(1800)}>30분</button>
      <button onclick={() => setDuration(3600)}>1시간</button>
    </div>
  {/if}

  <!-- 제어 버튼 -->
  <div class="main-buttons">
    <button onclick={start} disabled={running}>시작</button>
    <button onclick={stop} disabled={!running}>정지</button>
    <button onclick={reset}>초기화</button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    max-width: 760px;
    margin: 24px auto;
    padding: 20px;

    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;

    /* 강한 그림자 대신 거의 없는 수준으로만 */
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  .main-display {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .main-display h2 {
    margin: 0;
    /* 모바일: 36px, 데스크톱: 56px */
    font-size: clamp(36px, 8vw, 56px);
    line-height: 1.05;
    font-family: system-ui, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    letter-spacing: 0.02em;
    color: var(--text);
  }

  .time-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
    font-size: 15px;
  }

  .time-inputs input {
    width: 64px;
    padding: 10px 10px;
    text-align: center;

    background: var(--control-bg);
    color: var(--control-text);
    border: 1px solid var(--control-border);
    border-radius: 10px;

    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.15s ease, background 0.2s ease, color 0.2s ease;
  }

  .time-inputs input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--ring);
  }

  .quick-buttons,
  .main-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  /* 버튼: 미니멀(과한 입체감/변형 제거) */
  button {
    padding: 10px 14px;
    margin-left: 10px;
    border-radius: 10px;
    border: 1px solid transparent;

    background: var(--primary);
    color: var(--btn-text);

    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
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

  /* Quick 버튼은 "강조색" 대신 중립(심플) */
  .quick-buttons button {
    background: transparent;
    color: var(--text);
    border-color: var(--border);
  }

  .quick-buttons button:hover:not(:disabled) {
    background: rgba(148, 163, 184, 0.12); /* light/dark 모두 무난 */
    border-color: var(--control-border);
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    .container {
      margin: 12px auto;
      padding: 16px;
      gap: 12px;
    }

    .time-inputs {
      gap: 4px;
      font-size: 14px;
    }

    .time-inputs input {
      width: 52px;
      padding: 8px 6px;
      font-size: 16px; /* 모바일 입력 필드 최적화 */
    }

    .main-buttons {
      gap: 6px;
    }

    button {
      padding: 6px 10px;
      font-size: 14px; /* 모바일 터치 영역 최적화 */
      min-height: 40px;
      min-width: 60px;
    }
  }
</style>
