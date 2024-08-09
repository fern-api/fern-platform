import type { ReactElement, SVGProps } from "react";
const SvgCursor = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M.547 1.512-.026-.026l1.538.573 12.75 4.75 1.702.634-1.654.752-4.514 2.052 4.734 4.735-1.06 1.06-4.735-4.734-2.052 4.514-.752 1.654-.634-1.702zm7.984 6.15 3.505-1.593-9.51-3.543 3.543 9.51 1.593-3.505a1.75 1.75 0 0 1 .869-.869"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCursor;
