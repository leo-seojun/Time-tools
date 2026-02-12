<svelte:options runes />

<script>
  let running = $state(false);
  let elapsedMs = $state(0);
  let lastTick = 0;
  let intervalId = null;

  // 랩타임 목록 (문자열 배열)
  let laps = $state([]);

  function start() {
    if (running) return;
    running = true;
    lastTick = performance.now();
    intervalId = setInterval(() => {
      const now = performance.now();
      elapsedMs = elapsedMs + (now - lastTick);
      lastTick = now;
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
    laps = []; // 랩타임도 같이 초기화
  }

  // 경과 시간 포맷 (HH:MM:SS.ss)
  function formatElapsed(ms = elapsedMs) {
    const totalSeconds = ms / 1000;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = (totalSeconds % 60).toFixed(2);

    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = (Number(s) < 10 ? '0' : '') + s;
    return `${hh}:${mm}:${ss}`;
  }

  // 랩타임 기록
  function addLap() {
    if (!running && elapsedMs === 0) return; // 완전 초기 상태에서는 무시
    laps.push({
      time: formatElapsed(),
      ms: elapsedMs
    });
  }

  $effect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });

  let formatted = $derived(formatElapsed());
</script>

<svelte:head>
  <title>스톱워치 · Time tools</title>
</svelte:head>

<div class="container">
  <!-- 시계 중앙 표시 -->
  <div class="main-display">
    <h2>{formatted}</h2>
  </div>

  <!-- 제어 버튼 + 랩타임 버튼 -->
  <div class="main-buttons">
    <button onclick={start} disabled={running}>시작</button>
    <button onclick={stop} disabled={!running}>정지</button>
    <button onclick={reset}>초기화</button>
    <button onclick={addLap} disabled={!running && elapsedMs === 0}>랩 기록</button>
  </div>

  <!-- 랩타임 리스트 -->
  <!-- 기존 코드에서 .laps 부분만 수정 -->

<!-- 랩타임 리스트 (스크롤 가능) -->
{#if laps.length > 0}
  <div class="laps">
    <h3>랩타임</h3>
    <div class="laps-scroll">
      <ul>
        {#each laps as lap, index}
          <li>
            <span class="lap-index">랩 {index + 1}</span>
            <span class="lap-time">{lap.time}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}


</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    max-width: 760px;
    margin: 24px auto;
    padding: 60px 0;

    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;

    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

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
    font-size: 56px;
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: 0.01em;

    font-family: inherit;
    font-variant-numeric: tabular-nums;
  }

  .main-buttons {
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
    font-weight: 600;
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

  /* laps */
  .laps {
    width: 100%;
    max-width: 440px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: transparent;
    padding: 12px;
  }

  .laps h3 {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--muted);
    text-align: center;
    letter-spacing: 0.02em;
  }

  .laps-scroll {
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--control-bg);
  }

  .laps-scroll ul {
    list-style: none;
    padding: 6px;
    margin: 0;
  }

  .laps-scroll li {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    padding: 10px 10px;
    border-radius: 8px;

    color: var(--text);
  }

  .laps-scroll li + li {
    margin-top: 6px;
  }

  .laps-scroll li:hover {
    background: rgba(148, 163, 184, 0.10);
  }

  .lap-index {
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
  }

  .lap-time {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  /* scrollbar (심플하게) */
  .laps-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
  }

  .laps-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .laps-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .laps-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.55);
    border-radius: 999px;
  }

  .laps-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }
</style>
