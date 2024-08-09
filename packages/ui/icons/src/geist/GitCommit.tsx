import type { ReactElement, SVGProps } from "react";
const SvgGitCommit = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M8 12c1.953 0 3.579-1.4 3.93-3.25H16v-1.5h-4.07a4.001 4.001 0 0 0-7.86 0H0v1.5h4.07A4 4 0 0 0 8 12"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgGitCommit;
