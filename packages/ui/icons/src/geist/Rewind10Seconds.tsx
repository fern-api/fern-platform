import type { ReactElement, SVGProps } from "react";
const SvgRewind10Seconds = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M16 7.945a7 7 0 0 0-4.262-6.444H15v-1.5h-4.925a1 1 0 0 0-1 1v4.925h1.5V2.674A5.5 5.5 0 0 1 9 13.445h-.75v1.5H9a7 7 0 0 0 7-7M5.37 5.628c-.896 0-1.623.726-1.623 1.622v2.13a1.622 1.622 0 1 0 3.245 0V7.25c0-.896-.726-1.622-1.622-1.622M4.992 7.25a.378.378 0 0 1 .755 0v2.13a.377.377 0 1 1-.755 0zm-2.75-.877a.623.623 0 0 0-.773-.604l-1 .25-.604.151.302 1.208.604-.151.227-.057v2.58h-1v1.245h3.245V9.75h-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRewind10Seconds;
