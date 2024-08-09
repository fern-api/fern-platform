import type { ReactElement, SVGProps } from "react";
const SvgFunctionRectangle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 1.5h-11v12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1zM2.5 0H1v13.5A2.5 2.5 0 0 0 3.5 16h9a2.5 2.5 0 0 0 2.5-2.5V0zm7.25 4.5a1 1 0 0 0-1 1v1h1.75V8H8.75v2.5a2.5 2.5 0 0 1-2.5 2.5H5.5v-1.5h.75a1 1 0 0 0 1-1V8H5.5V6.5h1.75v-1A2.5 2.5 0 0 1 9.75 3h.75v1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFunctionRectangle;
