import { Markdown } from "../../../mdx/components/Markdown";

const STATUS_200_TEXT =
  "Return a 200 status to indicate that the data was received successfully.";

export const WebhookResponseSection: React.FC = () => {
  return (
    <div className="border-border-default rounded-3/2 flex flex-col overflow-hidden border">
      <div className="flex flex-col items-start p-3">
        <div className="flex items-baseline space-x-2">
          <div className="rounded-1 bg-green-500/20 p-1 text-xs text-green-400">
            {200}
          </div>
          <div className="text-(color:--grayscale-a11) text-xs">any</div>
        </div>

        <Markdown
          mdx={undefined}
          fallback={STATUS_200_TEXT}
          size="sm"
          className="mt-3 text-start"
        />
      </div>
    </div>
  );
};
