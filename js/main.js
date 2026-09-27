// ===== 섹션 전환 기능 =====
function goToPage(pageId) {
  document.querySelectorAll('.page').forEach(function (page) {
    page.classList.remove('active');
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.bottom-nav button').forEach(function (btn) {
    btn.classList.remove('active');
    if (btn.dataset.goto === pageId) {
      btn.classList.add('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== data-goto 버튼 연결 =====
document.querySelectorAll('[data-goto]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    goToPage(btn.dataset.goto);
  });
});

// ===== 증상 체크 폼 제출 처리 =====
const checkForm = document.getElementById('check-form');

checkForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const animal = document.getElementById('animal').value;
  const age = document.getElementById('age').value;
  const symptom = document.getElementById('symptom').value;
  const duration = document.getElementById('duration').value;

  const resultDiv = document.getElementById('result');
  
  // 2026 모던 로딩 인디케이터
  resultDiv.innerHTML = `
    <div class="loading-box">
      <div class="loading-spinner"></div>
      <div class="loading-text">🐾 AI가 증상을 분석 중이에요...</div>
      <div class="loading-subtext">잠시만 기다려주세요 (약 2~3초 소요)</div>
    </div>
  `;
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animal, age, symptom, duration }),
    });

    const data = await response.json();

    if (data.error) {
      resultDiv.innerHTML = `
        <div class="error-card">
          <span>⚠️</span>
          <div>${data.error}</div>
        </div>
      `;
      return;
    }

    // 응급도 등급에 따른 스타일 클래스 및 뱃지 판정
    let levelClass = 'level-amber';
    let levelTag = '확인 필요';

    const levelStr = String(data.emergency_level || '');
    if (levelStr.includes('🔴') || levelStr.includes('즉시')) {
      levelClass = 'level-red';
      levelTag = '🚨 즉시 병원 방문 권장';
    } else if (levelStr.includes('🟢') || levelStr.includes('경과') || levelStr.includes('관찰')) {
      levelClass = 'level-green';
      levelTag = '🌿 경과 관찰 가능';
    } else if (levelStr.includes('🟡') || levelStr.includes('24시간')) {
      levelClass = 'level-amber';
      levelTag = '⚠️ 24시간 내 진료 권장';
    }

    const checklistItems = (data.checklist || [])
      .map(item => `<li>${item}</li>`)
      .join('');

    const warningItems = (data.warning_signs || [])
      .map(item => `<li>${item}</li>`)
      .join('');

    resultDiv.innerHTML = `
      <div class="result-card">
        <div class="emergency-banner ${levelClass}">
          <span>응급도: ${data.emergency_level}</span>
          <span class="emergency-tag">${levelTag}</span>
        </div>

        ${checklistItems ? `
        <div class="result-section checklist">
          <h3><span>✅</span> 병원 가기 전 확인할 것</h3>
          <ul>${checklistItems}</ul>
        </div>` : ''}

        ${warningItems ? `
        <div class="result-section warning">
          <h3><span>🚨</span> 이러면 바로 병원으로 가세요!</h3>
          <ul>${warningItems}</ul>
        </div>` : ''}

        <div class="disclaimer">
          <span class="disclaimer-icon">⚠️</span>
          <div>${data.disclaimer || '이 정보는 참고용이며 정확한 진단은 수의사에게 받으세요.'}</div>
        </div>
      </div>
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="error-card">
        <span>❌</span>
        <div>일시적인 통신 오류가 발생했어요. 잠시 후 다시 시도해주세요.</div>
      </div>
    `;
    console.error(error);
  }
});