import type { ReactElement, SVGProps } from "react";
const SvgCornerDownLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 3v-.75H15V10a1 1 0 0 1-1 1H3.56l1.97 1.97.53.53L5 14.56l-.53-.53-3.074-3.073a1 1 0 0 1 0-1.414L4.47 6.47 5 5.94 6.06 7l-.53.53L3.56 9.5h9.94z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerDownLeft;
