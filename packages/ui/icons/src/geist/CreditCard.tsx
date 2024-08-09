import type { ReactElement, SVGProps } from "react";
const SvgCreditCard = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14 3H2a.5.5 0 0 0-.5.5V5h13V3.5A.5.5 0 0 0 14 3M1.5 12.5v-6h13v6a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5m.5-11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm2 9.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCreditCard;
