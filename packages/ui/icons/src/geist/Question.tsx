import type { ReactElement, SVGProps } from "react";
const SvgQuestion = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7.096 5.822A1 1 0 1 1 8.143 7.24c-.44.063-.893.435-.893 1.01v1h1.5v-.615a2.5 2.5 0 1 0-3.01-3.457l-.32.678 1.354.643z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgQuestion;
