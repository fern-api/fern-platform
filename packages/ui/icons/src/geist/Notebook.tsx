import type { ReactElement, SVGProps } from "react";
const SvgNotebook = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.285 1.5H13V12a1 1 0 0 1-1 1H6.285zm-1.25 0H3V12a1 1 0 0 0 1 1h1.035zm0 13H4A2.5 2.5 0 0 1 1.5 12V0h13v12a2.5 2.5 0 0 1-2.5 2.5H6.285v1.125h-1.25zm3.47-11.125h2.25v1.25h-2.25zm.625 3h-.625v1.25h2.25v-1.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgNotebook;
