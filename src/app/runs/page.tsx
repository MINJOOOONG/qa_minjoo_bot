"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { countByStatus } from "@/lib/dummy-data";
import { useRunStore } from "@/lib/store";

type SortKey = "name" | "date" | "progress";
type SortDir = "asc" | "desc";

export default function RunsPage() {
  const runs = useRunStore((s) => s.runs);
  const sessions = useRunStore((s) => s.sessions);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Compute stats for each run
  const runsWithStats = useMemo(
    () =>
      runs.map((run) => {
        const stats = countByStatus(run.sections);
        const pct = stats.total > 0 ? (stats.tested / stats.total) * 100 : 0;
        const activeSessions = sessions.filter(
          (s) => s.runId === run.id && s.endedAt === null
        );
        const isActive = activeSessions.length > 0;
        return { run, stats, pct, isActive };
      }),
    [runs, sessions]
  );

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return runsWithStats;
    const q = search.trim().toLowerCase();
    return runsWithStats.filter((r) => r.run.name.toLowerCase().includes(q));
  }, [runsWithStats, search]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.run.name.localeCompare(b.run.name);
      else if (sortKey === "date") cmp = a.run.createdAt.localeCompare(b.run.createdAt);
      else cmp = a.pct - b.pct;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-0.5">↕</span>;
    return <span className="text-blue-500 ml-0.5">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="shrink-0 border-b border-gray-200 bg-white z-10">
        <div className="px-6 py-3 flex items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold text-gray-900">Test Runs</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">
              QA 테스트 실행 관리 · {runsWithStats.length}개 런
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Run 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white placeholder:text-gray-300"
            />
          </div>

          <Link
            href="/sessions"
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Sessions
          </Link>
        </div>
      </header>

      {/* ── Body: Table ────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[13px] text-gray-400">일치하는 런이 없습니다</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  <th className="text-left px-3 py-2 font-medium">
                    <button onClick={() => toggleSort("name")} className="flex items-center cursor-pointer hover:text-gray-600 transition-colors">
                      Run <SortIndicator col="name" />
                    </button>
                  </th>
                  <th className="text-left px-3 py-2 font-medium w-[80px]">Cases</th>
                  <th className="text-left px-3 py-2 font-medium w-[200px]">Status</th>
                  <th className="text-left px-3 py-2 font-medium w-[160px]">
                    <button onClick={() => toggleSort("progress")} className="flex items-center cursor-pointer hover:text-gray-600 transition-colors">
                      Progress <SortIndicator col="progress" />
                    </button>
                  </th>
                  <th className="text-left px-3 py-2 font-medium w-[110px]">
                    <button onClick={() => toggleSort("date")} className="flex items-center cursor-pointer hover:text-gray-600 transition-colors">
                      Created <SortIndicator col="date" />
                    </button>
                  </th>
                  <th className="w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(({ run, stats, pct, isActive }) => (
                  <tr
                    key={run.id}
                    className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Run name */}
                    <td className="px-3 py-2.5">
                      <Link href={`/runs/${run.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {run.name}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-px rounded-full font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              진행중
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Total cases */}
                    <td className="px-3 py-2.5">
                      <Link href={`/runs/${run.id}`} className="block">
                        <span className="text-[12px] text-gray-500 tabular-nums">
                          {stats.total}개
                        </span>
                      </Link>
                    </td>

                    {/* Status pills */}
                    <td className="px-3 py-2.5">
                      <Link href={`/runs/${run.id}`} className="block">
                        <div className="flex items-center gap-1 text-[11px] tabular-nums">
                          {stats.passed > 0 && (
                            <span className="px-1.5 py-px rounded bg-emerald-50 text-emerald-600 font-medium">
                              {stats.passed} P
                            </span>
                          )}
                          {stats.failed > 0 && (
                            <span className="px-1.5 py-px rounded bg-red-50 text-red-600 font-medium">
                              {stats.failed} F
                            </span>
                          )}
                          {stats.na > 0 && (
                            <span className="px-1.5 py-px rounded bg-gray-100 text-gray-500">
                              {stats.na} N/A
                            </span>
                          )}
                          {stats.total - stats.tested > 0 && (
                            <span className="px-1.5 py-px rounded bg-yellow-50 text-yellow-600">
                              {stats.total - stats.tested} 미수행
                            </span>
                          )}
                          {stats.total === 0 && (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Progress bar */}
                    <td className="px-3 py-2.5">
                      <Link href={`/runs/${run.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                backgroundColor:
                                  pct === 100
                                    ? "#10b981"
                                    : pct > 0
                                    ? "#3b82f6"
                                    : "transparent",
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500 tabular-nums font-medium w-10 text-right">
                            {stats.tested}/{stats.total}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2.5">
                      <Link href={`/runs/${run.id}`} className="block">
                        <span className="text-[11px] text-gray-400 tabular-nums">{run.createdAt}</span>
                      </Link>
                    </td>

                    {/* Arrow */}
                    <td className="px-3 py-2.5">
                      <Link href={`/runs/${run.id}`} className="block">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="text-gray-300 group-hover:text-gray-500 transition-colors">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
