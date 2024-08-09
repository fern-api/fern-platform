import type { ReactElement, SVGProps } from "react";
const SvgMagnifyingGlassMinus = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.5 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10M0 6.5a6.5 6.5 0 1 1 11.596 4.035l3.434 3.435.53.53-1.06 1.06-.53-.53-3.435-3.434A6.5 6.5 0 0 1 0 6.5m4.75-.625h-.625v1.25h4.75v-1.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMagnifyingGlassMinus;
