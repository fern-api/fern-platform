import type { ReactElement, SVGProps } from "react";
const SvgSignIn = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 2.5H9.25V1H14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9.25v-1.5h4.25zM8.44 7.25 6.47 5.28l-.53-.53L7 3.69l.53.53 3.074 3.073a1 1 0 0 1 0 1.414L7.53 11.78l-.53.53-1.06-1.06.53-.53 1.97-1.97H1v-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSignIn;
