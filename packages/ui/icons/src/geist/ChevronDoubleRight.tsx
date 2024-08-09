import type { ReactElement, SVGProps } from "react";
const SvgChevronDoubleRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M12.854 8.707a1 1 0 0 0 0-1.414L9.03 3.47l-.53-.53L7.44 4l.53.53L11.44 8l-3.47 3.47-.53.53 1.06 1.06.53-.53zm-5 0a1 1 0 0 0 0-1.414L4.03 3.47l-.53-.53L2.44 4l.53.53L6.44 8l-3.47 3.47-.53.53 1.06 1.06.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronDoubleRight;
