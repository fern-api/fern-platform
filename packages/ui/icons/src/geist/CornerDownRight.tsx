import type { ReactElement, SVGProps } from "react";
const SvgCornerDownRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 3v-.75H1v7c0 .966.784 1.75 1.75 1.75h9.69l-1.97 1.97-.53.53L11 14.56l.53-.53 3.25-3.25a.75.75 0 0 0 0-1.06l-3.25-3.25-.53-.53L9.94 7l.53.53 1.97 1.97H2.75a.25.25 0 0 1-.25-.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCornerDownRight;
