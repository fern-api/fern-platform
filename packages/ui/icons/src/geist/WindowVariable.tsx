import type { ReactElement, SVGProps } from "react";
const SvgWindowVariable = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M.75 0H0v10.5A2.5 2.5 0 0 0 2.5 13h2.75v-1.5H2.5a1 1 0 0 1-1-1v-9h13V6H16V0zm3 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 3.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m.7 6H8.5V9h.95a2.25 2.25 0 0 1 2.114 1.481l.308.846 1.755-1.995a.75.75 0 1 1 .35 1.117l-1.716 1.95.585 1.607a.75.75 0 0 0 .705.494h.949V16h-.95a2.25 2.25 0 0 1-2.114-1.481l-.304-.837-1.815 2.062A.75.75 0 0 1 8.75 16a.75.75 0 1 1 .282-1.445l1.71-1.944-.588-1.617a.75.75 0 0 0-.705-.494z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgWindowVariable;
