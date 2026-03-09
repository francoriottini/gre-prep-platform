import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { I18nProvider } from "@/components/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GRE Quant Gratis",
  description: "Free GRE Quant practice platform focused on LatAm learners."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <main className="page">
            <AppHeader />
            <div className="content">{children}</div>
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
