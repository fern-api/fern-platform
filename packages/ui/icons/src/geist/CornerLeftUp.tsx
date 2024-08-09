import type { ReactElement, SVGProps } from "react";
const SvgCornerLeftUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m9.78 4.72.53.53-1.06 1.06-.53-.53-1.97-1.97v9.69c0 .138.112.25.25.25h7v1.5H7a1.75 1.75 0 0 1-1.75-1.75V3.81L3.28 5.78l-.53.53-1.06-1.06.53-.53 3.25-3.25a.75.75 0 0 1 1.06 0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerLeftUp;
