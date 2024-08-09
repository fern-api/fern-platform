import type { ReactElement, SVGProps } from "react";
const SvgBell = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.992 0a5.507 5.507 0 0 0-5.507 5.508v2.719c0 .546-.272 1.057-.725 1.362l-.429.289L1 10.1V12h14v-1.901l-.334-.223-.435-.29A1.64 1.64 0 0 1 13.5 8.22V5.508A5.51 5.51 0 0 0 7.992 0M3.986 5.508a4.008 4.008 0 0 1 8.015 0V8.22c0 .87.36 1.691.98 2.279H3.012a3.14 3.14 0 0 0 .973-2.273v-2.72zM10.75 13.5H9.168l-.005.013a1.03 1.03 0 0 1-.442.537 1.36 1.36 0 0 1-.721.2 1.36 1.36 0 0 1-.72-.2 1.03 1.03 0 0 1-.443-.537l-.005-.013h-1.58l.161.487c.188.565.58 1.028 1.072 1.336.437.272.96.427 1.515.427a2.86 2.86 0 0 0 1.515-.427 2.53 2.53 0 0 0 1.072-1.336z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBell;
