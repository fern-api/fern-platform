import type { ReactElement, SVGProps } from "react";
const SvgArrowCircleRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.25 7.25H4.5v1.5h4.94l-1.47 1.47-.53.53 1.06 1.06.53-.53 2.75-2.75a.75.75 0 0 0 0-1.06L9.03 4.72l-.53-.53-1.06 1.06.53.53 1.47 1.47zM8 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13M0 8a8 8 0 1 0 16 0A8 8 0 0 0 0 8"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowCircleRight;
