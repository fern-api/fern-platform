import type { ReactElement, SVGProps } from "react";
const SvgWebcamOff = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 11.75V2h1.71l8.622 10.777 1.307 1.585.477.578-1.157.955-.477-.579L9.396 14H2.25A2.25 2.25 0 0 1 0 11.75m8.19.75L1.5 4.138v7.612c0 .414.336.75.75.75zM4.75 2h6.75v2.625l3-1.75L16 2v12l-1.5-.875-3.508-2.046A2 2 0 0 1 10 9.35V3.5H4.75zm6.75 7.25V6.362l3-1.75v6.776l-2.752-1.605a.5.5 0 0 1-.248-.432z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgWebcamOff;
