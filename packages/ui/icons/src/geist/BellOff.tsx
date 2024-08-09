import type { ReactElement, SVGProps } from "react";
const SvgBellOff = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m4.537 3.476 7.024 7.024h1.419A3.14 3.14 0 0 1 12 8.22V5.508a4.007 4.007 0 0 0-7.463-2.03zM13.061 12l2.22 2.22.53.53-1.061 1.06-.53-.53L.72 1.78l-.53-.53L1.25.19l.53.53 1.671 1.67A5.508 5.508 0 0 1 13.5 5.508v2.714c0 .548.274 1.06.73 1.365l.436.29.334.223V12zM3.985 7.75V7h-1.5v1.227c0 .546-.272 1.057-.725 1.362l-.429.289L1 10.1V12h6.5v-1.5H3.012a3.14 3.14 0 0 0 .973-2.273zm5.183 5.75h1.58l-.161.487a2.53 2.53 0 0 1-1.072 1.336A2.86 2.86 0 0 1 8 15.75a2.86 2.86 0 0 1-1.515-.427 2.53 2.53 0 0 1-1.072-1.336l-.162-.487h1.581l.005.013c.067.203.218.397.442.537.198.123.445.2.721.2s.523-.077.72-.2a1.03 1.03 0 0 0 .443-.537z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBellOff;
