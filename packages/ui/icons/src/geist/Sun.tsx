import type { ReactElement, SVGProps } from "react";
const SvgSun = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.75.75V0h-1.5v2.75h1.5zm2.432 3.007.53-.53.354-.354.53-.53 1.06 1.06-.53.531-.353.354-.53.53-1.061-1.06zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5.25-4.75H16v1.5h-2.75zm-12.5 0H0v1.5h2.75v-1.5zm2.123 4.816-.53.53 1.06 1.06.531-.53.354-.353.53-.53-1.06-1.061-.531.53zm.884-7.248-.53-.53-.354-.354-.53-.53 1.06-1.06.531.53.354.353.53.53-1.06 1.061zm8.309 8.309.53.53 1.06-1.06-.53-.531-.353-.354-.53-.53-1.061 1.06.53.531zm-3.316.123V16h-1.5v-2.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSun;
