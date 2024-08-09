import type { ReactElement, SVGProps } from "react";
const SvgSpeaker = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m6 10.5.67.158 5.83 2.915V2.427L6.67 5.342 6 5.5H3.5v5zM12.5.75 6 4H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3l6.5 3.25L14 16V0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSpeaker;
