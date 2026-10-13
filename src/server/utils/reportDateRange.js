import { Op } from "sequelize";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isDate = (value) => {
    if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const getReportDateRange = ({ date_from, date_to }) => {
    if ((date_from && !isDate(date_from)) || (date_to && !isDate(date_to)) || (date_from && date_to && date_from > date_to)) {
        return null;
    }
    return { date_from, date_to };
};

export const reportSessionWhere = ({ date_from, date_to }) => {
    const session_date = {};
    if (date_from) session_date[Op.gte] = date_from;
    if (date_to) session_date[Op.lt] = new Date(new Date(`${date_to}T00:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10);
    if (!date_from && !date_to) return {};
    return { session_date };
};

export const reportSessionSql = (alias, { date_from, date_to }) => {
    let sql = "";
    if (date_from) sql += ` AND ${alias}.session_date >= :date_from`;
    if (date_to) sql += ` AND ${alias}.session_date < DATE_ADD(:date_to, INTERVAL 1 DAY)`;
    return sql;
};
