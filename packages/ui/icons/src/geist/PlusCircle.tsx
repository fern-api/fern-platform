import type { ReactElement, SVGProps } from "react";
const SvgPlusCircle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.75 4.25v3h3v1.5h-3v3h-1.5v-3h-3v-1.5h3v-3z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPlusCircle;
