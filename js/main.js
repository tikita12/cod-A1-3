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

  window.scrollTo(0, 0);
}

// ===== data-goto 버튼 연결 =====
document.querySelectorAll('[data-goto]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    goToPage(btn.dataset.goto);
  });
});

// ===== 증상 체크 폼 제출 처리 (최신 버전 하나만!) =====
const checkForm = document.getElementById('check-form');

checkForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const animal = document.getElementById('animal').value;
  const age = document.getElementById('age').value;
  const symptom = document.getElementById('symptom').value;
  const duration = document.getElementById('duration').value;

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<p>🐾 AI가 분석 중이에요...</p>';

  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animal, age, symptom, duration }),
    });

    const data = await response.json();

    if (data.error) {
      resultDiv.innerHTML = `<p>⚠️ ${data.error}</p>`;
      return;
    }

    resultDiv.innerHTML = `
      <div class="faq-item">
        <h3>응급도: ${data.emergency_level}</h3>

        <h3>✅ 확인할 것</h3>
        <ul>
          ${data.checklist.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h3>🚨 이러면 바로 병원!</h3>
        <ul>
          ${data.warning_signs.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <p class="disclaimer">${data.disclaimer}</p>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = '<p>❌ 오류가 발생했어요. 다시 시도해주세요.</p>';
    console.error(error);
  }
});