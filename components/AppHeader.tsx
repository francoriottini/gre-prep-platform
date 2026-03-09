"use client";

import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/components/I18nProvider";

export function AppHeader() {
  const { tr } = useI18n();

  return (
    <header className="app-header">
      <div className="brand-block">
        <h1>{tr("appTitle")}</h1>
        <p>{tr("appSubtitle")}</p>
      </div>
      <nav className="main-nav">
        <Link href="/">Quiz</Link>
        <Link href="/dashboard">{tr("dashboard")}</Link>
      </nav>
      <div className="controls">
        <LanguageToggle />
        <AuthStatus />
      </div>
    </header>
  );
}
