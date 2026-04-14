"use client";

import Link from "next/link";
import { countByStatus } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { useRunStore } from "@/lib/store";

export default function RunsPage() {
  const runs = useRunStore((s) => s.runs);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-xl font-bold mb-6">Test Runs</h1>
      <div className="space-y-2">
        {runs.map((run) => {
          const stats = countByStatus(run.sections);
          return (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className="flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="font-medium text-sm">{run.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{run.createdAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {stats.tested}/{stats.total}
                </span>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.tested / stats.total) * 100 : 0}%` }}
                  />
                </div>
                {stats.failed > 0 && (
                  <Badge variant="destructive">{stats.failed} failed</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
