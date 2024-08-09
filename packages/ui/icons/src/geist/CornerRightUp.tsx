import type { ReactElement, SVGProps } from "react";
const SvgCornerRightUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m6.22 4.72-.53.53 1.06 1.06.53-.53 1.97-1.97v9.69a.25.25 0 0 1-.25.25H2v1.5h7a1.75 1.75 0 0 0 1.75-1.75V3.81l1.97 1.97.53.53 1.06-1.06-.53-.53-3.25-3.25a.75.75 0 0 0-1.06 0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerRightUp;
