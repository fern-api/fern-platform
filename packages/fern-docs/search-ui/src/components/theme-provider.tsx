import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>): React.ReactNode {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
