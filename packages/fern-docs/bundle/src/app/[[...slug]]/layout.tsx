"use server";

export default async function Layout({
  children,
  markdown,
}: {
  children: React.ReactNode;
  markdown: React.ReactNode;
}) {
  return (
    <>
      {children}
      <main>{markdown}</main>
    </>
  );
}
