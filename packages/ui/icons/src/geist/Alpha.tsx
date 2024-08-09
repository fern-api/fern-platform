import type { ReactElement, SVGProps } from "react";
const SvgAlpha = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <circle cx={8} cy={8} r={7.3} fill="transparent" stroke="#fff" strokeLinecap="round" strokeWidth={1.5} />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5 1h2v2H5zm0 4V3H3v2H1v2h2v2H1v2h2v2h2v2h2v-2h2v2h2v-2h2v-2h2V9h-2V7h2V5h-2V3h-2V1H9v2H7v2zm0 2H3V5h2zm2 0V5h2v2zm0 2V7H5v2H3v2h2v2h2v-2h2v2h2v-2h2V9h-2V7h2V5h-2V3H9v2h2v2H9v2zm2 0h2v2H9zM7 9v2H5V9z"
            clipRule="evenodd"
            opacity={0.3}
        />
    </svg>
);
export default SvgAlpha;
