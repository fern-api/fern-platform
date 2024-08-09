import type { ReactElement, SVGProps } from "react";
const SvgTarget = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m0-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6m0 1.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9M8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTarget;
