import type { ReactElement, SVGProps } from "react";
const SvgBlendMode = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.992 9.992a3.75 3.75 0 0 1-3.985-3.985 3.75 3.75 0 0 1 3.985 3.985m1.505-.423A5.25 5.25 0 0 0 6.43 4.503 3.75 3.75 0 0 1 13.5 6.25a3.75 3.75 0 0 1-2.003 3.32zm-.222 1.706a5.25 5.25 0 1 0-6.55-6.55 5.25 5.25 0 1 0 6.55 6.55m-1.706.222A5.25 5.25 0 0 1 4.503 6.43 3.75 3.75 0 0 0 6.25 13.5a3.75 3.75 0 0 0 3.32-2.003z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBlendMode;
