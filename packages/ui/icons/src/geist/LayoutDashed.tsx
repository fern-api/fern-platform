import type { ReactElement, SVGProps } from "react";
const SvgLayoutDashed = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 2.5h-13V5H3v1H1.5v6.5a1 1 0 0 0 1 1H5v-1h1v1h7.5a1 1 0 0 0 1-1V6H14V5h.5zM1.5 1H0v11.5A2.5 2.5 0 0 0 2.5 15h11a2.5 2.5 0 0 0 2.5-2.5V1zM5 9V7.5h1V9zm0 2.5V10h1v1.5zM6.5 5v1H8V5zM4 5v1h1.5V5zm5 0v1h1.5V5zm2.5 0v1H13V5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLayoutDashed;
