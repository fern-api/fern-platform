import type { ReactElement, SVGProps } from "react";
const SvgCornerUpRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m11.53 10.03-.53.53L9.94 9.5l.53-.53L12.44 7H2.75a.25.25 0 0 0-.25.25v7H1v-7c0-.966.784-1.75 1.75-1.75h9.69l-1.97-1.97L9.94 3 11 1.94l.53.53 3.25 3.25a.75.75 0 0 1 0 1.06z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerUpRight;
