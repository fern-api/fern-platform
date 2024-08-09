import type { ReactElement, SVGProps } from "react";
const SvgLens = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.753 14.26a6.5 6.5 0 0 1-7.517-3.254h7.517zm1.254-.496a6.5 6.5 0 0 0 3.254-7.517h-3.254zm2.757-8.771H6.247V1.739a6.5 6.5 0 0 1 7.517 3.254M4.993 2.236a6.5 6.5 0 0 0-3.254 7.517h3.254zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.247 6.247h3.506v3.506H6.247z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLens;
