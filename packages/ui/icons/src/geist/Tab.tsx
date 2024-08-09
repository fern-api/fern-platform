import type { ReactElement, SVGProps } from "react";
const SvgTab = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M16 .75V0h-1.5v16H16zM7.53 3.22 7 2.69 5.94 3.75l.53.53 2.97 2.97H0v1.5h9.44l-2.97 2.97-.53.53L7 13.31l.53-.53 4.25-4.25a.75.75 0 0 0 0-1.06z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTab;
