import { memo, useContext } from 'react';
import { FaDownload, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import { Tab } from '@headlessui/react';
import Header from '../components/Header';
import SessionsReport from "../components/reports/SessionsReport";
import TutorsReport from "../components/reports/TutorsReport";
import StudentsReport from "../components/reports/StudentsReport";
import DepartmentReport from "../components/reports/DepartmentReports";
import { SemesterContext } from '../context/currentSemester';

function ReportsPage() {
  const { semesters, selectedSemesterId, setSelectedSemesterId } = useContext(SemesterContext);

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
                      className="h-9 w-auto rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                    <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <FaCalendarAlt className="text-lg" />
                      Date Range
                    </button>
                    <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <FaDownload className="text-lg" />
                      Export
                    </button>
                    <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
                        `rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${selected 
                          ? "border-border bg-card text-foreground shadow-sm"
                          : "border-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground"}`
                      }
                    >
                      {tab}
                    </Tab>
                  ))}
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel><SessionsReport /></Tab.Panel>
                    <Tab.Panel><TutorsReport /></Tab.Panel>
                    <Tab.Panel><StudentsReport /></Tab.Panel>
                    <Tab.Panel><DepartmentReport /></Tab.Panel>
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
