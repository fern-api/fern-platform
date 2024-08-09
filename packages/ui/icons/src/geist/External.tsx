import type { ReactElement, SVGProps } from "react";
const SvgExternal = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 10.25v3a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25V2.75a.25.25 0 0 1 .25-.25H6.5V1H2.75A1.75 1.75 0 0 0 1 2.75v10.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 15 13.25V9.5h-1.5zM9 1h5.25a.75.75 0 0 1 .75.75V7h-1.5V3.56L8.53 8.53 8 9.06 6.94 8l.53-.53 4.969-4.97H9z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgExternal;
