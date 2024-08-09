import type { ReactElement, SVGProps } from "react";
const SvgExternalSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M11.5 9.75v1.5a.25.25 0 0 1-.25.25h-6.5a.25.25 0 0 1-.25-.25v-6.5a.25.25 0 0 1 .25-.25H7V3H4.75A1.75 1.75 0 0 0 3 4.75v6.5c0 .966.784 1.75 1.75 1.75h6.5A1.75 1.75 0 0 0 13 11.25V9h-1.5zM8.5 3h3.75a.75.75 0 0 1 .75.75V7.5h-1.5V5.56L8.53 8.53 8 9.06 6.94 8l.53-.53 2.969-2.97H8.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgExternalSmall;
