import type { ReactElement, SVGProps } from "react";
const SvgCornerRightDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.75 2.75H2v-1.5h7c.966 0 1.75.784 1.75 1.75v9.69l1.97-1.97.53-.53 1.06 1.06-.53.53-3.25 3.25a.75.75 0 0 1-1.06 0l-3.25-3.25-.53-.53 1.06-1.06.53.53 1.97 1.97V3A.25.25 0 0 0 9 2.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerRightDown;
