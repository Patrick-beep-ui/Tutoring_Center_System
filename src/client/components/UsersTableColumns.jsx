import React from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";

const USER_TABLE_HEADER_CLASS =
  "h-12 px-5 py-0 text-left text-sm font-semibold normal-case tracking-normal text-[var(--primary)]";

const USER_TYPE_CONFIG = {
  student: {
    nameKey: "student_name",
    emailKey: "student_email",
    majorKey: "student_major",
    coursesKey: "student_courses_names",
    idKey: "student_id",
  },
  tutor: {
    nameKey: "tutor_name",
    emailKey: "tutor_email",
    majorKey: "tutor_major",
    coursesKey: "tutor_courses_names",
    idKey: "tutor_id",
  },
};

function renderCourseBadges(coursesString) {
  if (!coursesString) return null;

  return coursesString.split(",").map((course, index) => {
    const courseName = course.trim();

    return (
      <Badge
        key={`${courseName}-${index}`}
        variant="outline"
        className="rounded-md border-[var(--primary)]/15 bg-[var(--primary)]/5 px-2 py-0.5 text-xs font-medium text-[var(--primary)]"
      >
        {courseName}
      </Badge>
    );
  });
}

function createUserTableColumns(userType) {
  const config = USER_TYPE_CONFIG[userType];

  if (!config) {
    throw new Error(`Unsupported user table type: ${userType}`);
  }

  return [
    {
      accessorKey: config.nameKey,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        const userName = user[config.nameKey];

        return (
          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${userType}/${user.id}`}
              className="inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <img
                src={`/profile/${userType}${user.id}.webp`}
                alt={`${userName} profile`}
                className="size-10 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/profile/profile.webp";
                }}
              />
            </Link>
            <div className="min-w-0">
              <p className="mb-0.5 text-sm font-semibold leading-5 text-foreground">
                {userName}
              </p>
              <p className="m-0 text-xs leading-5 text-muted-foreground">
                {user[config.emailKey]}
              </p>
            </div>
          </div>
        );
      },
      meta: {
        headerClassName: `${USER_TABLE_HEADER_CLASS} w-[30%]`,
        cellClassName: "w-[30%] py-3 pl-5",
      },
    },
    {
      accessorKey: config.majorKey,
      header: "Major",
      cell: ({ row }) => (
        <p className="m-0 text-sm text-foreground">
          {row.original[config.majorKey]}
        </p>
      ),
      meta: {
        headerClassName: `${USER_TABLE_HEADER_CLASS} w-[20%]`,
        cellClassName: "w-[20%] py-3",
      },
    },
    {
      accessorKey: config.coursesKey,
      header: "Courses",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {renderCourseBadges(row.original[config.coursesKey])}
        </div>
      ),
      meta: {
        headerClassName: `${USER_TABLE_HEADER_CLASS} w-[50%]`,
        cellClassName: "w-[50%] whitespace-normal py-3",
      },
    },
    {
      accessorKey: config.idKey,
      header: "ID",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.original[config.idKey]}
        </span>
      ),
      meta: {
        headerClassName: `${USER_TABLE_HEADER_CLASS} w-0 text-right`,
        cellClassName: "w-0 py-3 pr-5 text-right",
      },
    },
  ];
}

const studentColumns = createUserTableColumns("student");
const tutorColumns = createUserTableColumns("tutor");

export { createUserTableColumns, studentColumns, tutorColumns };
