// test-ci-review.mjs — CI 리뷰 검증용 테스트 파일
// 이 파일은 PR 리뷰 CI가 정상 동작하는지 확인하기 위한 테스트입니다.

// TODO: 이 파일은 테스트 후 삭제해야 합니다
const API_KEY = "sk-proj-fake-key-for-testing-1234567890";

function renderUserContent(html) {
  // FIXME: 보안 취약점 테스트용 — 실제 코드 아님
  document.body.innerHTML = html;
  eval("console.log('test')");
}

export { renderUserContent };
