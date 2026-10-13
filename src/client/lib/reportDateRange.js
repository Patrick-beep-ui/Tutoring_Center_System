export function buildReportUrl(path, semesterId, { from = "", to = "" } = {}) {
    const params = new URLSearchParams();
    if (semesterId) params.set("semester_id", semesterId);
    if (from) params.set("date_from", from);
    if (to) params.set("date_to", to);
    const query = params.toString();
    return `${path}${query ? `?${query}` : ""}`;
}

export function reportDateRangeSuffix({ from = "", to = "" } = {}) {
    if (from && to) return `${from}_to_${to}`;
    if (from) return `from_${from}`;
    if (to) return `through_${to}`;
    return "semester";
}
