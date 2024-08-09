import type { ReactElement, SVGProps } from "react";
const SvgSortAscending = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M12.53 1.22a.75.75 0 0 0-1.06 0L9.22 3.47 8.69 4l1.06 1.06.53-.53.97-.97V14h1.5V3.56l.97.97.53.53L15.31 4l-.53-.53zM1.75 4H1v1.5h5V4zm0 4.25H1v1.5h4v-1.5zm0 4.25H1V14h7v-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSortAscending;
