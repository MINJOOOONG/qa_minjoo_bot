import { create } from "zustand";
import { persist } from "zustand/middleware";
import { testRuns as initialRuns } from "./dummy-data";
import type { TestRun, Section, Status } from "./dummy-data";

let _nextId = 1000;
function genId() {
  return `tc-${_nextId++}`;
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
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: mapCase(r.sections, caseId, (tc) => ({ ...tc, code, title, detail })),
          })),
        })),

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
                          title: "새 테스트케이스",
                          detail: [],
                          comment: "",
                          status: "untested" as Status,
                        },
                      ],
                    }
                  : s
              ),
            })),
          };
        }),

      deleteTestCase: (runId, caseId) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: mapSections(r.sections, (s) => ({
              ...s,
              cases: s.cases.filter((tc) => tc.id !== caseId),
            })),
          })),
        })),
    }),
    {
      name: "qa-runs-storage",
    }
  )
);
