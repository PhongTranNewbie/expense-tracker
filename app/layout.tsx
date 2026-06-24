import type { Metadata } from "next";
import { auth } from "@/auth";
import { AuthControls } from "@/components/auth/auth-controls";
import { DashboardLayout } from "@/components/shell/dashboard-layout";
import { AppToaster } from "@/components/ui/app-toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Expense Tracker",
    template: "%s | Expense Tracker",
  },
  description:
    "A portfolio expense tracker with GitHub login, user-owned data, and spending reports.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('expense-tracker-theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider defaultTheme="system" storageKey="expense-tracker-theme">
          <DashboardLayout
            authControls={
              <AuthControls
                user={
                  session?.user
                    ? {
                        name: session.user.name,
                        email: session.user.email,
                      }
                    : undefined
                }
              />
            }
          >
            {children}
          </DashboardLayout>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
