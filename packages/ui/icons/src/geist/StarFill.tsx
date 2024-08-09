import type { ReactElement, SVGProps } from "react";
const SvgStarFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="m8 .49 2.573 4.718 5.283.99-3.692 3.905.691 5.33L8 13.128l-4.855 2.305.691-5.33L.144 6.197l5.283-.989z"
        />
    </svg>
);
export default SvgStarFill;
