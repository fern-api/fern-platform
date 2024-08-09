import type { ReactElement, SVGProps } from "react";
const SvgEnvelope = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.264 3.5H2.736L8 8.012zM1.5 4.416V11.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V4.416L8.488 9.57 8 9.988l-.488-.419zM0 2h16v9.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 11.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgEnvelope;
