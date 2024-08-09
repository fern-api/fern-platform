import type { ReactElement, SVGProps } from "react";
const SvgSkipBackFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.081 8.21a.25.25 0 0 1 0-.42l10.285-6.545a.25.25 0 0 1 .384.21v13.09a.25.25 0 0 1-.384.21L4.08 8.212zM.75 2v-.75h1.5v13.5H.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSkipBackFill;
