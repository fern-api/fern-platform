import type { ReactElement, SVGProps } from "react";
const SvgLockClosedSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.5 6v1h-3V6a1.5 1.5 0 1 1 3 0M5 7V6a3 3 0 0 1 6 0v1h1v4.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 11.5V7z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLockClosedSmall;
