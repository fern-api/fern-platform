import type { ReactElement, SVGProps } from "react";
const SvgTextStrikethrough = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 .583c-1.848 0-3.104.624-3.89 1.499-.766.85-1.027 1.87-1.027 2.585 0 .635.171 1.32.647 1.958q.145.194.323.375H1v1.5h14V7H7.018l-.5-.198c-.85-.335-1.323-.722-1.586-1.074a1.72 1.72 0 0 1-.349-1.061c0-.396.156-1.043.641-1.582C5.687 2.57 6.514 2.083 8 2.083c1.99 0 2.83.873 3.178 1.606l.323.678 1.354-.644-.322-.678C11.924 1.765 10.543.583 8 .583m4.917 10.667v-.75h-1.5v.75c0 .4-.158 1.07-.648 1.632-.467.534-1.293 1.035-2.769 1.035-1.86 0-2.727-.877-3.122-1.617l-.352-.662-1.324.705.353.662c.634 1.19 1.988 2.412 4.445 2.412 1.857 0 3.115-.652 3.898-1.549.76-.87 1.019-1.906 1.019-2.618"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTextStrikethrough;
