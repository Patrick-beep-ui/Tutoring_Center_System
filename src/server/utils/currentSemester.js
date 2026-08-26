import Semester from "../models/Semester.js";

export async function getCurrentSemesterId() {
    const current = await Semester.findOne({ where: { is_current: true } });
    if (!current) {
        throw new Error('No current semester is set');
    }
    return current.semester_id;
}

export async function resolveSemesterId(requested) {
    if (requested) {
        return Number(requested);
    }
    return getCurrentSemesterId();
}
