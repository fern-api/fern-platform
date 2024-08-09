import type { ReactElement, SVGProps } from "react";
const SvgMinus = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" fillRule="evenodd" d="M2 7.25h12v1.5H2z" clipRule="evenodd" />
    </svg>
);
export default SvgMinus;
