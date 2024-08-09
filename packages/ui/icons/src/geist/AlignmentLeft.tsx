import type { ReactElement, SVGProps } from "react";
const SvgAlignmentLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" fillRule="evenodd" d="M1.75 2H1v1.5h14V2zM1 7h9v1.5H1zm0 5h11v1.5H1z" clipRule="evenodd" />
    </svg>
);
export default SvgAlignmentLeft;
