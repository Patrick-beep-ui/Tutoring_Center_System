import React from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";

const STUDENT_TABLE_HEADER_CLASS =
    "h-16 px-5 py-0 text-left text-[1.1rem] font-bold normal-case tracking-normal text-foreground";

const renderCourseBadges = (coursesString) => {
    if (!coursesString) return null;

    return coursesString.split(",").map((course, index) => {
        const courseName = course.trim();

        return (
            <Badge
                key={`${courseName}-${index}`}
                variant="outline"
                className="border-transparent bg-transparent px-2.5 py-1 text-sm font-normal text-foreground ring-1 ring-inset ring-primary"
            >
                {courseName}
            </Badge>
        );
    });
};

const studentColumns = [
    {
        accessorKey: "student_name",
        header: "Name",
        cell: ({ row }) => {
            const student = row.original;

            return (
                <div className="flex items-center">
                    <Link
                        to={`/profile/student/${student.id}`}
                        className="inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <img
                            src={`/profile/student${student.id}.webp`}
                            alt={`${student.student_name} profile`}
                            className="size-[45px] rounded-full object-cover"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = "/profile/profile.webp";
                            }}
                        />
                    </Link>
                    <div className="ml-3 py-2.5">
                        <p className="mb-1 text-[1.1rem]">
                            {student.student_name}
                        </p>
                        <p className="m-0 text-sm text-muted-foreground">
                            {student.student_email}
                        </p>
                    </div>
                </div>
            );
        },
        meta: {
            headerClassName: STUDENT_TABLE_HEADER_CLASS,
            cellClassName: "py-0 pl-6",
        },
    },
    {
        accessorKey: "student_major",
        header: "Major",
        cell: ({ row }) => (
            <p className="m-0 text-[1.1rem]">{row.original.student_major}</p>
        ),
        meta: {
            headerClassName: STUDENT_TABLE_HEADER_CLASS,
            cellClassName: "py-0",
        },
    },
    {
        accessorKey: "student_courses_names",
        header: "Courses",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1.5 py-2.5">
                {renderCourseBadges(row.original.student_courses_names)}
            </div>
        ),
        meta: {
            headerClassName: STUDENT_TABLE_HEADER_CLASS,
            cellClassName: "whitespace-normal py-0",
        },
    },
    {
        accessorKey: "student_id",
        header: "ID",
        cell: ({ row }) => (
            <span className="text-[1.1rem]">{row.original.student_id}</span>
        ),
        meta: {
            headerClassName: STUDENT_TABLE_HEADER_CLASS,
            cellClassName: "py-0",
        },
    },
];

export { studentColumns };
