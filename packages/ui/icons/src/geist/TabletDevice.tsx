import type { ReactElement, SVGProps } from "react";
const SvgTabletDevice = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.75 0A1.75 1.75 0 0 0 1 1.75v12.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 15 14.25V1.75A1.75 1.75 0 0 0 13.25 0zM2.5 1.75a.25.25 0 0 1 .25-.25h10.5a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25zm2.25 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTabletDevice;
