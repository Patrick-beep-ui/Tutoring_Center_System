export const MAX_STUDENTS_PER_SESSION = 100;

export function resolveSessionStudents({
    sessionType = 'individual',
    studentIds,
    students,
    studentId,
    fallbackStudentId
}) {
    if (!['individual', 'group'].includes(sessionType)) {
        return { error: 'Invalid session type' };
    }

    let values;
    if (studentIds !== undefined) {
        if (!Array.isArray(studentIds)) {
            return { error: 'Invalid students payload' };
        }
        values = studentIds;
    } else if (students !== undefined) {
        if (!Array.isArray(students)) {
            return { error: 'Invalid students payload' };
        }
        values = students.map(student => student?.student_id);
    } else {
        values = [studentId ?? fallbackStudentId];
    }

    if (values.length > MAX_STUDENTS_PER_SESSION) {
        return { error: `A session can include at most ${MAX_STUDENTS_PER_SESSION} students` };
    }

    const normalizedStudentIds = values
        .filter(value => typeof value === 'string' || typeof value === 'number')
        .map(value => String(value).trim())
        .filter(Boolean);

    if (new Set(normalizedStudentIds).size !== normalizedStudentIds.length) {
        return { error: 'A student can only be added once per session' };
    }

    if (sessionType === 'individual' && normalizedStudentIds.length !== 1) {
        return { error: 'Individual session must have exactly 1 student' };
    }

    if (sessionType === 'group' && normalizedStudentIds.length < 2) {
        return { error: 'Group session must have at least 2 students' };
    }

    return { studentIds: normalizedStudentIds };
}
