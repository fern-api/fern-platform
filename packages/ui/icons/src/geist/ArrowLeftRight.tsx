import type { ReactElement, SVGProps } from "react";
const SvgArrowLeftRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m3.47 11.78.53.53 1.06-1.06-.53-.53-1.97-1.97h10.88l-1.97 1.97-.53.53L12 12.31l.53-.53 3.074-3.073a1 1 0 0 0 0-1.414L12.53 4.22 12 3.69l-1.06 1.06.53.53 1.97 1.97H2.56l1.97-1.97.53-.53L4 3.69l-.53.53L.397 7.293a1 1 0 0 0 0 1.414z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowLeftRight;
