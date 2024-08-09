import type { ReactElement, SVGProps } from "react";
const SvgHeart = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.065 3.205a3.26 3.26 0 1 0-4.61 4.61L8 13.36l5.545-5.545a3.26 3.26 0 0 0-4.61-4.61l-.405.405-.53.53-.53-.53zM8 2.023a4.76 4.76 0 0 0-6.606 6.852l6.076 6.076.53.53.53-.53 6.076-6.076A4.76 4.76 0 0 0 8 2.023"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgHeart;
