import type { ReactElement, SVGProps } from "react";
const SvgGitBranch = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.75 1.75V1h-1.5v8.095a3.001 3.001 0 1 0 3.671 3.592 6.75 6.75 0 0 0 5.766-5.766 3.001 3.001 0 1 0-1.512-.036 5.25 5.25 0 0 1-4.29 4.29 3 3 0 0 0-2.135-2.08zM13.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M4 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgGitBranch;
