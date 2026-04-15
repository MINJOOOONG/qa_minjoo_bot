import { create } from "zustand";
import { persist } from "zustand/middleware";
import { testRuns as initialRuns } from "./dummy-data";
import type { TestRun, Section, Status, WorkSession, ChangeType } from "./dummy-data";

let _idCounter = 0;
function genId() {
  return `tc-${Date.now()}-${++_idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function genSectionId() {
  return `sec-${Date.now()}-${++_idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

interface RunStore {
  runs: TestRun[];

  // Run
  updateRunName: (runId: string, name: string) => void;

  // Section
  renameSection: (runId: string, sectionId: string, newName: string) => void;
  addSection: (runId: string) => void;
  deleteSection: (runId: string, sectionId: string) => void;

  // TestCase
  updateStatus: (runId: string, caseId: string, status: Status) => void;
  editTestCase: (runId: string, caseId: string, code: string, title: string, detail: string[]) => void;
  updateComment: (runId: string, caseId: string, comment: string) => void;
  addTestCase: (runId: string, sectionId: string) => void;
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

/** Recursively map all sections (including children) */
function mapSectionsDeep(
  sections: Section[],
  fn: (s: Section) => Section
): Section[] {
  return sections.map((s) => {
    const mapped = fn(s);
    return {
      ...mapped,
      children: mapped.children ? mapSectionsDeep(mapped.children, fn) : [],
    };
  });
}

/** Recursively map a test case across all sections */
function mapCase(
  sections: Section[],
  caseId: string,
  fn: (tc: import("./dummy-data").TestCase) => import("./dummy-data").TestCase
): Section[] {
  return mapSectionsDeep(sections, (s) => ({
    ...s,
    cases: s.cases.map((tc) => (tc.id === caseId ? fn(tc) : tc)),
  }));
}

/** Collect all cases recursively from sections */
function collectAllCases(sections: Section[]): import("./dummy-data").TestCase[] {
  const result: import("./dummy-data").TestCase[] = [];
  for (const s of sections) {
    result.push(...s.cases);
    if (s.children && s.children.length > 0) {
      result.push(...collectAllCases(s.children));
    }
  }
  return result;
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

/** Find which section a case belongs to (recursive) */
function findSectionForCase(runs: TestRun[], runId: string, caseId: string): string {
  const run = runs.find((r) => r.id === runId);
  if (!run) return "";

  function searchSections(sections: Section[]): string {
    for (const s of sections) {
      if (s.cases.some((tc) => tc.id === caseId)) return s.name;
      if (s.children && s.children.length > 0) {
        const found = searchSections(s.children);
        if (found) return found;
      }
    }
    return "";
  }

  return searchSections(run.sections);
}

/** Find a section by id (recursive), apply fn, and return updated sections */
function mapSectionById(
  sections: Section[],
  sectionId: string,
  fn: (s: Section) => Section
): Section[] {
  return sections.map((s) => {
    if (s.id === sectionId) return fn(s);
    if (s.children && s.children.length > 0) {
      return { ...s, children: mapSectionById(s.children, sectionId, fn) };
    }
    return s;
  });
}

/** Filter out a section by id (recursive) */
function filterSectionById(sections: Section[], sectionId: string): Section[] {
  return sections
    .filter((s) => s.id !== sectionId)
    .map((s) => ({
      ...s,
      children: s.children ? filterSectionById(s.children, sectionId) : [],
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

      renameSection: (runId, sectionId, newName) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: mapSectionById(r.sections, sectionId, (s) => ({ ...s, name: newName })),
          })),
        })),

      addSection: (runId) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: [...r.sections, { id: genSectionId(), name: "새 섹션", cases: [], children: [] }],
          })),
        })),

      deleteSection: (runId, sectionId) =>
        set((state) => ({
          runs: mapRun(state.runs, runId, (r) => ({
            ...r,
            sections: filterSectionById(r.sections, sectionId),
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

      addTestCase: (runId, sectionId) =>
        set((state) => {
          const run = state.runs.find((r) => r.id === runId);
          if (!run) return state;

          const allCodes = collectAllCases(run.sections)
            .map((c) => c.code)
            .filter((code) => /^C\d+$/.test(code))
            .map((code) => parseInt(code.slice(1), 10));
          const maxCode = allCodes.length > 0 ? Math.max(...allCodes) : 0;
          const newCode = `C${String(maxCode + 1).padStart(3, "0")}`;
          const newTitle = "새 테스트케이스";

          // Find section name for change log
          let sectionName = "";
          function findName(sections: Section[]) {
            for (const s of sections) {
              if (s.id === sectionId) { sectionName = s.name; return; }
              if (s.children) findName(s.children);
            }
          }
          findName(run.sections);

          return {
            runs: mapRun(state.runs, runId, (r) => ({
              ...r,
              sections: mapSectionById(r.sections, sectionId, (s) => ({
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
              })),
            })),
            sessions: recordChange(state.sessions, state.activeSessionId, "add", sectionName, newCode, newTitle),
          };
        }),

      deleteTestCase: (runId, caseId) =>
        set((state) => {
          const sectionName = findSectionForCase(state.runs, runId, caseId);
          const run = state.runs.find((r) => r.id === runId);
          const tc = run ? collectAllCases(run.sections).find((c) => c.id === caseId) : undefined;

          return {
            runs: mapRun(state.runs, runId, (r) => ({
              ...r,
              sections: mapSectionsDeep(r.sections, (s) => ({
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

          const allCodes = collectAllCases(run.sections)
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
              sections: mapSectionsDeep(r.sections, (s) => {
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
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        if (Array.isArray(state.runs)) {
          const seenIds = new Set<string>();
          let sectionCounter = 0;
          function migrateSections(sections: Section[]) {
            for (const section of sections) {
              // Ensure id exists
              if (!section.id) {
                section.id = `sec-mig-${++sectionCounter}`;
              }
              // Ensure children array exists
              if (!Array.isArray(section.children)) {
                (section as Record<string, unknown>).children = [];
              }
              for (const tc of section.cases) {
                if (!Array.isArray(tc.detail)) {
                  tc.detail = [];
                }
                if (seenIds.has(tc.id)) {
                  tc.id = genId();
                }
                seenIds.add(tc.id);
              }
              if (section.children && section.children.length > 0) {
                migrateSections(section.children);
              }
            }
          }
          for (const run of state.runs as TestRun[]) {
            migrateSections(run.sections);
          }
        }
        return state as unknown as RunStore;
      },
    }
  )
);
