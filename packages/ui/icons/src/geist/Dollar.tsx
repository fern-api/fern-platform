import type { ReactElement, SVGProps } from "react";
const SvgDollar = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.625-12.625v1H9c1.174 0 2.125.951 2.125 2.125h-1.25A.875.875 0 0 0 9 5.625h-.375v1.75H9a2.125 2.125 0 0 1 0 4.25h-.375v1h-1.25v-1H7A2.125 2.125 0 0 1 4.875 9.5h1.25c0 .483.392.875.875.875h.375v-1.75H7a2.125 2.125 0 0 1 0-4.25h.375v-1zm-1.25 2.25H7a.875.875 0 1 0 0 1.75h.375zm1.25 3v1.75H9a.875.875 0 1 0 0-1.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgDollar;
