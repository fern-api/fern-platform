import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ReactElement } from "react";
import "./globals.scss";

export const metadata: Metadata = {
    title: "Create Next App",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): ReactElement {
    return (
        <html lang="en">
            <body className="antialiased">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
