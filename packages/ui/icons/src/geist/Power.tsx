import type { ReactElement, SVGProps } from "react";
const SvgPower = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.25 8v.75h1.5V0h-1.5zM2.5 8a5.49 5.49 0 0 1 2.2-4.4l-.901-1.2a7 7 0 1 0 8.402 0l-.9 1.2A5.5 5.5 0 1 1 2.5 8"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPower;
