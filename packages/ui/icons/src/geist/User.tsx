import type { ReactElement, SVGProps } from "react";
const SvgUser = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.75 0A3.25 3.25 0 0 0 4.5 3.25v.5A3.25 3.25 0 0 0 7.75 7h.5a3.25 3.25 0 0 0 3.25-3.25v-.5A3.25 3.25 0 0 0 8.25 0zM6 3.25c0-.966.784-1.75 1.75-1.75h.5c.966 0 1.75.784 1.75 1.75v.5A1.75 1.75 0 0 1 8.25 5.5h-.5A1.75 1.75 0 0 1 6 3.75zM2.5 14.5v-1.33a4.84 4.84 0 0 1 4.33-2.67h2.34a4.84 4.84 0 0 1 4.33 2.67v1.33zM6.83 9a6.34 6.34 0 0 0-5.761 3.686l-.069.15V16h14v-3.165l-.069-.15A6.34 6.34 0 0 0 9.171 9H6.829z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgUser;
