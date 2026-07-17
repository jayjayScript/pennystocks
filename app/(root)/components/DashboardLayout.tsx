import React from "react";
import Link from "next/link";
import styles from "./DashboardLayout.module.css";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pennystocks Dashboard</h1>
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/admin" className={styles.link}>Admin</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
