import type { ReactElement, SVGProps } from "react";
const SvgRotateClockwise = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 8c0-3.034 2.474-5.5 5.535-5.5a5.53 5.53 0 0 1 5.328 4H10V8h5.25a.75.75 0 0 0 .75-.75V2h-1.5v3.233A7.04 7.04 0 0 0 8.035 1C4.154 1 1 4.13 1 8s3.154 7 7.035 7a7.04 7.04 0 0 0 5.694-2.888l.443-.605-1.211-.885-.443.605A5.54 5.54 0 0 1 8.035 13.5C4.975 13.5 2.5 11.034 2.5 8"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRotateClockwise;
