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
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .theme-toggle button {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
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
</style>
