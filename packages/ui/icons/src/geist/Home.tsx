import type { ReactElement, SVGProps } from "react";
const SvgHome = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M12.5 6.56 8 2.06l-4.5 4.5v6.94H6V11a2 2 0 1 1 4 0v2.5h2.5zm1.28-.84L8.707.645a1 1 0 0 0-1.414 0L2.22 5.72.47 7.47-.06 8 1 9.06l.53-.53.47-.47V15h12V8.06l.47.47.53.53L16.06 8l-.53-.53zM8.5 11v2.5h-1V11a.5.5 0 1 1 1 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgHome;
