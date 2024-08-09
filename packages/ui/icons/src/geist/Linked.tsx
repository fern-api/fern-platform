import type { ReactElement, SVGProps } from "react";
const SvgLinked = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.25 1.5A4.25 4.25 0 0 0 .995 8.482l1.148-.964A2.75 2.75 0 0 1 4.25 3H8.5a2.75 2.75 0 1 1 0 5.5V10a4.25 4.25 0 0 0 0-8.5zm7.5 11.5H7.5a2.75 2.75 0 1 1 0-5.5V6a4.25 4.25 0 0 0 0 8.5h4.25a4.25 4.25 0 0 0 3.255-6.982l-1.148.964A2.75 2.75 0 0 1 11.75 13"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLinked;
