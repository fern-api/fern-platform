import type { ReactElement, SVGProps } from "react";
const SvgSkipForward = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m10.603 7.111.031.02.583.371.452.287a.25.25 0 0 1 0 .422l-.452.287-.583.371-.031.02L2.5 14.046l-.08.05-.704.449-.332.21a.25.25 0 0 1-.384-.21V1.455a.25.25 0 0 1 .384-.21l.332.21.703.448.081.052zM2.5 3.733 9.206 8 2.5 12.268V3.732zM15 2v-.75h-1.5v13.5H15z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSkipForward;
