import { ModeToggle } from "@/components/mode-toggle";
import SignOutButton from "@/components/sign-out-button";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import "./globals.css";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Fern Docs FGA",
    description: "Fern Docs - Fine-grained access control",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): React.ReactElement {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <header className="flex p-4 border-b border-border items-center justify-between">
                        <Image
                            src="/fern-logo.svg"
                            alt="Fern Logo"
                            width={91.333}
                            height={32}
                            className="dark:hidden"
                        />
                        <Image
                            src="/fern-logo-dark.svg"
                            alt="Fern Logo"
                            width={91.333}
                            height={32}
                            className="hidden dark:block"
                        />
                        <div className="flex items-center gap-2">
                            <SignOutButton />
                            <ModeToggle />
                        </div>
                    </header>
                    <AuthKitProvider>{children}</AuthKitProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
