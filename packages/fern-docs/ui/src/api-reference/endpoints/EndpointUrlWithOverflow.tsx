import cn from "clsx";
import { HorizontalOverflowMask } from "../../components/HorizontalOverflowMask";
import { EndpointUrl } from "./EndpointUrl";

export const EndpointUrlWithOverflow: React.FC<
  Omit<EndpointUrl.Props, "urlStyle"> & {
    playgroundButton?: React.ReactNode;
  }
> = ({ className, playgroundButton, ...props }) => {
  return (
    <HorizontalOverflowMask
      className={cn(
        "flex min-w-0 max-w-full shrink flex-row items-center justify-between",
        className
      )}
    >
      <EndpointUrl {...props} className="max-w-full" />
      {playgroundButton}
    </HorizontalOverflowMask>
  );
};
