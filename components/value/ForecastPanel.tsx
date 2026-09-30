import type { DepartmentId } from "@/data/mockEnterprise";
import { departmentForecast, departmentById } from "@/data/mockEnterprise";
import { usdKRange, usdK } from "@/lib/format";
import { Card, ClaudeMark } from "@/components/ui";

export function ForecastPanel({ dept }: { dept: DepartmentId }) {
  const f = departmentForecast(dept);
  const d = departmentById(dept)!;
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
          <ClaudeMark className="h-3 w-3" />
        </span>
        <h3 className="text-sm font-semibold text-ink">
          Spend forecast — next month
        </h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Based on ~{f.plannedCount.toLocaleString("en-US")} {f.plannedLabel} next
        month and current Claude consumption per {d.forecastDriverUnit}, expected{" "}
        {d.name} Claude spend is{" "}
        <span className="font-semibold text-ink">
          {usdKRange(f.low, f.high)}
        </span>
        .
      </p>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
        <div>
          <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
            Planned workload
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">
            {f.plannedCount.toLocaleString("en-US")}
          </div>
          <div className="text-2xs text-ink-faint">{f.plannedLabel}</div>
        </div>
        <div>
          <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
            Consumption / unit
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">
            ${f.perUnitCost.toFixed(0)}
          </div>
          <div className="text-2xs text-ink-faint">
            fully-loaded per {d.forecastDriverUnit}
          </div>
        </div>
        <div>
          <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
            Forecast range
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">
            {usdKRange(f.low, f.high)}
          </div>
          <div className="text-2xs text-ink-faint">modeled scenario</div>
        </div>
      </div>

      <p className="mt-4 text-2xs leading-relaxed text-ink-faint">
        Forecast is driven by expected <span className="italic">work</span>, not
        token extrapolation. The per-unit figure is{" "}
        <span className="font-medium">fully loaded</span> — total {d.name} spend
        divided by planned {d.forecastDriverUnit}s — so it assumes the current
        mix of work per {d.forecastDriverUnit} holds. The range is a modeled
        −6% / +11% scenario, not an empirically calibrated confidence interval.
      </p>
    </Card>
  );
}
