<svelte:options runes />

<script>
  import '../app.css';
  import { slide } from 'svelte/transition';
  import { page } from '$app/state';
  import { onMount } from 'svelte';


  const currentPath = $derived(page.url.pathname);
  let darkMode = $state(false);

  onMount(() => {
    darkMode = document.documentElement.classList.contains('dark');
  });

  function setTheme(isDark) {
    darkMode = isDark;
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }

  function toggleTheme() {
    setTheme(!darkMode);
  }

  const theme = $derived(darkMode ? 'dark' : 'light');

  // ✅ 새로고침/첫 진입 깜빡임 방지: 처음엔 noop, 마운트 후 slide로 교체
  function noop() {
    return { duration: 0 };
  }

  let pageTransition = $state(noop);

  onMount(() => {
    pageTransition = (node) => slide(node, { duration: 250, x: 50 });
  });
</script>


<!-- <svelte:body class:dark={darkMode} class:light={!darkMode} /> -->


<div class="app-root {theme}">
  <nav class="main-nav">
    <!-- 로고: 왼쪽 -->
    <a href="/" class="logo active:{currentPath === '/'}"><img src="/logo.png" alt="logo"> Time Tools</a>

    <!-- 버튼들: 가운데 -->
    <div class="nav-links">
      <a href="/timer" class:active={currentPath === '/timer'}>타이머</a>
      <a href="/stopwatch" class:active={currentPath === '/stopwatch'}>스톱워치</a>
      <a href="/pomodoro" class:active={currentPath === '/pomodoro'}>뽀모도로</a>
    </div>

    <!-- 오른쪽 공간 균형 -->
    <div class="spacer"></div>
  </nav>

  <div class="theme-toggle">
    <!-- svelte-ignore event_directive_deprecated -->
    <button type="button" on:click={toggleTheme}>
      {darkMode ? '라이트 모드' : '다크 모드'}
    </button>
  </div>

  <!-- {#key currentPath} -->
    <!-- svelte-ignore slot_element_deprecated -->
    <div
      class="page-content"
      transition:{pageTransition}
    >
      <slot />
    </div>
  <!-- {/key} -->
</div>


<style>
  .app-root {
    min-height: 100vh;
  }

  .main-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    height: 70px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    flex-shrink: 0;
    text-decoration: none;
    color: inherit;
    transition: none !important;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
    margin-left: auto;
    margin-right: auto; /* 가운데 고정 */
  }

  .spacer {
    flex: 1; /* 오른쪽 공간 */
  }

  /* 공통 링크 스타일 */
  .logo,
  .nav-links a {
    text-decoration: none;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: inherit;
  }

  .nav-links a:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  .logo.active,
  .nav-links a.active {
    /* background: rgba(255, 255, 255, 0.15); */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .logo img {
    height: 40px;
    width: auto;
    border-radius: 4px;
  }


  .theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .theme-toggle button {
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: transparent;
    cursor: pointer;
    font-size: 0.7rem;
    color: var(--link);
    transition: background 0.2s ease, color 0.2s ease;
  }

  .theme-toggle button:hover {
    background: var(--link-hover-bg);
  }

  .page-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 80px 20px 20px;
  }

  /* 기존 스타일 유지 + 추가 */

/* 모바일 우선: 네비 바 간소화 */
@media (max-width: 768px) {
  .main-nav {
    padding: 0.75rem 1rem;
    height: auto;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-links {
    margin: 0;
    order: 3; /* 로고 다음으로 이동 */
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .logo {
    font-size: 1.25rem;
    padding: 0.5rem 0.75rem;
    margin: 0 auto;
    margin-left: 0;
    order: 1;
  }

  .logo img {
    height: 32px;
  }

  .spacer {
    display: none; /* 모바일에서 불필요 */
  }

  .page-content {
    padding: 60px 16px 16px; /* 네비 높이 고려 */
  }

  .theme-toggle {
    top: 16px;
    right: 16px;
  }
}

/* 태블릿: 가로 배치 유지 but 간격 축소 */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-nav {
    padding: 1rem;
    gap: 0.75rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .logo {
    font-size: 1.4rem;
  }
}

/* 데스크톱: 기존 유지 but max-width 추가 */
@media (min-width: 1025px) {
  .page-content {
    max-width: 1000px;
  }
}

</style>
