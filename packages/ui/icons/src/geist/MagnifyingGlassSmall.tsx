import type { ReactElement, SVGProps } from "react";
const SvgMagnifyingGlassSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.5 7a3.5 3.5 0 1 1 6.13 2.309l-.321.322A3.5 3.5 0 0 1 3.5 7m6.465 4.026a5 5 0 1 1 1.06-1.06l3.005 3.004.53.53-1.06 1.06-.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMagnifyingGlassSmall;
