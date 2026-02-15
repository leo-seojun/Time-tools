<svelte:options runes />

<script>
  import '../app.css'

  const items = [
    { href: '/timer', title: '타이머', desc: '시간을 설정하고 알람으로 종료를 알려요.' },
    { href: '/stopwatch', title: '스톱워치', desc: '랩 기록과 함께 경과 시간을 측정해요.' },
    { href: '/pomodoro', title: '뽀모도로', desc: '집중/휴식 사이클로 효율적으로 집중해요.' }
  ];
</script>

<svelte:head>
  <title>Home · Time tools</title>
</svelte:head>

<div class="home">
  <h1 class="title">Time Tools</h1>
  <p class="subtitle">원하는 기능을 선택해서 바로 시작하세요.</p>

  <div class="grid">
    {#each items as item}
      <a
        class="card"
        href={item.href}
        data-sveltekit-preload-data="hover"
      >
        <div class="card-title">{item.title}</div>
        <div class="card-desc">{item.desc}</div>
      </a>
    {/each}
  </div>
</div>

<style>
  .home {
  max-width: 760px;
  margin: 24px auto;
  padding: 40px 20px;

  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;

  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR",
    "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
}

/* 제목/부제목 기본 */
.title {
  margin: 0;
  font-size: clamp(24px, 4vw, 32px); /* 반응형 폰트 */
  font-weight: 800;
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 8px 0 24px; /* 여백 증가 */
  color: var(--muted);
  font-size: clamp(14px, 2.5vw, 16px);
}

/* 그리드: 모바일 우선, 자동 조정 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* 베스트 프랙티스 [web:43] */
  gap: clamp(12px, 3vw, 20px);
}

/* 명시적 브레이크포인트 */
@media (max-width: 768px) {
  .home {
    margin: 16px;
    padding: 32px 16px;
    border-radius: 8px;
  }

  .grid {
    grid-template-columns: 1fr; /* 단일 컬럼 확실히 */
  }

  .card {
    padding: 20px; /* 터치 영역 확대 */
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* 태블릿 2열 */
    gap: 16px;
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(3, 1fr); /* 데스크톱 3열 */
  }
}

/* 카드 스타일 (기존 유지 + 호버 강화) */
.card {
  display: block;
  padding: clamp(14px, 4vw, 18px);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  background: transparent;
  transition: all 0.2s ease;
}

.card:hover {
  background: var(--hover);
  transform: translateY(-2px);
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.1); */
}

.card-title {
  font-weight: 800;
  font-size: clamp(16px, 3vw, 18px);
  margin-bottom: 6px;
}

.card-desc {
  color: var(--muted);
  font-size: clamp(13px, 2.2vw, 14px);
  line-height: 1.5;
}

</style>
