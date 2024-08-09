import type { ReactElement, SVGProps } from "react";
const SvgWebcam = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.25 2A2.25 2.25 0 0 0 0 4.25v7.5A2.25 2.25 0 0 0 2.25 14h9.25v-2.625l3 1.75L16 14V2l-1.5.875-3 1.75V2zm9.25 4.362v3.276l3 1.75V4.612zM10 5.5v-2H2.25a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75H10z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgWebcam;
