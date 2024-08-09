import type { ReactElement, SVGProps } from "react";
const SvgLogoAzure = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#0089D6"
            d="M7.402 13.878c2.056-.41 3.753-.75 3.773-.755l.035-.008-1.94-2.608a364 364 0 0 1-1.941-2.62c0-.013 2.004-6.247 2.015-6.27.004-.007 1.368 2.653 3.306 6.448 1.815 3.553 3.31 6.483 3.325 6.51l.025.05H9.832l-6.168-.002zM0 13.082c0-.003.914-1.796 2.032-3.985L4.064 5.12l2.368-2.245A926 926 0 0 1 8.808.625a.5.5 0 0 1-.038.109L6.2 6.964l-2.526 6.12-1.836.002c-1.01.002-1.837 0-1.837-.004z"
        />
    </svg>
);
export default SvgLogoAzure;
