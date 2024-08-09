import type { ReactElement, SVGProps } from "react";
const SvgSkipBack = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m5.147 7.111-.031.02-.583.371-.452.287a.25.25 0 0 0 0 .422l.452.287.583.371.031.02 8.103 5.157.08.05.704.449.332.21a.25.25 0 0 0 .384-.21V1.455a.25.25 0 0 0-.384-.21l-.332.21-.703.448-.081.052zm8.103-3.378L6.544 8l6.706 4.268V3.732zM.75 2v-.75h1.5v13.5H.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSkipBack;
