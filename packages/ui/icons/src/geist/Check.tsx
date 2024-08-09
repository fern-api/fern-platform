import type { ReactElement, SVGProps } from "react";
const SvgCheck = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m15.56 4-.53.53-8.793 8.793a1.75 1.75 0 0 1-2.474 0l.53-.53-.53.53L.97 10.53.44 10 1.5 8.94l.53.53 2.793 2.793a.25.25 0 0 0 .354 0L13.97 3.47l.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCheck;
