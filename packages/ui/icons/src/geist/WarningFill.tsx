import type { ReactElement, SVGProps } from "react";
const SvgWarningFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.558.5a1.5 1.5 0 0 1 1.351.848l5.898 12.217a1 1 0 0 1-.9 1.435H1.093a1 1 0 0 1-.9-1.435L6.09 1.348A1.5 1.5 0 0 1 7.44.5zm.192 4.25v4h-1.5v-4zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgWarningFill;
