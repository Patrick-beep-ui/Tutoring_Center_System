import { memo } from "react";
import { Tab } from "@headlessui/react";
import exportToExcel from "../../services/exportChart";
import { exportChartAsImage } from "../../services/exportChartAsImage";

const tabClass = ({ selected }) => [
  "-mb-px rounded-t-md border px-4 py-2 text-sm font-medium transition-colors",
  "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  selected
    ? "border-border border-b-card bg-card text-foreground"
    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
].join(" ");

export const ReportSummaryGrid = ({ children }) => (
  <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    {children}
  </div>
);

export const ReportSummaryCard = memo(({ title, value, change, period = "from last month" }) => (
  <article className="h-full rounded-md border border-border bg-card text-card-foreground shadow-sm">
    <div className="p-4">
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="mb-2 text-[clamp(2rem,5vw,3.5rem)] font-light leading-tight">{value}</p>
      <p className="text-sm text-muted-foreground">
        <span className="text-green-600">{change}</span> {period}
      </p>
    </div>
  </article>
));

const ExportButtons = memo(({ data, refEl, filename, chartType }) => (
  <div className="flex flex-wrap items-center gap-4 px-4 pb-4 pt-1">
    <button
      type="button"
      className="inline-flex min-h-9 items-center justify-center rounded-md border border-primary bg-transparent px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => exportToExcel(data, filename, chartType)}
    >
      Export Data
    </button>
    <button
      type="button"
      className="inline-flex min-h-9 items-center justify-center rounded-md border border-primary bg-transparent px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => exportChartAsImage(refEl.current, "png", filename)}
    >
      Export Chart as Image
    </button>
  </div>
));

export function ReportTabs({ tabs, chartType, onTabChange }) {
  return (
    <Tab.Group onChange={(index) => onTabChange?.(tabs[index])}>
      <Tab.List className="mb-4 flex flex-wrap border-b border-border" aria-label="Report charts">
        {tabs.map((tab) => (
          <Tab key={tab.key} className={tabClass}>
            {tab.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((tab) => (
          <Tab.Panel
            key={tab.key}
            className="rounded-md border border-border bg-card text-left text-card-foreground shadow-sm focus:outline-none"
          >
            <div ref={tab.refEl} className="min-w-0 p-4">
              <h3 className="mb-2 text-xl font-medium">{tab.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{tab.description}</p>
              {tab.chart}
            </div>
            <ExportButtons
              data={tab.data}
              refEl={tab.refEl}
              filename={tab.filename}
              chartType={chartType}
            />
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
