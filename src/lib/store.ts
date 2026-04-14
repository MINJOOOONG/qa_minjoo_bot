import { create } from "zustand";
import { persist } from "zustand/middleware";
import { testRuns as initialRuns } from "./dummy-data";
import type { TestRun, Section, Status, WorkSession, ChangeType } from "./dummy-data";

function genId() {
  return `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface RunStore {
  runs: TestRun[];

  // Run
  updateRunName: (runId: string, name: string) => void;

  // Section
  renameSection: (runId: string, oldName: string, newName: string) => void;
  addSection: (runId: string) => void;
  deleteSection: (runId: string, sectionName: string) => void;

  // TestCase
  updateStatus: (runId: string, caseId: string, status: Status) => void;
  editTestCase: (runId: string, caseId: string, code: string, title: string, detail: string[]) => void;
  updateComment: (runId: string, caseId: string, comment: string) => void;
  addTestCase: (runId: string, sectionName: string) => void;
  deleteTestCase: (runId: string, caseId: string) => void;
  duplicateTestCase: (runId: string, caseId: string) => string | null;

  // Sessions
  sessions: WorkSession[];
  activeSessionId: string | null;
  startSession: (runId: string, date: string) => void;
  endSession: (sessionId: string) => void;
}

function mapRun(
  runs: TestRun[],
  runId: string,
  fn: (run: TestRun) => TestRun
): TestRun[] {
  return runs.map((r) => (r.id === runId ? fn(r) : r));
}

function mapSections(
  sections: Section[],
  fn: (s: Section) => Section
): Section[] {
  return sections.map(fn);
}

function mapCase(
  sections: Section[],
  caseId: string,
  fn: (tc: import("./dummy-data").TestCase) => import("./dummy-data").TestCase
): Section[] {
  return mapSections(sections, (s) => ({
    ...s,
    cases: s.cases.map((tc) => (tc.id === caseId ? fn(tc) : tc)),
  }));
}

/** Auto-record a change to the active session (dedupe by type+caseId) */
function recordChange(
  sessions: WorkSession[],
  activeSessionId: string | null,
  type: ChangeType,
  sectionName: string,
  code: string,
  title: string,
  steps?: string[],
): WorkSession[] {
  if (!activeSessionId) return sessions;
  return sessions.map((s) => {
    if (s.id !== activeSessionId) return s;
    // Dedupe: remove existing entry with same type + code (for update/delete on same TC)
    const deduped = s.changes.filter(
      (c) => !(c.type === type && c.testCaseCode === code),
    );
    return {
      ...s,
      changes: [
        ...deduped,
        {
          id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          sectionName,
          testCaseCode: code,
          testCaseTitle: title,
          ...(steps && steps.length > 0 ? { steps } : {}),
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });
}

/** Find which section a case belongs to */
function findSectionForCase(runs: TestRun[], runId: string, caseId: string): string {
  const run = runs.find((r) => r.id === runId);
  if (!run) return "";
  for (const s of run.sections) {
    if (s.cases.some((tc) => tc.id === caseId)) return s.name;
  }
  return "";
}

export const useRunStore = create<RunStore>()(
  persist(
    (set) => ({
      runs: initialRuns,

      updateRunName: (runId, name) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({ ...r, name })),
        })),

      renameSection: (runId, oldName, newName) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: mapSections(r.sections, (s) =>
              s.name === oldName ? { ...s, name: newName } : s
            ),
          })),
        })),

      addSection: (runId) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: [...r.sections, { name: "새 섹션", cases: [] }],
          })),
        })),

      deleteSection: (runId, sectionName) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: r.sections.filter((s) => s.name !== sectionName),
          })),
        })),

      updateStatus: (runId, caseId, status) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: mapCase(r.sections, caseId, (tc) => ({ ...tc, status })),
          })),
        })),

      editTestCase: (runId, caseId, code, title, detail) =>
        set((state) => {
          const sectionName = findSectionForCase(state.runs, runId, caseId);
          return {
            runs: mapRun(state.runs, runId, (r) => ({
              ...r,
              sections: mapCase(r.sections, caseId, (tc) => ({ ...tc, code, title, detail })),
            })),
            sessions: recordChange(state.sessions, state.activeSessionId, "update", sectionName, code, title, detail),
          };
        }),

      updateComment: (runId, caseId, comment) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: mapCase(r.sections, caseId, (tc) => ({ ...tc, comment })),
          })),
        })),

      addTestCase: (runId, sectionName) =>
        set((state) => {
          const run = state.runs.find((r) => r.id === runId);
          if (!run) return state;

          const allCodes = run.sections
            .flatMap((s) => s.cases)
            .map((c) => c.code)
            .filter((code) => /^C\d+$/.test(code))
            .map((code) => parseInt(code.slice(1), 10));
          const maxCode = allCodes.length > 0 ? Math.max(...allCodes) : 0;
          const newCode = `C${String(maxCode + 1).padStart(3, "0")}`;
          const newTitle = "새 테스트케이스";

          return {
            runs: mapRun(state.runs, runId, (r) => ({
              ...r,
              sections: mapSections(r.sections, (s) =>
                s.name === sectionName
                  ? {
                      ...s,
                      cases: [
                        ...s.cases,
                        {
                          id: genId(),
                          code: newCode,
                          title: newTitle,
                          detail: [],
                          comment: "",
                          status: "untested" as Status,
                        },
                      ],
                    }
                  : s
              ),
            })),
            sessions: recordChange(state.sessions, state.activeSessionId, "add", sectionName, newCode, newTitle),
          };
        }),

      deleteTestCase: (runId, caseId) =>
        set((state) => {
          // Capture info before deletion
          const sectionName = findSectionForCase(state.runs, runId, caseId);
          const run = state.runs.find((r) => r.id === runId);
          const tc = run?.sections.flatMap((s) => s.cases).find((c) => c.id === caseId);

          return {
            runs: mapRun(state.runs, runId, (r) => ({
              ...r,
              sections: mapSections(r.sections, (s) => ({
                ...s,
                cases: s.cases.filter((c) => c.id !== caseId),
              })),
            })),
            sessions: tc
              ? recordChange(state.sessions, state.activeSessionId, "delete", sectionName, tc.code, tc.title)
              : state.sessions,
          };
        }),

      // ── Sessions ──────────────────────────────────────
      sessions: [],
      activeSessionId: null,

      startSession: (runId, date) =>
        set((state) => {
          const id = `sess-${Date.now()}`;
          const session: WorkSession = {
            id,
            date,
            startedAt: new Date().toISOString(),
            endedAt: null,
            runId,
            changes: [],
          };
          return {
            sessions: [...state.sessions, session],
            activeSessionId: id,
          };
        }),

      endSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, endedAt: new Date().toISOString() } : s
          ),
          activeSessionId: null,
        })),

      duplicateTestCase: (runId, caseId) => {
        let newId: string | null = null;
        set((state) => {
          const run = state.runs.find((r) => r.id === runId);
          if (!run) return state;

          // find next code
          const allCodes = run.sections
            .flatMap((s) => s.cases)
            .map((c) => c.code)
            .filter((code) => /^C\d+$/.test(code))
            .map((code) => parseInt(code.slice(1), 10));
          const maxCode = allCodes.length > 0 ? Math.max(...allCodes) : 0;
          const newCode = `C${String(maxCode + 1).padStart(3, "0")}`;

          newId = genId();
          const dupId = newId;

          return {
            runs: mapRun(state.runs, runId, (r) => ({
              ...r,
              sections: mapSections(r.sections, (s) => {
                const idx = s.cases.findIndex((tc) => tc.id === caseId);
                if (idx === -1) return s;
                const src = s.cases[idx];
                const dup: import("./dummy-data").TestCase = {
                  id: dupId,
                  code: newCode,
                  title: src.title,
                  detail: [...(Array.isArray(src.detail) ? src.detail : [])],
                  comment: "",
                  status: "untested",
                };
                const newCases = [...s.cases];
                newCases.splice(idx + 1, 0, dup);
                return { ...s, cases: newCases };
              }),
            })),
          };
        });
        return newId;
      },
    }),
    {
      name: "qa-runs-storage",
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        // Ensure every test case has a detail array (older data may lack it)
        if (Array.isArray(state.runs)) {
          for (const run of state.runs as TestRun[]) {
            for (const section of run.sections) {
              for (const tc of section.cases) {
                if (!Array.isArray(tc.detail)) {
                  tc.detail = [];
                }
              }
            }
          }
        }
        return state as unknown as RunStore;
      },
    }
  )
);
