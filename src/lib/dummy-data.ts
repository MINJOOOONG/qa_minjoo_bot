export type Status = "passed" | "failed" | "n/a" | "untested";

export type TestCase = {
  id: string;
  code: string;
  title: string;
  detail: string[];
  comment: string;
  status: Status;
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
          { id: "C001", code: "C001", title: "홈 화면 진입 시 로딩 표시", detail: ["앱을 완전히 종료한 뒤 다시 실행", "홈 화면 진입 시 스켈레톤 로딩 UI 표시 확인", "데이터 로드 완료 후 실제 콘텐츠로 교체 확인", "네트워크가 느린 환경(3G)에서도 동일 동작 확인"], comment: "", status: "untested" },
          { id: "C002", code: "C002", title: "배너 슬라이드 자동 전환", detail: ["홈 화면 상단 배너 영역 확인", "약 3초 간격으로 자동 전환 확인", "마지막 배너에서 첫 번째로 순환 확인", "수동 스와이프 후 자동 전환 재개 확인"], comment: "", status: "untested" },
          { id: "C003", code: "C003", title: "공지사항 팝업 노출", detail: ["신규 공지 등록 상태에서 앱 실행", "홈 화면 진입 직후 팝업 노출 확인", "'다시 보지 않기' 선택 후 재실행 시 미노출 확인"], comment: "", status: "untested" },
          { id: "C004", code: "C004", title: "최근 거래 내역 표시", detail: ["거래 내역이 있는 계정으로 로그인", "홈 화면 최근 거래 내역 섹션 확인", "최근 5건 시간순(최신 순) 정렬 확인", "금액, 수취인, 날짜 올바른 표시 확인"], comment: "", status: "untested" },
          { id: "C005", code: "C005", title: "빠른 송금 버튼 동작", detail: ["홈 화면에서 '빠른 송금' 버튼 탭", "송금 화면으로 정상 이동 확인", "뒤로가기 시 홈 화면 복귀 확인"], comment: "", status: "untested" },
        ],
      },
      {
        name: "송금",
        cases: [
          { id: "C006", code: "C006", title: "송금 화면 진입", detail: ["하단 네비게이션에서 '송금' 탭 선택", "송금 화면 정상 로드 확인", "계좌 입력, 금액 입력 필드 표시 확인"], comment: "", status: "untested" },
          { id: "C007", code: "C007", title: "계좌번호 입력 유효성 검사", detail: ["계좌번호 입력란에 포커스", "숫자가 아닌 문자(영문, 특수문자) 입력", "자릿수 부족 계좌번호 입력", "각 경우 에러 메시지 표시 확인", "올바른 계좌번호 입력 시 에러 해제 확인"], comment: "", status: "untested" },
          { id: "C008", code: "C008", title: "송금 금액 한도 초과 경고", detail: ["1일 한도 설정 계정으로 로그인", "한도 초과 금액 입력", "'송금' 버튼 탭", "한도 초과 경고 팝업 표시 확인", "현재 한도와 잔여 한도 표시 확인"], comment: "", status: "untested" },
          { id: "C009", code: "C009", title: "송금 완료 확인 화면", detail: ["유효한 계좌/금액으로 송금 실행", "송금 완료 화면 표시 확인", "금액, 수취인, 수취 은행 올바른 표시 확인", "'확인' 버튼 탭 시 홈 화면 복귀 확인"], comment: "", status: "untested" },
        ],
      },
      {
        name: "알림",
        cases: [
          { id: "C010", code: "C010", title: "푸시 알림 수신 확인", detail: ["테스트 서버에서 푸시 알림 발송", "단말에서 알림 수신 확인", "알림 내용(제목, 본문)이 발송 내용과 일치 확인", "알림 탭 시 앱 내 해당 화면 이동 확인"], comment: "", status: "untested" },
          { id: "C011", code: "C011", title: "알림 목록 조회", detail: ["알림 탭 선택", "최근 알림 최신순 정렬 확인", "읽지 않은 알림 뱃지/강조 표시 확인", "스크롤 시 추가 알림 로드 확인"], comment: "", status: "untested" },
          { id: "C012", code: "C012", title: "알림 읽음 처리", detail: ["읽지 않은 알림 항목 탭", "읽음 상태로 변경 확인", "알림 목록 복귀 시 뱃지/강조 제거 확인"], comment: "", status: "untested" },
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
          { id: "C101", code: "C101", title: "송금 시 잔액 부족 에러 처리", detail: ["잔액 1,000원 미만 계정으로 로그인", "잔액 초과 금액으로 송금 시도", "'잔액이 부족합니다' 에러 메시지 확인", "잔액 변동 없음 확인"], comment: "", status: "passed" },
          { id: "C102", code: "C102", title: "반복 송금 등록", detail: ["송금 화면에서 '반복 송금' 옵션 활성화", "주기(매주/매월)와 시작일 설정", "반복 송금 등록", "반복 송금 목록에서 항목 확인"], comment: "", status: "passed" },
          { id: "C103", code: "C103", title: "송금 취소 기능", detail: ["송금 실행하여 완료 대기 상태 진입", "완료 전 '취소' 버튼 탭", "취소 확인 팝업 표시 확인", "취소 후 잔액 복구 확인", "거래 내역에 '취소됨' 상태 표시 확인"], comment: "취소 후 잔액 미복구 — 백엔드 이슈로 확인 필요", status: "failed" },
        ],
      },
      {
        name: "알림",
        cases: [
          { id: "C104", code: "C104", title: "알림 설정 변경", detail: ["설정 > 알림 메뉴 진입", "알림 수신 토글 OFF로 변경", "서버에서 푸시 발송", "알림 미수신 확인", "토글 ON 변경 후 정상 수신 확인"], comment: "", status: "passed" },
          { id: "C105", code: "C105", title: "야간 알림 차단", detail: ["설정 > 알림 > 야간 알림 차단 활성화", "차단 시간대(22:00~08:00) 확인", "해당 시간대에 푸시 발송", "알림 차단 확인", "차단 시간대 이후 정상 수신 확인"], comment: "iOS만 해당 — Android는 별도 이슈로 분리", status: "n/a" },
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
          { id: "C201", code: "C201", title: "홈 화면 레이아웃 깨짐 확인", detail: ["iPhone SE, iPhone 15 Pro Max, Galaxy S24에서 홈 화면 확인", "배너, 거래내역, 메뉴 버튼 겹침/잘림 없음 확인", "가로 모드 전환 시 레이아웃 유지 확인"], comment: "", status: "untested" },
          { id: "C202", code: "C202", title: "다크모드 홈 화면", detail: ["단말 설정에서 다크모드 활성화", "앱 실행 후 홈 화면 진입", "배경색, 텍스트, 아이콘 다크모드 표시 확인", "라이트모드 전환 시 즉시 반영 확인"], comment: "", status: "untested" },
        ],
      },
      {
        name: "송금",
        cases: [
          { id: "C203", code: "C203", title: "해외 송금 수수료 표시", detail: ["해외 송금 화면 진입", "수취 국가와 금액 입력", "수수료 올바른 계산/표시 확인", "총 출금액(송금액 + 수수료) 정확성 확인"], comment: "", status: "untested" },
          { id: "C204", code: "C204", title: "환율 실시간 반영", detail: ["해외 송금 화면에서 환율 정보 확인", "일정 시간 대기 후 환율 갱신 확인", "환율 변동 시 수취 금액 자동 재계산 확인"], comment: "", status: "untested" },
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
