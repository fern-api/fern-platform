import type { ReactElement, SVGProps } from "react";
const SvgInspect = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.75 13.5H2.5v-11h11v3H15V2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3.5v-1.5zm2.75-.075V8.501a1 1 0 0 1 1-1h4.925V9H10.06l4.969 4.969.53.53-1.06 1.06-.53-.53L9 10.061v3.364z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgInspect;
