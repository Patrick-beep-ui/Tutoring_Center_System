const CATEGORY_LABELS = {
    unaccepted_session: "Unaccepted Session",
    new_tutor_registered: "New Tutor Registered",
    high_cancellation: "High Cancellation",
    low_attendance: "Low Attendance",
    session_completed: "Session Completed",
    session_scheduled: "Session Scheduled",
    session_canceled: "Session Canceled",
    comment_added: "Comment Added",
    weekly_report_ready: "Weekly Report Ready",
    feedback_received: "Feedback Received",
};

export const alertCategoryLabel = (category) => {
    if (!category) return "Alert";
    return CATEGORY_LABELS[category] || genericLabel(category);
};

const genericLabel = (raw) =>
    raw
        .split("_")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
