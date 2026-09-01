// Pure course-filtering logic used by the Courses view. Kept in its own
// module so it can be unit-tested without rendering the view.

export function matchesCourseFilters(course, { programFilter, offeredOnly, selectedCourse, majors = [] } = {}) {
  if (offeredOnly) {
    if (course.offered !== 1 && course.offered !== true) return false;
  }

  if (programFilter && programFilter !== "all") {
    const major = majors.find(m => m.major_name === programFilter);
    if (!major) return false;
    if (course.major_id !== major.major_id) return false;
  }

  if (selectedCourse) {
    if (course.course_id !== selectedCourse.course_id) return false;
  }

  return true;
}
