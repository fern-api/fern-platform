import type { ReactElement, SVGProps } from "react";
const SvgGitMerge = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path stroke="#fff" strokeLinecap="square" strokeWidth={1.5} d="M4 6.25v8" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.5 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m-1.421.687a3.001 3.001 0 1 0 .036-1.512 5.25 5.25 0 0 1-4.29-4.29A3.001 3.001 0 0 0 4 1a3 3 0 0 0-.687 5.921 6.75 6.75 0 0 0 5.766 5.766M2.5 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgGitMerge;
