import React from "react";

import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  success: "success",
  completed: "success",
  complete: "success",
  active: "success",
  approved: "success",
  info: "information",
  information: "information",
  scheduled: "information",
  warning: "warning",
  pending: "warning",
  danger: "destructive",
  destructive: "destructive",
  canceled: "destructive",
  cancelled: "destructive",
  declined: "destructive",
  rejected: "destructive",
  urgent: "destructive",
  neutral: "neutral",
  inactive: "neutral",
};

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBadge({ status, label, className, ...props }) {
  const normalizedStatus = normalizeStatus(status);
  const variant = STATUS_VARIANTS[normalizedStatus] ?? "neutral";

  return (
    <Badge
      data-status={normalizedStatus || "unknown"}
      variant={variant}
      className={className}
      {...props}
    >
      {label ?? formatStatus(normalizedStatus)}
    </Badge>
  );
}

export { STATUS_VARIANTS, StatusBadge };
