<svelte:options runes />

<script>
  let version = $state('v1.2.0');
  let features = $state([
    '타이머, 스톱워치, 뽀모도로 기능',
    '카운트다운 종료 시 알람',
    '다크 모드, 라이트 모드 지원',
    '스톱워치 랩 타임 무제한 기록',
    '뽀모도로 자동 / 수동 세트 전환'
  ]);
  let updateLogs = $state([
    '뽀모도로 타이머 원형 프로그레스 바 생성',
    '긴 휴식 기본 시간 15분으로 수정'
  ])
</script>

<svelte:head>
  <title>About · Time Tools</title>
</svelte:head>

<div class="about-container">
  <!-- 뽀모도로 타이머 설명 섹션 -->
  <h2>Time Tools</h2>
  <section class="pomodoro-intro">
    <h2>뽀모도로 기법 (Pomodoro Technique)</h2>
    <div class="intro-content">
      <div class="intro-text">
        <p>1980년대 이탈리아 대학생 프란체스코 시릴로가 개발한 생산성 기법. 25분 집중하고 5분 휴식하는 방식이다. 뽀모도로는 이탈리아어로 토마토이며 시릴로가 토마토 모양 타이머를 사용해 뽀모도로 타이머가 되었다.</p>      
        <div class="benefits">
          <h4>효과</h4>
          <ul>
            <li>집중력 80% 증가</li>
            <li>번아웃 예방</li>
            <li>생산성 극대화</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 특징 -->
  <section class="features">
    <h2>주요 기능</h2>
    <ul>
      {#each features as feature}
        <li>{feature}</li>
      {/each}
    </ul>
  </section>

  <!-- 업데이트 로그 -->
  <section class="changelog">
    <h2>업데이트 로그</h2>
    <div class="update-list">
      <div class="update-item">
        <span class="version-badge">{version}</span>
        <span class="date">2026.02.15</span>
        <div class="changes">
          <ul>
            {#each updateLogs as updateLog}
              <li>{updateLog}</li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 푸터 -->
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <p>Version <span class="version-highlight">{version}</span></p>
      </div>
      <div class="footer-legal">
        <p>Email: leosj2011@gmail.com</p>
        <p class="contact">Using Sveltekit, Svelte 5</p>
      </div>
    </div>
  </footer>
</div>

<style>
  .about-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
    align-items: center;
    max-width: 760px;
    margin: -24px auto 10px;
    padding: 40px 20px;
    min-height: 100vh;

    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;

    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR",
      "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  }

  /* 섹션 공통 */
  section {
    width: 100%;
  }

  section h2 {
    font-size: clamp(20px, 4vw, 24px);
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 뽀모도로 소개 */
  .pomodoro-intro {
    width: auto;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }

  .intro-text p {
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 20px;
    color: var(--text);
  }

  .benefits {
    margin-top: 24px;
  }

  .benefits h4 {
    font-size: clamp(16px, 3.5vw, 18px);
    margin-bottom: 12px;
    color: var(--primary);
  }

  .benefits ul {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  .benefits li {
    font-size: clamp(14px, 3vw, 15px);
    padding: 8px 12px;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 8px;
    border: 1px solid rgba(var(--primary-rgb), 0.2);
  }

  /* 특징 */
  .features ul {
    display: grid;
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .features li {
    padding: 16px 20px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: clamp(14px, 3vw, 15px);
  }

  /* 업데이트 로그 */
  .update-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .update-item {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
  }

  .version-badge {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: clamp(12px, 2.5vw, 13px);
    font-weight: 700;
    margin-bottom: 8px;
  }

  .date {
    color: var(--muted);
    font-size: clamp(13px, 2.8vw, 14px);
    margin-bottom: 16px;
  }

  .changes ul {
    margin: 0;
    padding-left: 20px;
  }

  .changes li {
    margin: 6px 0;
    font-size: clamp(13px, 2.8vw, 14px);
  }

  /* 푸터 */
  .footer {
    margin-top: auto;
    padding: 32px 8rem 20px;
    border-top: 1px solid var(--border);
  }

  .footer-content {
    max-width: 760px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    text-align: center;
  }

  .footer-section p,
  .footer-legal p {
    margin: 2px 0;
    color: var(--muted);
    font-size: clamp(12px, 2.5vw, 14px);
  }

  .version-highlight {
    color: var(--primary);
    font-weight: 600;
  }

  .contact {
    font-size: clamp(11px, 2.3vw, 12px);
  }

  /* 모바일 최적화: 모든 글씨 clamp()로 반응형 */
  @media (max-width: 480px) {
    .about-container {
      margin: 0 auto;
      padding: 24px 16px;
      gap: 24px;
    }

    .intro-text p {
      color: var(--muted);
      font-size: 13px;
    }

    .pomodoro-intro {
      padding: 10px 16px;
    }

    .footer {
      padding: 16px 40px 10px;
    }
  }
</style>
