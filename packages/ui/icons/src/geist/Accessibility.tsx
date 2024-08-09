import type { ReactElement, SVGProps } from "react";
const SvgAccessibility = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M4.671 6A2 2 0 0 1 6.65 8.302l-.22 1.431A7 7 0 0 1 6 11.14L4.33 15.2l1.592.688 1.672-3.972c.133-.315.68-.315.812 0l1.672 3.972 1.592-.688L10 11.14a7 7 0 0 1-.43-1.407L9.283 8.43A2 2 0 0 1 11.238 6H14V4.5H2V6z"
        />
    </svg>
);
export default SvgAccessibility;
