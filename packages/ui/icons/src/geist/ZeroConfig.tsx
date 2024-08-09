import type { ReactElement, SVGProps } from "react";
const SvgZeroConfig = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m15.53 1.53.53-.53L15-.06l-.53.53-2.079 2.078a7 7 0 0 0-9.843 9.843L.47 14.47l-.53.53L1 16.06l.53-.53 2.079-2.078a7 7 0 0 0 9.843-9.843zm-4.207 2.087a5.5 5.5 0 0 0-7.706 7.706zm-6.646 8.766 7.706-7.706a5.5 5.5 0 0 1-7.706 7.706"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgZeroConfig;
