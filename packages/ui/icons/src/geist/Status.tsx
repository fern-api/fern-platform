import type { ReactElement, SVGProps } from "react";
const SvgStatus = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" d="M13 8A5 5 0 1 1 3 8a5 5 0 0 1 10 0" />
    </svg>
);
export default SvgStatus;
