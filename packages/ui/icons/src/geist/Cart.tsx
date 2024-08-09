import type { ReactElement, SVGProps } from "react";
const SvgCart = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 2.5h.958c.452 0 .864.243 1.085.628L2.5 4.5l1.43 4.29a2.5 2.5 0 0 0 2.372 1.71h6.149a2.5 2.5 0 0 0 2.45-2.01L15.7 4.5 16 3H3.623l-.12-.293A2.75 2.75 0 0 0 .958 1H0zm4.081 2 1.272 3.816A1 1 0 0 0 6.302 9h6.149a1 1 0 0 0 .98-.804l.74-3.696H4.08zM12.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m-8-1.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCart;
