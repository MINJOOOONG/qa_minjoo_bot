# Architecture

## 1. 전체 구조

Next.js App Router 기반 단일 앱. 프론트엔드, 백엔드, DB 접근이 모두 하나의 프로젝트에 있다.

```
┌─────────────────────────────────────────┐
│              Next.js App                 │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │    Pages      │  │  Route Handlers │  │
│  │ (Server/Client│  │  /app/api/*     │  │
│  │  Components)  │  │                 │  │
│  └──────┬───────┘  └────────┬────────┘  │
│         │                   │            │
│         └─────────┬─────────┘            │
│                   │                      │
│            ┌──────┴──────┐               │
│            │   Prisma    │               │
│            └──────┬──────┘               │
└───────────────────┼──────────────────────┘
                    │
             ┌──────┴──────┐
             │ PostgreSQL  │
             │   (Neon)    │
             └─────────────┘
```

별도 백엔드 서버 없음. 별도 상태 관리 라이브러리 없음.

---

## 2. 핵심 도메인

4개의 도메인 모델로 구성된다.

### test_runs
테스트 실행 단위. "2026-04-10 홈탭 RTC" 같은 이름으로 생성.
하나의 Run에 여러 Test Case가 포함된다.

### test_cases
테스트 케이스. 제목 + 스텝 + 기대결과.
여러 Run에 재사용될 수 있다.

### test_results
특정 Run에서 특정 Case를 실행한 결과.
상태(passed/failed/n/a) + 메모.

### suggestions
TC에 대한 개선 제안.
타입(modify/delete/add) + 대상 TC + 내용.

---

## 3. 데이터 흐름

```
Test Run 생성
  ↓
TC 목록 로드 (Run에 포함된 Case들)
  ↓
테이블 UI에 TC 리스트 표시
  ↓
각 row에서 상태 선택 (passed / failed / n/a)
  → Optimistic Update: UI 즉시 변경
  → Background: POST /api/results
  ↓
(선택) 메모 입력
  → Debounce 500ms 후 자동 저장
  → Background: PATCH /api/results/[id]
  ↓
(선택) 제안 작성
  → Dialog에서 입력
  → POST /api/suggestions
```

---

## 4. API 구조

### Test Runs

```
GET    /api/runs          → Run 목록 조회
POST   /api/runs          → Run 생성 { name, testCaseIds }
GET    /api/runs/[id]     → Run 상세 (포함된 TC + 결과)
```

### Test Results

```
POST   /api/results       → 결과 생성 { runId, testCaseId, status }
PATCH  /api/results/[id]  → 결과 수정 { status?, memo? }
```

### Suggestions

```
GET    /api/suggestions          → 제안 목록 (필터: runId, type)
POST   /api/suggestions          → 제안 생성 { type, testCaseId?, content }
```

### Test Cases

```
GET    /api/test-cases           → TC 목록 조회
POST   /api/test-cases           → TC 생성 (수동 입력 또는 import)
```

---

## 5. DB 구조

### ERD

```
test_runs
  ├── id          (PK)
  ├── name
  └── createdAt

test_cases
  ├── id          (PK)
  ├── title
  ├── steps
  └── expected

run_cases (다대다 연결)
  ├── runId       (FK → test_runs)
  └── testCaseId  (FK → test_cases)

test_results
  ├── id          (PK)
  ├── runId       (FK → test_runs)
  ├── testCaseId  (FK → test_cases)
  ├── status      ('passed' | 'failed' | 'n/a')
  ├── memo
  └── executedAt

suggestions
  ├── id          (PK)
  ├── testCaseId  (FK → test_cases, nullable)
  ├── runId       (FK → test_runs)
  ├── type        ('modify' | 'delete' | 'add')
  ├── content
  └── createdAt
```

### Prisma Schema

```prisma
model TestRun {
  id        String       @id @default(cuid())
  name      String
  cases     RunCase[]
  results   TestResult[]
  suggestions Suggestion[]
  createdAt DateTime     @default(now())
}

model TestCase {
  id        String       @id @default(cuid())
  title     String
  steps     String       // 실행 스텝 (텍스트)
  expected  String       // 기대 결과
  runs      RunCase[]
  results   TestResult[]
  suggestions Suggestion[]
  createdAt DateTime     @default(now())
}

model RunCase {
  run        TestRun  @relation(fields: [runId], references: [id])
  runId      String
  testCase   TestCase @relation(fields: [testCaseId], references: [id])
  testCaseId String

  @@id([runId, testCaseId])
}

model TestResult {
  id         String   @id @default(cuid())
  run        TestRun  @relation(fields: [runId], references: [id])
  runId      String
  testCase   TestCase @relation(fields: [testCaseId], references: [id])
  testCaseId String
  status     String   // 'passed' | 'failed' | 'n/a'
  memo       String?
  executedAt DateTime @default(now())

  @@unique([runId, testCaseId])
}

model Suggestion {
  id         String    @id @default(cuid())
  type       String    // 'modify' | 'delete' | 'add'
  content    String
  run        TestRun   @relation(fields: [runId], references: [id])
  runId      String
  testCase   TestCase? @relation(fields: [testCaseId], references: [id])
  testCaseId String?
  createdAt  DateTime  @default(now())
}
```

---

## 6. UI 구조

### 페이지 구성

2개 페이지가 전부다.

**1) Test Run 리스트** (`/runs`)
- Run 목록을 카드 또는 리스트로 표시
- "새 Run 만들기" 버튼
- 각 Run 클릭 → 결과 입력 페이지로 이동

**2) Test Run 결과 입력** (`/runs/[id]`) — 핵심 화면
- 상단: Run 이름, 진행률 (입력 완료 / 전체)
- 본문: TC 테이블

| # | Test Case | Status | Memo | Action |
|---|-----------|--------|------|--------|
| 1 | 홈 화면 잔액 표시 | `[passed ▼]` | 클릭하면 입력... | [제안] |
| 2 | 송금 플로우 정상 | `[failed ▼]` | 3단계에서 에러 | [제안] |
| 3 | 알림 설정 변경 | `[ — ▼]` | | [제안] |

- Status 컬럼: inline dropdown (passed/failed/n/a). 선택 즉시 저장.
- Memo 컬럼: 클릭하면 텍스트 입력 활성화. blur 시 자동 저장.
- Action 컬럼: "제안" 버튼 → SuggestionDialog 열림.

---

## 7. 성능 전략

### Optimistic Update (상태 마킹)

상태 선택 시 서버 응답을 기다리지 않는다.

```typescript
// 의사 코드
function onStatusChange(resultId: string, newStatus: Status) {
  // 1. UI 즉시 변경
  setResults(prev => prev.map(r =>
    r.id === resultId ? { ...r, status: newStatus } : r
  ));

  // 2. 서버에 저장 (백그라운드)
  fetch(`/api/results/${resultId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  }).catch(() => {
    // 실패 시 롤백
    setResults(prev => prev.map(r =>
      r.id === resultId ? { ...r, status: oldStatus } : r
    ));
  });
}
```

### Debounce 자동 저장 (메모)

타이핑 중에는 API 호출하지 않는다. 500ms 동안 입력이 없으면 저장.

```typescript
// 의사 코드
const debouncedSave = useMemo(
  () => debounce((resultId: string, memo: string) => {
    fetch(`/api/results/${resultId}`, {
      method: 'PATCH',
      body: JSON.stringify({ memo })
    });
  }, 500),
  []
);
```

### 최소 API 호출

- TC 리스트 + 기존 결과는 페이지 진입 시 Server Component에서 한 번에 조회
- 이후에는 변경 사항만 개별 API 호출
- 페이지 새로고침 없이 로컬 state로 UI 관리

---

## 8. 디렉토리 구조

```
qa_minjoo_bot/
├── docs/
│   ├── claude.md
│   ├── skills.md
│   └── architecture.md
├── prisma/
│   └── schema.prisma
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx              → 루트 (→ /runs redirect)
│       ├── runs/
│       │   ├── page.tsx          → Run 리스트
│       │   └── [id]/
│       │       └── page.tsx      → 결과 입력 (핵심 화면)
│       ├── api/
│       │   ├── runs/
│       │   │   ├── route.ts
│       │   │   └── [id]/route.ts
│       │   ├── results/
│       │   │   ├── route.ts
│       │   │   └── [id]/route.ts
│       │   ├── test-cases/
│       │   │   └── route.ts
│       │   └── suggestions/
│       │       └── route.ts
│       └── components/
│           ├── RunTable.tsx       → TC 테이블 (핵심 컴포넌트)
│           ├── StatusSelect.tsx   → 상태 선택 dropdown
│           ├── MemoCell.tsx       → 메모 입력 셀
│           └── SuggestionDialog.tsx → 제안 작성 다이얼로그
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
