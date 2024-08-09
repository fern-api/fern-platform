import type { ReactElement, SVGProps } from "react";
const SvgMoreVertical = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m-1.5 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMoreVertical;
