import type { ReactElement, SVGProps } from "react";
const SvgStatusSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
    </svg>
);
export default SvgStatusSmall;
