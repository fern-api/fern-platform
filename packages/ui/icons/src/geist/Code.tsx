import type { ReactElement, SVGProps } from "react";
const SvgCode = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m4.22 12.53.53.53L5.81 12l-.53-.53L1.81 8l3.47-3.47.53-.53-1.06-1.06-.53.53L.396 7.293a1 1 0 0 0 0 1.414zm7.56 0-.53.53L10.19 12l.53-.53L14.19 8l-3.47-3.47-.53-.53 1.06-1.06.53.53 3.824 3.823a1 1 0 0 1 0 1.414z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCode;
