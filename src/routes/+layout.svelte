<svelte:options runes />

<script>
  import '../app.css';
  import { slide, fade, scale } from 'svelte/transition';
  import { page } from '$app/state';
  import { onMount, tick } from 'svelte';
  import Icon from '@iconify/svelte';

  const currentPath = $derived(page.url.pathname);
  let darkMode = $state(false);
  let pageTransition = $state(slide);

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

  // 👇 2. 네비 active 클래스 동적 업데이트
  $effect(() => {
    // 클래스 전환 애니메이션
    tick().then(() => {
      document.querySelectorAll('.nav-item').forEach(link => {
        link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      });
    });
  });
</script>

<div class="app-root {theme}">
  <nav class="main-nav">
    <a href="/" class="logo">
      <img src="/logo.png" alt="logo"> Time Tools
    </a>

    <div class="nav-links">
      <a href="/timer" class="nav-item {currentPath === '/timer' ? 'active' : ''}">
        타이머
      </a>
      <a href="/stopwatch" class="nav-item {currentPath === '/stopwatch' ? 'active' : ''}">
        스톱워치
      </a>
      <a href="/pomodoro" class="nav-item {currentPath === '/pomodoro' ? 'active' : ''}">
        뽀모도로
      </a>
      <a href="/clock" class="nav-item {currentPath === '/clock' ? 'active' : ''}">
        현재 시각
      </a>
    </div>

    <div class="spacer"></div>
  </nav>

  <div class="theme-toggle">
    <button type="button" onclick={toggleTheme} class="theme-btn">
      <Icon
        icon={darkMode ? 'material-symbols:light-mode-rounded' : 'material-symbols:dark-mode-rounded'}
        width="24" height="24"
      />
    </button>
  </div>

  <div class="about">
    <a href="/about">
      <button class="about-btn">About</button>
    </a>
  </div>

  {#key currentPath}
    <!-- svelte-ignore slot_element_deprecated -->
    <div class="page-content" in:slide={pageTransition} out:fade={{ duration: 100 }}>
      <slot />
    </div>
  {/key}
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
    margin-right: auto;
  }

  .spacer {
    flex: 1;
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

  .theme-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: transparent;
    backdrop-filter: blur(20px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .theme-btn:hover {
    transform: scale(1.05) rotate(360deg);
    /* border-color: var(--primary); */
    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.2);
    background: var(--hover);
    color: var(--primary);
  }

  .theme-btn:active {
    transform: scale(0.98);
  }

  .about {
    display: flex;
    justify-content: right;
  }

  .about button {
    padding: .5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: transparent;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text);
    transition: background .2s ease, color 0.2s ease;
  }

  .about button:hover {
    background: var(--border);
  }

  .page-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 80px 20px 20px;
  }

  /* 모바일 우선: 네비 바 간소화 */
  @media (max-width: 480px) {
    .main-nav {
      padding: 0.75rem 1rem;
      height: auto;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-links {
      margin: 0;
      order: 3;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .logo {
      font-size: 20px;
      padding: 0.5rem 0.75rem;
      margin: 0 auto;
      margin-left: 0;
      order: 1;
    }

    .logo img {
      height: 24px;
    }

    .nav-links {
      padding: 10px 15px;
      font-size: 10px;
    }

    .nav-links a {
      padding: 8px 14px;
    }

    .about button {
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }

    .spacer {
      display: none;
    }

    .page-content {
      padding: 60px 16px 16px;
    }

    .theme-toggle {
      top: 16px;
      right: 16px;
    }

    .theme-btn {
      padding: 8px;
      width: 40px;
      height: 40px;
    }

    .theme-btn:hover {
      transform: scale(1.05) rotate(0deg);
      border-color: var(--primary);
      box-shadow: 0 8px 32px rgba(37, 99, 235, 0.2);
      background: var(--hover);
    }
  }

  /* 태블릿: 가로 배치 유지 but 간격 축소 */
  @media (min-width: 760px) and (max-width: 1024px) {
    .main-nav {
      padding: 1rem;
      gap: 0.25rem;
      font-size: 14px;
    }

    .nav-links {
      gap: 1rem;
    }

    .logo {
      font-size: 20px;
    }

    .logo img {
      height: 32px;
    }
  }

  /* 데스크톱: 기존 유지 but max-width 추가 */
  @media (min-width: 1025px) {
    .page-content {
      max-width: 1000px;
    }
  }
</style>
