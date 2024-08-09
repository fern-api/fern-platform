import type { ReactElement, SVGProps } from "react";
const SvgTextUppercase = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m2.22 13.215.5-1.71h3.56l.5 1.71.085.29h2.27l.085-.29.5-1.71h3.56l.5 1.71.085.29h1.563l-.208-.711-3-10.255h-1.44L8 12.042 5.22 2.54H3.78l-3 10.255-.208.71h1.563zm10.562-3.41L11.5 5.42l-1.282 4.383h2.564zm-7 0H3.218L4.5 5.42l1.282 4.383z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTextUppercase;
