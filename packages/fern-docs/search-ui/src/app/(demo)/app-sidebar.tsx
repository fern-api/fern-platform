import { useSearchParams } from "next/navigation";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Building Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({
  children,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  const params = useSearchParams();
  const domain = params.get("domain");
  return (
    <div {...props} className="fixed inset-0 flex flex-col">
      <div className="shrink-0 p-2 px-4">
        <h2 className="font-semibold">
          {domain ?? "buildwithfern.com"} Search Demo
        </h2>
      </div>
      {children}
    </div>
  );
}

export const AppSidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>((props, ref) => {
  return (
    <div ref={ref} {...props} className="px-2 py-4">
      {data.navMain.map((item) => (
        <div key={item.title} className="mb-4">
          <h5 className="mx-2 flex h-[36px] items-center font-semibold">
            {item.title}
          </h5>
          <div>
            {item.items.map((item) => (
              <a
                href={item.url}
                key={item.title}
                className="flex h-[36px] items-center rounded-md px-2 transition-colors hover:bg-[var(--accent-a3)] hover:text-[var(--accent-a11)] hover:transition-none"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
AppSidebarContent.displayName = "AppSidebarContent";
