import { memo } from 'react';
import { FaSearch, FaBell, FaDownload, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import { Tab } from '@headlessui/react';
import Header from '../components/Header';
import SessionsReport from "../components/reports/SessionsReport";
import TutorsReport from "../components/reports/TutorsReport";
import StudentsReport from "../components/reports/StudentsReport";
import DepartmentReport from "../components/reports/DepartmentReports";

function ReportsPage() {
  return (
    <>
    <Header/>
    <section className="section admin-reports-section">
    <div className="d-flex flex-column vh-100 bg-light">
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <main className="flex-grow-1 overflow-auto p-4 analytics-dashboard">
          <div className="container">
            <div className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="h5 mb-0">Analytics Dashboard</h2>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                      <FaCalendarAlt className="fs-5" />
                      Date Range
                    </button>
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                      <FaDownload className="fs-5" />
                      Export
                    </button>
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                      <FaSyncAlt className="fs-5" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body bg-light">
                <Tab.Group>
                  <Tab.List className="nav nav-pills mb-4">
                    <Tab className="nav-link">Sessions</Tab>
                    <Tab className="nav-link">Tutors</Tab>
                    <Tab className="nav-link">Students</Tab>
                    <Tab className="nav-link">Majors</Tab>
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
    </div>
    </section>
    </>
  );
}

export default memo(ReportsPage);