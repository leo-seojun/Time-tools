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
  let mobileMenuOpen = $state(false);

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

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
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
    <!-- ✅ 모바일용 햄버거/드롭다운 버튼 (로고 왼쪽) -->
    <button
      type="button"
      class="mobile-menu-toggle"
      onclick={toggleMobileMenu}
      aria-label="메뉴 열기"
    >
      <Icon
        icon={mobileMenuOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'}
        width="22"
        height="22"
      />
    </button>

    <a href="/" class="logo" onclick={closeMobileMenu}>
      <img src="/logo.png" alt="logo" /> Time Tools
    </a>

    <!-- ✅ 데스크톱/태블릿 nav -->
    <div class="nav-links">
      <a href="/timer" class="nav-item {currentPath === '/timer' ? 'active' : ''}">타이머</a>
      <a href="/stopwatch" class="nav-item {currentPath === '/stopwatch' ? 'active' : ''}">스톱워치</a>
      <a href="/pomodoro" class="nav-item {currentPath === '/pomodoro' ? 'active' : ''}">뽀모도로</a>
      <a href="/clock" class="nav-item {currentPath === '/clock' ? 'active' : ''}">현재 시각</a>
      <a href="/todo" class="nav-item {currentPath === '/todo' ? 'active' : ''}">할일 관리</a>
    </div>

    <div class="spacer" />

  </nav>

  <!-- ✅ 모바일 전용 드롭다운 메뉴 (세로) -->
  {#if mobileMenuOpen}
    <div class="mobile-nav-menu">
      <a href="/timer" class="mobile-nav-item {currentPath === '/timer' ? 'active' : ''}" onclick={closeMobileMenu}>
        타이머
      </a>
      <a href="/stopwatch" class="mobile-nav-item {currentPath === '/stopwatch' ? 'active' : ''}" onclick={closeMobileMenu}>
        스톱워치
      </a>
      <a href="/pomodoro" class="mobile-nav-item {currentPath === '/pomodoro' ? 'active' : ''}" onclick={closeMobileMenu}>
        뽀모도로
      </a>
      <a href="/clock" class="mobile-nav-item {currentPath === '/clock' ? 'active' : ''}" onclick={closeMobileMenu}>
        현재 시각
      </a>
      <a href="/todo" class="mobile-nav-item {currentPath === '/todo' ? 'active' : ''}" onclick={closeMobileMenu}>
        할일 관리
      </a>
      <a href="/about" class="mobile-nav-item {currentPath === '/about' ? 'active' : ''}" onclick={closeMobileMenu}>
        About
      </a>
    </div>
  {/if}

  <div class="theme-toggle">
    <button type="button" onclick={toggleTheme} class="theme-btn">
      <Icon
        icon={darkMode ? 'material-symbols:light-mode-rounded' : 'material-symbols:dark-mode-rounded'}
        width="24"
        height="24"
      />
    </button>
  </div>

  <div class="about">
    <a href="/about">
      <button class="about-btn">About</button>
    </a>
  </div>

  {#key currentPath}
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
  position: relative;
}

/* 로고 */
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

.logo img {
  height: 40px;
  width: auto;
  border-radius: 4px;
}

/* 데스크톱 nav 링크 */
.nav-links {
  display: flex;
  gap: 1.5rem;
  margin-left: auto;
  margin-right: auto;
}

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

.spacer {
  flex: 1;
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


/* ✅ 모바일 메뉴 토글 버튼 (로고 왼쪽) */
.mobile-menu-toggle {
  display: none; /* 기본은 숨김, 모바일에서만 표시 */
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  width: 38px;
  height: 38px;
  margin-right: 0.5rem;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

/* .mobile-menu-toggle:hover {
  background: var(--hover);
  transform: scale(1.05);
} */

/* ✅ 모바일 전용 드롭다운 메뉴 */
.mobile-nav-menu {
  display: none; /* 모바일에서만 보이게 */
}

/* 모바일 구간 */
@media (max-width: 480px) {
  .main-nav {
    padding: 0.75rem 1rem;
    height: auto;
    gap: 0.5rem;
  }

  .mobile-menu-toggle {
    display: inline-flex;
  }

  .logo {
    font-size: 1.1rem;
    padding: 0.5rem 0.75rem;
  }

  .logo img {
    height: 24px;
  }

  /* ✅ 기존 가로 nav 숨기기 */
  .nav-links {
    display: none;
  }

  .spacer {
    display: none;
  }

  /* ✅ 모바일 드롭다운 메뉴 노출 */
  .mobile-nav-menu {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 1rem 0.75rem;
    border-top: 1px solid var(--border);
    background: var(--bg);
  }

  .mobile-nav-item {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text);
    font-size: 0.9rem;
    display: block;
    transition: background 0.15s ease, transform 0.1s ease;
  }

  /* .mobile-nav-item:hover {
    background: var(--hover);
    transform: translateX(2px);
  } */

  .mobile-nav-item.active {
    background: var(--link-active-bg);
    font-weight: 600;
  }

  .theme-toggle {
    top: 16px;
    right: 16px;
  }

  .theme-btn {
    padding: 0.4rem;
    width: 35px;
    height: 35px;
  }

  .page-content {
    padding: 60px 16px 16px;
  }

  .about {
    display: none;
  }
}

/* 태블릿, 데스크톱은 기존 스타일 유지 */
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

@media (min-width: 1025px) {
  .page-content {
    max-width: 1000px;
  }
}
</style>
