import type { ReactElement, SVGProps } from "react";
const SvgBackspace = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 .75V0h1.5v16H0zm8.47 2.47L9 2.69l1.06 1.06-.53.53-2.97 2.97H16v1.5H6.56l2.97 2.97.53.53L9 13.31l-.53-.53-4.25-4.25a.75.75 0 0 1 0-1.06z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBackspace;
