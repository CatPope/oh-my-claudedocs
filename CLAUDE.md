# Docs OMC

## Git 규칙

### 커밋 메시지 컨벤션

Conventional Commits 형식을 따른다.

```
<type>(<scope>): <subject>

<body>
```

**Type:**
| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `chore` | 빌드, 설정, 도구 변경 |
| `test` | 테스트 추가/수정 |

**Scope (선택):**
`install`, `hooks`, `rules`, `skills`, `templates`, `scripts`

**규칙:**
- subject는 50자 이내, 한국어 또는 영어
- body는 72자 줄바꿈, 변경 이유 설명
- 마침표 없음

### PR 규칙

- PR 생성 시 `.github/pull_request_template.md` 템플릿 필수 사용
- 용도별로 PR을 분리한다 (하나의 PR에 관련 없는 변경을 섞지 않는다)
- 브랜치에 push 전, 해당 PR이 열려있는지 확인한다 (merge/close된 PR에 push해도 master에 반영되지 않는다)