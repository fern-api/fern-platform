import type { ReactElement, SVGProps } from "react";
const SvgHeartFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="M1.394 2.144A4.76 4.76 0 0 1 8 2.024a4.76 4.76 0 0 1 6.606 6.851L8 15.481 1.394 8.875a4.76 4.76 0 0 1 0-6.73z"
        />
    </svg>
);
export default SvgHeartFill;
