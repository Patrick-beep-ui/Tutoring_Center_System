import { describe, it, expect } from 'vitest';
import { matchesCourseFilters } from '@/lib/courseFilters';

const courses = [
  { course_id: 1, course_name: 'Algebra', course_code: 'MAT101', major_id: 1, offered: 1 },
  { course_id: 2, course_name: 'Physics', course_code: 'FIS201', major_id: 1, offered: 1 },
  { course_id: 3, course_name: 'Biology', course_code: 'BIO101', major_id: 2, offered: 0 },
  { course_id: 4, course_name: 'Chemistry', course_code: 'QUI101', major_id: 2, offered: 1 },
];

const majors = [
  { major_id: 1, major_name: 'Mathematics' },
  { major_id: 2, major_name: 'Sciences' },
];

describe('matchesCourseFilters', () => {
  it('returns true when no filters are applied', () => {
    expect(courses.every((c) => matchesCourseFilters(c, {}))).toBe(true);
  });

  it('filters to offered-only courses when offeredOnly is true', () => {
    const result = courses.filter((c) => matchesCourseFilters(c, { offeredOnly: true }));
    expect(result.map((c) => c.course_id)).toEqual([1, 2, 4]);
  });

  it('keeps all courses when offeredOnly is false', () => {
    expect(courses.filter((c) => matchesCourseFilters(c, { offeredOnly: false }))).toHaveLength(4);
  });

  it('filters by program (major name)', () => {
    const result = courses.filter((c) => matchesCourseFilters(c, { programFilter: 'Mathematics', majors }));
    expect(result.map((c) => c.course_id)).toEqual([1, 2]);
  });

  it('returns empty when the program has no matching courses', () => {
    const result = courses.filter((c) => matchesCourseFilters(c, { programFilter: 'Engineering', majors }));
    expect(result).toHaveLength(0);
  });

  it('ignores program filter when it is "all"', () => {
    const result = courses.filter((c) => matchesCourseFilters(c, { programFilter: 'all', majors }));
    expect(result).toHaveLength(4);
  });

  it('filters to exactly the selected course', () => {
    const result = courses.filter((c) => matchesCourseFilters(c, { selectedCourse: { course_id: 3 } }));
    expect(result.map((c) => c.course_id)).toEqual([3]);
  });

  it('combines offered, program and selected course filters', () => {
    const result = courses.filter((c) =>
      matchesCourseFilters(c, { offeredOnly: true, programFilter: 'Mathematics', majors, selectedCourse: { course_id: 1 } })
    );
    expect(result.map((c) => c.course_id)).toEqual([1]);
  });
});
