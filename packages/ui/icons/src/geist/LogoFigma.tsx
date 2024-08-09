import type { ReactElement, SVGProps } from "react";
const SvgLogoFigma = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#1ABCFE" d="M8.003 8a2.667 2.667 0 1 1 5.334 0 2.667 2.667 0 0 1-5.334 0" />
        <path fill="#0ACF83" d="M2.67 13.333a2.667 2.667 0 0 1 2.667-2.666h2.666v2.666a2.666 2.666 0 1 1-5.333 0" />
        <path fill="#FF7262" d="M8.003 0v5.333h2.667a2.667 2.667 0 0 0 0-5.333z" />
        <path fill="#F24E1E" d="M2.67 2.667a2.667 2.667 0 0 0 2.667 2.666h2.667V0H5.337A2.667 2.667 0 0 0 2.67 2.667" />
        <path fill="#A259FF" d="M2.67 8a2.667 2.667 0 0 0 2.667 2.667h2.666V5.333H5.337A2.667 2.667 0 0 0 2.67 8" />
    </svg>
);
export default SvgLogoFigma;
