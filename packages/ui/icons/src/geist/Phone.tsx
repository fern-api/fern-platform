import type { ReactElement, SVGProps } from "react";
const SvgPhone = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="transparent"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M5.5 1H2.878a2 2 0 0 0-1.97 2.343l.24 1.385a12 12 0 0 0 9.023 9.613l2.362.567A2 2 0 0 0 15 12.963V10.5l-3.25-2.25-2.5 2.5-4-4 2.5-2.5z"
        />
    </svg>
);
export default SvgPhone;
