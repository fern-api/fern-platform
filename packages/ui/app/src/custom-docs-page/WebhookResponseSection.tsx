export const WebhookResponseSection: React.FC = () => {
    return (
        <div className="border-border flex flex-col overflow-hidden rounded-md border">
            <div className="flex flex-col items-start p-3">
                <div className="flex items-baseline space-x-2">
                    <div className="rounded bg-green-500/20 p-1 text-xs text-green-400">{200}</div>
                    <div className="text-text-default text-xs">any</div>
                </div>
                <div className="text-text-default mt-3 text-start text-sm font-light leading-7">
                    Return a 200 status to indicate that the data was received successfully.
                </div>
            </div>
        </div>
    );
};
