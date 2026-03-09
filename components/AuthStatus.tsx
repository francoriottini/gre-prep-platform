"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthStatus() {
  const { tr } = useI18n();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setEmail(data.session?.user.email ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  if (!email) {
    return (
      <Link href="/login" className="button button-link">
        {tr("login")}
      </Link>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span>{email}</span>
      <button type="button" onClick={handleLogout} className="button button-link">
        {tr("logout")}
      </button>
    </div>
  );
}
