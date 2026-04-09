# qa_minjoo_bot

## 프로젝트 개요

Testrail의 "Test Runs & Results" 기능만 뽑아서 가볍게 만든 QA 실행 도구.
QA Assistant가 regression test를 수행하면서 결과를 기록하고, testcase 개선 제안을 남길 수 있다.

Testrail은 무겁고 느리다. 이 도구는 빠르고 단순하다.

---

## 범위

### 포함

- Test Run 생성 및 관리
- Test Case 리스트 조회
- 각 Test Case 결과 입력 (passed / failed / n/a)
- 각 Test Case 메모 작성
- Test Case 수정/삭제/추가 제안 (suggestion)

### 제외

- Project 관리
- Milestone
- Report / Dashboard
- 권한 시스템
- 복잡한 워크플로우

---

## 핵심 개념

### Test Run

하나의 테스트 실행 단위. "2026-04-10 홈탭 RTC" 같은 이름으로 생성한다.
Test Run 안에 여러 Test Case가 포함된다.

### Test Case

테스트 케이스 하나. 제목, 실행 스텝, 기대 결과로 구성된다.
Test Run에 포함되어 실행 대상이 된다.

### Test Result

Test Run 내에서 특정 Test Case를 실행한 결과.
상태값 + 메모로 구성된다.

### Suggestion

QA Assistant가 Test Case에 대해 남기는 개선 제안.
타입은 3가지: **modify**(수정), **delete**(삭제), **add**(추가).

---

## 상태값

결과 상태는 3개만 사용한다.

| 상태 | 의미 | 추가 입력 |
|------|------|-----------|
| `passed` | 정상 동작 | 없음 |
| `failed` | 실패 | 메모 권장 |
| `n/a` | 수행 불가 (환경 이슈, 전제조건 미충족 등) | 메모 권장 |

상태 변경은 한 번의 클릭으로 완료된다. passed는 클릭 한 번이면 끝.

---

## UX 원칙

1. **테이블 기반 UI**: 한 화면에 TC 리스트를 테이블로 표시. 각 row에서 바로 상태 선택.
2. **인라인 처리**: 상태 마킹, 메모 작성을 row 안에서 바로 수행. 페이지 이동 없음.
3. **최소 클릭**: passed는 1클릭. failed/n/a도 1클릭 + 메모(선택).
4. **자동 저장**: 저장 버튼 없음. 입력 즉시 반영.
5. **빠른 로딩**: 테이블 렌더링은 즉시. 로딩 스피너 최소화.

---

## Suggestion 개념

QA Assistant는 TC 수정 권한이 없다. 대신 제안을 남긴다.

| 타입 | 언제 쓰는지 | 필수 입력 |
|------|------------|-----------|
| `modify` | TC 스텝이나 기대결과가 현재 앱과 다를 때 | 대상 TC, 수정 내용 |
| `delete` | TC가 더 이상 유효하지 않을 때 | 대상 TC, 사유 |
| `add` | 새로운 테스트 시나리오가 필요할 때 | 제안 내용 |

TC 결과를 입력하는 화면에서 바로 제안을 남길 수 있다.

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js (App Router) |
| UI | React + shadcn/ui + Tailwind CSS |
| 언어 | TypeScript |
| DB | PostgreSQL (Neon) + Prisma |
| 배포 | Vercel |

상세: [skills.md](skills.md) / 구조: [architecture.md](architecture.md)

---

## 문서 구조

```
docs/
├── claude.md          # 프로젝트 컨텍스트 (이 문서)
├── skills.md          # 기술 스택 설계
└── architecture.md    # 시스템 구조, DB, API, UI
```
