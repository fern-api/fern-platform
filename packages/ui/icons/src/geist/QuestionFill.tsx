import type { ReactElement, SVGProps } from "react";
const SvgQuestionFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7.096 5.822A1 1 0 1 1 8.143 7.24c-.44.063-.893.435-.893 1.01v1h1.5v-.615a2.5 2.5 0 1 0-3.009-3.457l-.322.678 1.355.643z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgQuestionFill;
