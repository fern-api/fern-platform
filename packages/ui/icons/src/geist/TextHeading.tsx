import type { ReactElement, SVGProps } from "react";
const SvgTextHeading = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.75 1H2v1.5h1v11H2V15h3.5v-1.5h-1V9H12v4.5h-1V15h3.5v-1.5h-1v-11h1V1H11v1.5h1v5H4.5v-5h1V1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTextHeading;
