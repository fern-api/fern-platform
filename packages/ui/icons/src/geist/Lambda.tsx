import type { ReactElement, SVGProps } from "react";
const SvgLambda = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.75 0H2v1.5h.75c.933 0 1.784.536 2.187 1.378l1.436 3.001-.054.119-4 8.688-.314.682 1.363.627.313-.681 3.534-7.676 3.502 7.319c.613 1.28 2.394 1.393 3.163.2l.407-.631-1.261-.813-.406.63a.315.315 0 0 1-.55-.034L6.29 2.23A3.92 3.92 0 0 0 2.75 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLambda;
