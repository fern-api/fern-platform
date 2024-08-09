import type { ReactElement, SVGProps } from "react";
const SvgFileZip = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13 6.5v7a1 1 0 0 1-1 1H9v-2H7v-2h2v-2H7v-2H5v2h2v2H5v2h2v2H4a1 1 0 0 1-1-1v-12h5v5zm1.5 0v7A2.5 2.5 0 0 1 12 16H4a2.5 2.5 0 0 1-2.5-2.5V0h7.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707zm-5-4.379L12.379 5H9.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFileZip;
