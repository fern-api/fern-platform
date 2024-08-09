import type { ReactElement, SVGProps } from "react";
const SvgMicrophone = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.501 1.5h-1a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5V3a1.5 1.5 0 0 0-1.5-1.5m-1-1.5a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm-.25 13.209V16h1.5v-2.791a6.76 6.76 0 0 0 5.787-5.022l.187-.726-1.452-.374-.187.726a5.252 5.252 0 0 1-10.17 0l-.187-.726-1.452.374.187.726a6.76 6.76 0 0 0 5.787 5.022"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMicrophone;
