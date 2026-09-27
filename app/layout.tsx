import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/components/AppState";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Northstar — Value & deployment · Claude Enterprise",
  description:
    "Make AI value legible, then decide which workflows should receive which capabilities and how much consumption to fund.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas font-sans text-ink antialiased">
        <AppStateProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
