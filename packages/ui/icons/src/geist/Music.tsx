import type { ReactElement, SVGProps } from "react";
const SvgMusic = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 1.5h-11v12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1zM2.5 0H1v13.5A2.5 2.5 0 0 0 3.5 16h9a2.5 2.5 0 0 0 2.5-2.5V0zm2.75 10.5a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0M6.5 13a2.5 2.5 0 1 1 1.245-4.668V3.5l1.123-.376.002.001.01.013.044.055a7 7 0 0 0 .803.839c.549.486 1.15.843 1.653.843h.625v1.25h-.625c-.943 0-1.803-.575-2.385-1.073v5.288A2.5 2.5 0 0 1 6.5 13"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMusic;
