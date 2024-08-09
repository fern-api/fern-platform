import type { ReactElement, SVGProps } from "react";
const SvgUserPlus = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.75 0A3.25 3.25 0 0 0 2.5 3.25v.5A3.25 3.25 0 0 0 5.75 7h.5A3.25 3.25 0 0 0 9.5 3.75v-.5A3.25 3.25 0 0 0 6.25 0zM4 3.25c0-.966.784-1.75 1.75-1.75h.5C7.216 1.5 8 2.284 8 3.25v.5A1.75 1.75 0 0 1 6.25 5.5h-.5A1.75 1.75 0 0 1 4 3.75zm8.25 4V9h1.5V7.25h1.75v-1.5h-1.75V4h-1.5v1.75H10.5v1.5zM1.5 13.17v1.33h9v-1.33a4.84 4.84 0 0 0-4.33-2.67h-.34a4.84 4.84 0 0 0-4.33 2.67m-1.431-.484A6.34 6.34 0 0 1 5.829 9h.342a6.34 6.34 0 0 1 5.76 3.686l.069.15V16H0v-3.165z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgUserPlus;
