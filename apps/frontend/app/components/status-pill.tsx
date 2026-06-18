import styles from "./status-pill.module.css";

interface StatusPillProps {
  readonly status: "ok" | "degraded" | "loading" | "error";
}

const labelByStatus: Record<StatusPillProps["status"], string> = {
  ok: "Operational",
  degraded: "Degraded",
  loading: "Checking",
  error: "Unavailable",
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`${styles.pill} ${styles[status]}`}>
      {labelByStatus[status]}
    </span>
  );
}
