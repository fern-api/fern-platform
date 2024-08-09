import type { ReactElement, SVGProps } from "react";
const SvgAsteriskSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="M7.25 13v-2.835a.5.5 0 0 0-.75-.433L4.045 11.15l-.75-1.3L5.75 8.433a.5.5 0 0 0 0-.866L3.295 6.15l.75-1.3L6.5 6.268a.5.5 0 0 0 .75-.433V3h1.5v2.835a.5.5 0 0 0 .75.433l2.455-1.418.75 1.3-2.455 1.417a.5.5 0 0 0 0 .866l2.455 1.417-.75 1.3L9.5 9.732a.5.5 0 0 0-.75.433V13z"
        />
    </svg>
);
export default SvgAsteriskSmall;
