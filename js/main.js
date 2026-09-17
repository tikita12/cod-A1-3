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