export type Status = "passed" | "failed" | "n/a" | "untested";

export type TestCase = {
  id: string;
  title: string;
  section: string;
  status: Status;
  memo: string;
};

export type Section = {
  name: string;
  cases: TestCase[];
};

export type TestRun = {
  id: string;
  name: string;
  createdAt: string;
  sections: Section[];
};

export const testRuns: TestRun[] = [
  {
    id: "1",
    name: "v2.1.0 정기 QA",
    createdAt: "2026-04-08",
    sections: [
      {
        name: "홈",
        cases: [
          { id: "C001", title: "홈 화면 진입 시 로딩 표시", section: "홈", status: "untested", memo: "" },
          { id: "C002", title: "배너 슬라이드 자동 전환", section: "홈", status: "untested", memo: "" },
          { id: "C003", title: "공지사항 팝업 노출", section: "홈", status: "untested", memo: "" },
          { id: "C004", title: "최근 거래 내역 표시", section: "홈", status: "untested", memo: "" },
          { id: "C005", title: "빠른 송금 버튼 동작", section: "홈", status: "untested", memo: "" },
        ],
      },
      {
        name: "송금",
        cases: [
          { id: "C006", title: "송금 화면 진입", section: "송금", status: "untested", memo: "" },
          { id: "C007", title: "계좌번호 입력 유효성 검사", section: "송금", status: "untested", memo: "" },
          { id: "C008", title: "송금 금액 한도 초과 경고", section: "송금", status: "untested", memo: "" },
          { id: "C009", title: "송금 완료 확인 화면", section: "송금", status: "untested", memo: "" },
        ],
      },
      {
        name: "알림",
        cases: [
          { id: "C010", title: "푸시 알림 수신 확인", section: "알림", status: "untested", memo: "" },
          { id: "C011", title: "알림 목록 조회", section: "알림", status: "untested", memo: "" },
          { id: "C012", title: "알림 읽음 처리", section: "알림", status: "untested", memo: "" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "v2.0.5 핫픽스 QA",
    createdAt: "2026-04-05",
    sections: [
      {
        name: "송금",
        cases: [
          { id: "C101", title: "송금 시 잔액 부족 에러 처리", section: "송금", status: "passed", memo: "" },
          { id: "C102", title: "반복 송금 등록", section: "송금", status: "passed", memo: "" },
          { id: "C103", title: "송금 취소 기능", section: "송금", status: "failed", memo: "취소 후 잔액 미복구" },
        ],
      },
      {
        name: "알림",
        cases: [
          { id: "C104", title: "알림 설정 변경", section: "알림", status: "passed", memo: "" },
          { id: "C105", title: "야간 알림 차단", section: "알림", status: "n/a", memo: "iOS만 해당" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "v2.1.0 회귀 테스트",
    createdAt: "2026-04-09",
    sections: [
      {
        name: "홈",
        cases: [
          { id: "C201", title: "홈 화면 레이아웃 깨짐 확인", section: "홈", status: "untested", memo: "" },
          { id: "C202", title: "다크모드 홈 화면", section: "홈", status: "untested", memo: "" },
        ],
      },
      {
        name: "송금",
        cases: [
          { id: "C203", title: "해외 송금 수수료 표시", section: "송금", status: "untested", memo: "" },
          { id: "C204", title: "환율 실시간 반영", section: "송금", status: "untested", memo: "" },
        ],
      },
    ],
  },
];

export function getTestRun(id: string): TestRun | undefined {
  return testRuns.find((r) => r.id === id);
}

export function countByStatus(sections: Section[]) {
  const all = sections.flatMap((s) => s.cases);
  const total = all.length;
  const passed = all.filter((c) => c.status === "passed").length;
  const failed = all.filter((c) => c.status === "failed").length;
  const na = all.filter((c) => c.status === "n/a").length;
  const tested = passed + failed + na;
  return { total, passed, failed, na, tested };
}
