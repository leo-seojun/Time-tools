<svelte:options runes />

<script>
  import '../app.css'

  const items = [
    { href: '/timer', title: '타이머', desc: '카운트다운을 설정하고 알람으로 종료를 알려요.' },
    { href: '/stopwatch', title: '스톱워치', desc: '랩 기록과 함께 경과 시간을 측정해요.' },
    { href: '/pomodoro', title: '뽀모도로', desc: '집중/휴식 사이클을 설정해서 자동으로 관리해요.' }
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

  .title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .subtitle {
    margin: 8px 0 16px;
    color: var(--muted);
    font-size: 14px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .card {
    display: block;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    background: transparent;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .card:hover {
    background: var(--hover);
  }

  .card-title {
    font-weight: 800;
    font-size: 16px;
    margin-bottom: 6px;
  }

  .card-desc {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.4;
  }
</style>
