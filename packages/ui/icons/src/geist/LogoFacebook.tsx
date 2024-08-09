import type { ReactElement, SVGProps } from "react";
const SvgLogoFacebook = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.003 15.938A8.001 8.001 0 0 0 8 0a8 8 0 0 0-1.75 15.808V10.43H4.5V8h1.75V6.94c0-2.718 1.035-3.976 3.701-3.976.505 0 1.377.099 1.734.198v2.21a10 10 0 0 0-.923-.03C9.454 5.343 9 5.839 9 7.129V8h2.558l-.447 2.43H9.003z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLogoFacebook;
