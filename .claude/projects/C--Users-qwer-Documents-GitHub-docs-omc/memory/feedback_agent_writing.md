---
name: feedback-agent-writing
description: 모든 문서 작성은 서브 에이전트에 위임해야 함 — 메인 context 보호를 위해
type: feedback
---

모든 문서 작성은 서브 에이전트(writer 등)에 위임한다. 메인 에이전트가 직접 작성하지 않는다.

**Why:** 문서를 직접 작성하면 메인 context가 커져서 성능이 저하된다. 서브 에이전트가 작성하고 요약만 반환하면 메인 context를 깨끗하게 유지할 수 있다.

**How to apply:** dev-autopilot 스킬에서 SRS/PRD, DetailedSpec, test-plan, 최종 정리 문서 등 모든 문서를 Agent(writer) 또는 적절한 서브 에이전트에 위임하고, 메인은 결과 요약만 받는다.
