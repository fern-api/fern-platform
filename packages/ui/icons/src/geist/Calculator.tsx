import type { ReactElement, SVGProps } from "react";
const SvgCalculator = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13 1.5H3V4h10zm-10 12V5.25h10v8.25a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1M3 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5V0zm2.25 8a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m0 2.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m.75 2a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M8 8a.75.75 0 1 0 0-1.5A.75.75 0 0 0 8 8m.75 1.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M8 13.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m3.5-6a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m-.75 3.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m.75 2a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCalculator;
