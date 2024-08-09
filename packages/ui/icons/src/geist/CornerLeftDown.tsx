import type { ReactElement, SVGProps } from "react";
const SvgCornerLeftDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.25 2.75H14v-1.5H7A1.75 1.75 0 0 0 5.25 3v9.69l-1.97-1.97-.53-.53-1.06 1.06.53.53 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25.53-.53-1.06-1.06-.53.53-1.97 1.97V3A.25.25 0 0 1 7 2.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerLeftDown;
