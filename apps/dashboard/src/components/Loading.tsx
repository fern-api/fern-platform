import { clsx } from "@/lib/utils";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";

interface LoadingProps {
    fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ fullPage = false }: LoadingProps) => {
    return (
        <div className={clsx("bg-background content-center text-center", fullPage ? "h-full w-full" : "w-fit")}>
            <RemoteFontAwesomeIcon
                icon="fa-solid fa-spinner-third"
                className="animate-spin text-black"
                size={fullPage ? 10 : undefined}
            />
        </div>
    );
};
