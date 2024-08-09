import type { ReactElement, SVGProps } from "react";
const SvgSettingsSlider = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.773 6.398 4.75 7.5 3.727 6.398l-1.96-2.11a1 1 0 0 1-.267-.68V1a1 1 0 0 1 1-1H7a1 1 0 0 1 1 1v2.607a1 1 0 0 1-.267.68zM6.5 3.41 4.75 5.296 3 3.41V1.5h3.5zm-1 6.09V12H16v1.5H5.5V16H4v-2.5H0V12h4V9.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSettingsSlider;
