import type { ReactElement, SVGProps } from "react";
const SvgTextTitle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5.75a1 1 0 0 0-1 1V3.5H3V2.25h4.25V13.5H6V15h4v-1.5H8.75V2.25h4.5V3.5h1.5V1.75a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTextTitle;
