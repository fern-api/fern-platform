import type { ReactElement, SVGProps } from "react";
const SvgSortDescending = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.75 12H1v-1.5h5V12zm0-4.25H1v-1.5h4v1.5zm0-4.25H1V2h7v1.5zm10.78 11.28a.75.75 0 0 1-1.06 0l-2.25-2.25-.53-.53 1.06-1.06.53.53.97.97V2h1.5v10.44l.97-.97.53-.53L15.31 12l-.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSortDescending;
