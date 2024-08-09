import type { ReactElement, SVGProps } from "react";
const SvgPause = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.5 2.5v-.75H4v12.5h1.5zm6.5 0v-.75h-1.5v12.5H12z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPause;
