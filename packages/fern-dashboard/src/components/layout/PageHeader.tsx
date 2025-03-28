export declare namespace PageHeader {
  export interface Props {
    title: string;
    titleRightContent?: React.JSX.Element;
    subtitle?: string;
    rightContent?: React.JSX.Element;
  }
}

export function PageHeader({
  title,
  titleRightContent,
  subtitle,
  rightContent,
}: PageHeader.Props) {
  return (
    <div className="mb-5 flex justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold dark:text-gray-200">{title}</div>
          {titleRightContent}
        </div>
        {subtitle != null && (
          <div className="text-gray-900 dark:text-gray-400">{subtitle}</div>
        )}
      </div>
      {rightContent}
    </div>
  );
}
