import type { ReactElement, SVGProps } from "react";
const SvgLogout = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 13.5h4.25V15H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h4.75v1.5H2.5zm9.94-6.25-1.97-1.97-.53-.53L11 3.69l.53.53 3.074 3.073a1 1 0 0 1 0 1.414L11.53 11.78l-.53.53-1.06-1.06.53-.53 1.97-1.97H5v-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLogout;
