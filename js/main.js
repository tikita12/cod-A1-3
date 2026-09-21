// ===== 섹션 전환 기능 =====

// 화면을 전환하는 함수
function goToPage(pageId) {
  // 1. 모든 섹션에서 active 제거 (다 숨김)
  document.querySelectorAll('.page').forEach(function (page) {
    page.classList.remove('active');
  });

  // 2. 목표 섹션에만 active 추가 (보이게)
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
  }

  // 3. 하단 메뉴 버튼 강조 표시 업데이트
  document.querySelectorAll('.bottom-nav button').forEach(function (btn) {
    btn.classList.remove('active');
    if (btn.dataset.goto === pageId) {
      btn.classList.add('active');
    }
  });

  // 4. 화면 맨 위로 스크롤
  window.scrollTo(0, 0);
}

// ===== data-goto 속성이 있는 모든 버튼에 클릭 기능 연결 =====
document.querySelectorAll('[data-goto]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const pageId = btn.dataset.goto; // data-goto 값을 읽음
    goToPage(pageId);
  });
});

// ===== 증상 체크 폼 제출 처리 =====
const checkForm = document.getElementById('check-form');

checkForm.addEventListener('submit', async function (e) {
  e.preventDefault(); // ✅ 페이지 새로고침 막기! (이게 핵심!)

  // 1. 입력값 수집
  const animal = document.getElementById('animal').value;
  const age = document.getElementById('age').value;
  const symptom = document.getElementById('symptom').value;
  const duration = document.getElementById('duration').value;

  // 2. 결과 영역 준비
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<p>🐾 AI가 분석 중이에요...</p>'; // 로딩 표시

  // 3. 백엔드 API 호출
  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animal, age, symptom, duration }),
    });

    const data = await response.json();

    // 4. 결과 표시
    resultDiv.innerHTML = `
      <div class="faq-item">
        <h3>AI 응급도 결과</h3>
        <p>${data.result}</p>
      </div>
    `;
  } catch (error) {
    // 5. 에러 처리
    resultDiv.innerHTML = '<p>❌ 오류가 발생했어요. 다시 시도해주세요.</p>';
    console.error(error);
  }
});

// ===== 증상 체크 폼 제출 처리 =====
const checkForm = document.getElementById('check-form');

checkForm.addEventListener('submit', async function (e) {
  e.preventDefault(); // ✅ 페이지 새로고침 막기 (버그의 원인!)

  // 1. 입력값 수집
  const animal = document.getElementById('animal').value;
  const age = document.getElementById('age').value;
  const symptom = document.getElementById('symptom').value;
  const duration = document.getElementById('duration').value;

  // 2. 결과 영역에 로딩 표시
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<p>🐾 AI가 분석 중이에요...</p>';

  // 3. 백엔드 API 호출
  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animal, age, symptom, duration }),
    });

    const data = await response.json();

    // 4. 에러 응답 처리 (400/500일 때 error 키가 옴)
    if (data.error) {
      resultDiv.innerHTML = `<p>⚠️ ${data.error}</p>`;
      return;
    }

    // 5. 정상 결과 표시 (ai_result 구조에 맞춤!)
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
    // 6. 네트워크 오류 등 처리
    resultDiv.innerHTML = '<p>❌ 오류가 발생했어요. 다시 시도해주세요.</p>';
    console.error(error);
  }
});