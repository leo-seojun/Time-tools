<script>
	import { title } from 'process';
  import '../../app.css'

  let now = $state(new Date());
  let is24h = $state(true); // true: 24h, false: 12h

  // 네이버 서버 시간 가져오기
  async function fetchNaverTime() {
    try {
      const response = await fetch(
        'https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=%EC%8B%A4%EC%8B%9C%EA%B0%84'
      );
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const timeElement = doc.querySelector('.timeit_txt strong');

      if (timeElement) {
        const serverTimeStr = timeElement.textContent.trim();
        const [h, m, s] = serverTimeStr.split(':').map(Number);
        const today = new Date();
        const serverTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          h,
          m,
          s
        );
        now = serverTime;
        return serverTime;
      }
    } catch (error) {
      console.warn('네이버 시간 가져오기 실패, 로컬 시간 사용:', error);
    }

    try {
      const response = await fetch('https://www.naver.com');
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const gmtDate = new Date(dateHeader);
        gmtDate.setHours(gmtDate.getHours() + 9);
        now = gmtDate;
        return gmtDate;
      }
    } catch (error) {
      console.warn('대체 시간 가져오기 실패:', error);
    }

    now = new Date();
    return now;
  }

  $effect(() => {
    fetchNaverTime();
  });

  $effect(() => {
    const interval = setInterval(async () => {
      await fetchNaverTime();
    }, 1000);

    return () => clearInterval(interval);
  });

  // 24h 형식: HH:MM:SS
  function formatTime24(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // 12h 형식: 시간만 반환 (period 별도)
  function formatTime12(date) {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    
    h = h % 12;
    if (h === 0) h = 12;
    const hh = h.toString().padStart(2, '0');

    return `${hh}:${m}:${s}`;
  }

  // 오전/오후 텍스트
  function getPeriod(date) {
    return date.getHours() >= 12 ? '오후' : '오전';
  }

  // 날짜 형식: YYYY.MM.DD (요일)
  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];

    return `${year}.${month}.${day} ${weekday}`;
  }
</script>

<svelte:head>
  <title>현재 시각 · Time Tools</title>
</svelte:head>

<div class="clock-container">
  <div class="top-row">
    <button
      class="mode-toggle"
      onclick={() => (is24h = !is24h)}
    >
      {is24h ? '12h' : '24h'}
    </button>
  </div>

  <div class="time-display">
    {#if is24h}
      {formatTime24(now)}
    {:else}
      <span class="time-main">{formatTime12(now)}</span>
      <span class="period">{getPeriod(now)}</span>
    {/if}
  </div>

  <div class="date-row">
    <div class="date-display">
      {formatDate(now)}
    </div>
    <div class="source">네이버 서버 시간</div>
  </div>
</div>

<style>
  .clock-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    padding: 48px 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;

    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR",
      sans-serif;

    transition: all 0.2s ease;
  }

  .top-row {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding: 0 24px;
    box-sizing: border-box;
  }

  .mode-toggle {
    padding: 6px 10px;
    margin-left: 40px;
    border-radius: 999px;
    border: 1px solid var(--primary);
    background: var(--primary);
    color: var(--btn-text);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  }

  .mode-toggle:hover {
    background: var(--primary-hover);
  }

  .mode-toggle:active {
    transform: translateY(1px);
  }

  .time-display {
    display: flex;
    align-items: baseline;
    gap: 6px;

    font-size: clamp(48px, 12vw, 96px);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--text);

    text-shadow:
      0 0 8px rgba(0,0,0,0.1),
      0 2px 4px rgba(0,0,0,0.05);
  }

  .time-main {
    display: contents; /* 부모 flex에 포함되도록 */
  }

  .period {
    font-size: 0.28em;
    font-weight: 500;
    color: var(--muted);
    opacity: 0.85;
    letter-spacing: 0.02em;
  }

  .date-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .date-display {
    margin-top: 1rem;
    font-size: clamp(16px, 3.5vw, 22px);
    font-weight: 400;
    color: var(--text);
    letter-spacing: 0.03em;
  }

  .source {
    font-size: 12px;
    font-weight: 400;
    color: var(--muted);
    opacity: 0.6;
    letter-spacing: 0.02em;
    margin-top: 0.75rem;
  }

  @media (prefers-color-scheme: dark) {
    .time-display {
      text-shadow:
        0 0 12px rgba(255,255,255,0.1),
        0 2px 4px rgba(0,0,0,0.3);
    }
  }

  @media (max-width: 480px) {
    .clock-container {
      padding: 20px;
      gap: 6px;
    }

    .top-row {
      padding: 0 12px;
    }

    .mode-toggle {
      font-size: 12px;
      padding: 6px 8px;
      margin-left: 0;
    }

    .time-display {
      font-size: 52px;
      gap: 4px;
    }

    .period {
      font-size: 0.25em;
    }

    .date-display {
      margin-top: 0.3rem;
      font-size: 20px;
    }

    .source {
      margin-top: 0.5rem;
      font-size: 10px;
    }
  }
</style>
