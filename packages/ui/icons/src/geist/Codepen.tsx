import type { ReactElement, SVGProps } from "react";
const SvgCodepen = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m8 .1.406.261 7.25 4.67.344.221v5.488l-.344.221-7.25 4.67-.406.261-.406-.261-7.25-4.67L0 10.74V5.252l.344-.222L7.594.361 8 .099zM1.5 9.16l1.748-1.164L1.5 6.83zm.565-3.454 2.31 1.539 3-2V2.287zm9.56 1.539-3-2V2.287l5.31 3.42zM14.5 6.83l-1.748 1.165L14.5 9.16V6.831zm-4.002 1.165L8 6.332 5.502 7.996 8 9.66l2.498-1.664zm-3.123 2.75-3-2-2.31 1.54 5.31 3.42zm1.25 2.96 5.31-3.42-2.31-1.54-3 2z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCodepen;
