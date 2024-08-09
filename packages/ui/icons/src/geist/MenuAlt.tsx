import type { ReactElement, SVGProps } from "react";
const SvgMenuAlt = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1 2h14v1.5H1zm0 10.5h14V14H1zm.75-5.25H1v1.5h14v-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMenuAlt;
