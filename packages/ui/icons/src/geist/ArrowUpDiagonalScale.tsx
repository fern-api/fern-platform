import type { ReactElement, SVGProps } from "react";
const SvgArrowUpDiagonalScale = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.75 1H9v1.5h3.439l-2.97 2.97-.53.53 1.06 1.06.53-.53 2.97-2.968V7h1.5V2a1 1 0 0 0-1-1zM2.501 12.438V9h-1.5v5a1 1 0 0 0 1 1H7v-1.5H3.56l2.97-2.97.53-.53L6 8.94l-.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowUpDiagonalScale;
