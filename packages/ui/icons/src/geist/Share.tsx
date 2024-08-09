import type { ReactElement, SVGProps } from "react";
const SvgShare = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.293 1.396a1 1 0 0 1 1.414 0L11.78 4.47l.53.53-1.06 1.06-.53-.53-1.97-1.97V11h-1.5V3.56L5.28 5.53l-.53.53L3.69 5l.53-.53zM13.5 9.25v4.25h-11v-5H1V14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5h-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgShare;
