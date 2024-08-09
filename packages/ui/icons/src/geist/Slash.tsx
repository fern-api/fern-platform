import type { ReactElement, SVGProps } from "react";
const SvgSlash = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.53 4.47 5 3.94 3.94 5l.53.53 6 6 .53.53L12.06 11l-.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSlash;
