import type { ReactElement, SVGProps } from "react";
const SvgHeader = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 2.5h13v2.495h-13zm0 3.745V12.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6.245zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgHeader;
