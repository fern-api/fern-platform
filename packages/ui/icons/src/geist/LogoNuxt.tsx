import type { ReactElement, SVGProps } from "react";
const SvgLogoNuxt = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#00DC82"
            d="M8.976 13.333h5.948a1.08 1.08 0 0 0 .932-.533 1.06 1.06 0 0 0 0-1.067L11.86 4.876a1.07 1.07 0 0 0-.932-.533 1.08 1.08 0 0 0-.931.533L8.976 6.631 6.98 3.2a1.07 1.07 0 0 0-.932-.533 1.08 1.08 0 0 0-.932.533l-4.97 8.533a1.06 1.06 0 0 0 .393 1.457c.163.094.35.143.538.143H4.81c1.479 0 2.57-.644 3.32-1.9l1.823-3.128.976-1.674 2.93 5.028H9.953zM4.75 11.658l-2.606-.001L6.05 4.953l1.949 3.352-1.305 2.24c-.499.816-1.065 1.113-1.944 1.113"
        />
    </svg>
);
export default SvgLogoNuxt;
