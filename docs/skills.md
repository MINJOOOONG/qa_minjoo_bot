# Skills — 기술 스택 설계

## 개요

qa_minjoo_bot은 테이블 UI에서 TC 결과를 빠르게 입력하는 도구다.
기술 선택 기준은 하나: **입력 속도를 최대화하고, 개발/운영 부담을 최소화하는 것.**

- 1인 개발이므로 프론트/백엔드를 하나의 프로젝트로 처리한다
- TC 리스트를 테이블로 표시하고 각 row에서 inline으로 상태를 변경한다
- 상태 변경은 클릭 즉시 UI에 반영되고, 서버 저장은 백그라운드에서 진행한다
- DB에 구조화된 데이터(test run, case, result, suggestion)를 저장한다

---

## Frontend

### Next.js (App Router)

프론트와 백엔드를 하나의 프로젝트에서 처리한다.

- Server Component로 Test Run 목록, TC 리스트를 서버에서 직접 DB 조회 → 렌더링. 별도 API fetch 체인이 필요 없다.
- Route Handler(`/app/api/*`)로 결과 저장, 제안 생성 등 변경 API를 제공한다.
- Vercel에 push하면 자동 배포. 서버 관리 불필요.

**이 프로젝트의 라우트 구조:**
```
/app/runs                    → Test Run 리스트 (Server Component)
/app/runs/[id]               → Test Run 결과 입력 페이지 (핵심 화면)
/app/api/runs/route.ts       → Test Run CRUD
/app/api/results/route.ts    → 결과 저장/수정
/app/api/suggestions/route.ts → 제안 생성/조회
```

### React + TypeScript

TC 테이블, 상태 버튼, 메모 에디터를 컴포넌트로 분리한다.

TypeScript를 쓰는 이유는 DB 스키마(Prisma) → API → UI까지 타입이 일관되게 흘러가야 하기 때문이다. `status`가 `'passed' | 'failed' | 'n/a'`인 것을 컴파일 타임에 보장한다.

**핵심 컴포넌트:**
```
<RunTable>          — TC 리스트 테이블. 핵심 화면의 메인 컴포넌트.
<StatusSelect>      — passed/failed/n/a 선택. inline dropdown.
<MemoCell>          — 메모 입력 셀. 클릭하면 확장, blur하면 축소+자동저장.
<SuggestionDialog>  — 제안 작성 다이얼로그. row에서 바로 열림.
```

### Tailwind CSS + shadcn/ui

QA 도구에 화려한 디자인은 필요 없다. 깔끔한 테이블 UI가 전부다.

- Tailwind로 테이블 스타일링, 상태별 색상 코딩(passed=green, failed=red, n/a=gray)
- shadcn/ui에서 `Table`, `Select`, `Dialog`, `Textarea`, `Badge`를 가져다 쓴다
- 디자인 시스템을 직접 만들 필요 없이 바로 개발에 들어갈 수 있다

---

## Backend

### Next.js Route Handlers

별도 백엔드 서버를 띄우지 않는다. `/app/api/` 디렉토리가 곧 API다.

**API 목록:**

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/api/runs` | GET, POST | Test Run 목록 조회, 생성 |
| `/api/runs/[id]` | GET | 특정 Run의 TC + 결과 조회 |
| `/api/results` | POST, PATCH | 결과 저장, 수정 (상태 + 메모) |
| `/api/suggestions` | GET, POST | 제안 목록 조회, 생성 |

Server Component에서는 Prisma로 DB를 직접 조회한다.
Client Component에서 데이터를 변경할 때만 Route Handler를 호출한다.

---

## Database

### PostgreSQL (Neon) + Prisma

Test Run → Test Case → Test Result → Suggestion 사이에 명확한 관계가 있으므로 관계형 DB를 사용한다.

**Neon을 쓰는 이유:**
- 서버리스 PostgreSQL. Vercel의 서버리스 환경과 호환된다.
- 커넥션 풀링 내장. 서버리스에서 커넥션 고갈 문제가 없다.
- Free tier로 시작.

**Prisma를 쓰는 이유:**
- `schema.prisma` 하나에 전체 DB 구조 정의. `prisma migrate`로 마이그레이션.
- TypeScript 타입 자동 생성. DB 스키마 바꾸면 프론트 타입도 자동 반영.

**저장하는 데이터:**

| 테이블 | 내용 |
|--------|------|
| `test_runs` | Run 이름, 생성일 |
| `test_cases` | TC 제목, 스텝, 기대결과 |
| `test_results` | 상태(passed/failed/n/a), 메모, 실행 시각 |
| `suggestions` | 타입(modify/delete/add), 대상 TC, 내용 |

---

## 상태 관리

전역 상태 라이브러리(Redux, Zustand)는 사용하지 않는다.
이 프로젝트에서 관리할 클라이언트 상태는 두 가지뿐이다:

### 1. 상태 마킹 — Optimistic Update

TC 상태를 클릭하면 UI를 즉시 변경하고, API 호출은 백그라운드로 처리한다.
서버 응답을 기다려야 하면 100개 TC 처리 시 체감 속도가 크게 떨어진다.

```
클릭 → UI 즉시 변경 → fetch POST → 성공 시 유지 / 실패 시 롤백
```

### 2. 메모 입력 — Debounce 자동 저장

타이핑할 때마다 API를 호출하지 않는다.
입력이 멈춘 후 500ms 뒤에 자동 저장. 저장 버튼 없음.

```
타이핑 → 500ms 대기 → fetch PATCH → 완료
```

---

## 향후 확장 (MVP 이후)

| 기술 | 목적 | 현재 준비 사항 |
|------|------|---------------|
| Slack API | 제안 알림, 결과 공유 | suggestion 데이터를 구조화해서 저장 |
| Notion API | TC 동기화 | test_cases에 `externalId` 필드 확보 |
| 파일 첨부 (Vercel Blob) | 스크린샷/영상 첨부 | MVP에서는 제외, 나중에 attachments 테이블 추가 |
