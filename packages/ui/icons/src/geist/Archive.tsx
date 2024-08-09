import type { ReactElement, SVGProps } from "react";
const SvgArchive = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 3.5h13v2h-13zM1 7H0V2h16v5h-1v5.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5zm1.5 0v5.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V7zM6 9.5h4V11H6z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArchive;
