import { Markdown } from "../markdown/Markdown";

const STATUS_200_TEXT = "Return a 200 status to indicate that the data was received successfully.";

export const WebhookResponseSection: React.FC = () => {
    return (
        <div className="border-border-default-light dark:border-border-default-dark flex flex-col overflow-hidden rounded-md border">
            <div className="flex flex-col items-start p-3">
                <div className="flex items-baseline space-x-2">
                    <div className="rounded bg-green-500/20 p-1 text-xs text-green-400">{200}</div>
                    <div className="t-muted text-xs">any</div>
                </div>
                <div className="mt-3 text-start">
                    <Markdown>{STATUS_200_TEXT}</Markdown>
                </div>
            </div>
        </div>
    );
};
