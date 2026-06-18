"use client";

import { useHealthQuery } from "../hooks/use-health-query";
import { useServices } from "../services/service-context";
import { StatusPill } from "./status-pill";
import styles from "./health-panel.module.css";

export function HealthPanel() {
  const { healthService } = useServices();
  const healthQuery = useHealthQuery(healthService);
  const status = healthQuery.data?.data.status;

  return (
    <section className={styles.panel} aria-label="Backend health">
      <div className={styles.panelHeader}>
        <div>
          <h2>Backend API</h2>
          <p>Versioned endpoint: /api/v1/health</p>
        </div>
        <StatusPill
          status={
            healthQuery.isLoading
              ? "loading"
              : healthQuery.isError
                ? "error"
                : status ?? "degraded"
          }
        />
      </div>

      <dl className={styles.metrics}>
        <div>
          <dt>Service</dt>
          <dd>{healthQuery.data?.data.service ?? "backend"}</dd>
        </div>
        <div>
          <dt>Uptime</dt>
          <dd>
            {healthQuery.data === undefined
              ? "-"
              : `${Math.round(healthQuery.data.data.uptime)}s`}
          </dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>
            {healthQuery.data === undefined
              ? "-"
              : new Date(healthQuery.data.data.checkedAt).toLocaleTimeString()}
          </dd>
        </div>
      </dl>
    </section>
  );
}
