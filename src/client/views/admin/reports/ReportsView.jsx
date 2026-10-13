import { memo, useContext, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import { Tab } from '@headlessui/react';
import Header from '../../../components/shared/Header';
import SessionsReport from "../../../components/admin/reports/SessionsReport";
import TutorsReport from "../../../components/admin/reports/TutorsReport";
import StudentsReport from "../../../components/admin/reports/StudentsReport";
import DepartmentReport from "../../../components/admin/reports/DepartmentReports";
import { SemesterContext } from '../../../context/currentSemester';
import DateRangeSelector from '../../../components/shared/filters/DateRangeSelector';

function ReportsPage() {
  const { semesters, selectedSemesterId, setSelectedSemesterId } = useContext(SemesterContext);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
    <Header/>
    <section className="h-full w-full overflow-y-auto px-5 pb-5 pt-[70px] min-[992px]:pl-[var(--sidebar-content-offset)] max-[600px]:px-[30px] max-[600px]:pt-[100px]">
      <div className="flex min-h-full flex-col bg-muted">
        <main className="min-h-0 flex-1 overflow-auto p-6">
          <div className="mx-auto w-full max-w-[1320px]">
            <div className="mb-6 overflow-hidden rounded-md border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-card px-4 py-3">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                  <h2 className="text-xl font-medium">Analytics Dashboard</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 w-auto cursor-pointer rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors enabled:hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Select semester"
                      value={selectedSemesterId ?? ""}
                      onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                      disabled={!semesters.length}
                    >
                      {semesters.map(s => (
                        <option key={s.semester_id} value={s.semester_id}>
                          {s.semester_code}{s.is_current ? " (current)" : ""}
                        </option>
                      ))}
                    </select>
                    <DateRangeSelector
                      from={dateRange.from}
                      to={dateRange.to}
                      onFromChange={(from) => setDateRange((current) => ({ ...current, from }))}
                      onToChange={(to) => setDateRange((current) => ({ ...current, to }))}
                    />
                    <button type="button" onClick={() => setRefreshKey((current) => current + 1)} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <FaSyncAlt className="text-lg" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4">
                <Tab.Group>
                  <Tab.List className="mb-4 flex flex-wrap gap-1" aria-label="Analytics reports">
                  {["Sessions", "Tutors", "Students", "Majors"].map((tab) => (
                  <Tab
                      key={tab}
                      className={({ selected }) =>
                        `cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${selected 
                          ? "border-border bg-card text-foreground shadow-sm hover:bg-muted"
                          : "border-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground"}`
                      }
                    >
                      {tab}
                    </Tab>
                  ))}
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel><SessionsReport dateRange={dateRange} refreshKey={refreshKey} /></Tab.Panel>
                    <Tab.Panel><TutorsReport dateRange={dateRange} refreshKey={refreshKey} /></Tab.Panel>
                    <Tab.Panel><StudentsReport dateRange={dateRange} refreshKey={refreshKey} /></Tab.Panel>
                    <Tab.Panel><DepartmentReport dateRange={dateRange} refreshKey={refreshKey} /></Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
    </>
  );
}

export default memo(ReportsPage);
