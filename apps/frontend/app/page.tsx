import { HealthPanel } from "./components/health-panel";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Syntra</p>
          <h1>Developer Workspace</h1>
          <p className={styles.summary}>
            Monorepo-ready frontend and backend foundations with shared
            contracts, versioned APIs, and a scalable service flow.
          </p>
        </div>
        <HealthPanel />
      </section>
    </main>
  );
}
