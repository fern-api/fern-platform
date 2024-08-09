import type { ReactElement, SVGProps } from "react";
const SvgCamera = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 3.5h2L5 1h6l1.5 2.5H16v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5v-9zm3.286.772L5.85 2.5h4.302l1.063 1.772.437.728H14.5v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V5h2.85zM9.75 8.5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0m1.5 0a3.25 3.25 0 1 1-6.5 0 3.25 3.25 0 0 1 6.5 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCamera;
