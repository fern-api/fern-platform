import type { ReactElement, SVGProps } from "react";
const SvgSettingsSliders = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.75 5.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5m0-4.75A3 3 0 0 1 13.655 3H16v1.5h-2.345a3.001 3.001 0 0 1-5.81 0H0V3h7.845A3 3 0 0 1 10.75.75M15.25 13H16v-1.5H8.155a3.001 3.001 0 0 0-5.81 0H0V13h2.345a3.001 3.001 0 0 0 5.81 0zM7 12.251zv-.001a1.75 1.75 0 1 0 0 .002"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSettingsSliders;
