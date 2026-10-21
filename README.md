# Tutoring Center Online

An operations platform built for a university tutoring center to replace spreadsheet-based scheduling and record management.

## Overview

Tutoring Center Online centralizes the workflows required to coordinate students, tutors, courses, availability, appointments, completed sessions, and administrative reporting. The project translates a previously manual process into a role-aware application that can be used by students, tutors, and center staff.

The system was designed and developed directly from the tutoring center's operational requirements. Its goal is not only to display records, but to keep scheduling, participation, and reporting connected in one workflow.

## Core capabilities

- Student, tutor, course, and academic-record management
- Tutor-course assignments and availability management
- Individual and group tutoring-session scheduling
- Calendar-based views for appointments and tutor schedules
- Session reservation and attendance workflows
- Role-based authentication and authorization
- Administrative dashboards, activity views, and reports
- Tutor performance and tutoring-center metrics
- Feedback and announcement workflows
- CSV/Excel and calendar-oriented utilities used by reporting and scheduling flows
- Email support for application notifications

## Architecture

- **Frontend:** React 18, React Router, Vite
- **UI and visualization:** Tailwind CSS, Material UI, Headless UI, FullCalendar, Chart.js, Recharts, and TanStack Table
- **Backend:** Node.js and Express
- **Data:** MySQL with Sequelize
- **Authentication:** Passport, JWT, bcrypt, sessions, and role-aware middleware
- **Operational utilities:** Nodemailer, ICS, JSON-to-CSV, XLSX, Handlebars, and image processing
- **Quality:** Vitest, React Testing Library, Supertest, and rate-limiting middleware

The Express API and React client live in the same repository. Sequelize models and migrations define the relational data layer, while controllers and middleware manage business rules, authorization, scheduling, reports, and notifications.

## Local development

### Prerequisites

- Node.js 18 or newer
- npm
- MySQL

### Setup

~~~bash
git clone https://github.com/Patrick-beep-ui/Tutoring_Center_System.git
cd Tutoring_Center_System
npm install
~~~

Configure the environment variables required by the Express server, including the MySQL connection, JWT secret, frontend URL, and any email settings used in your environment. Apply the database migrations and start the application:

~~~bash
npm run db:migrate
npm run dev
~~~

## Available scripts

~~~bash
npm run dev         # Run the Express/Vite application in development
npm run start       # Start the production server
npm run build       # Build the React client
npm run db:migrate  # Apply database migrations
npm run test        # Run the Vitest suite
~~~

## Project context

This system was developed for the university tutoring center after mapping its spreadsheet-based process with non-technical stakeholders. The work covered architecture, database design, frontend and backend implementation, authentication, scheduling logic, reporting, testing, deployment, and iterative improvements based on center needs.

## Privacy

The repository should only be used with development or anonymized data. Student records, credentials, and institutional information must not be committed to source control.

