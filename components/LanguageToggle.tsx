"use client";

import { useI18n } from "@/components/I18nProvider";

export function LanguageToggle() {
  const { language, setLanguage, tr } = useI18n();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span>{tr("language")}:</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value === "en" ? "en" : "es")}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}
