import type { ReactElement, SVGProps } from "react";
const SvgLogoPython = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="url(#logo-python_svg__a)"
            d="M7.905 0c-.66.003-1.29.059-1.844.156-1.634.285-1.93.883-1.93 1.984v1.455h3.86v.485H2.682c-1.122 0-2.103.667-2.41 1.935-.355 1.454-.37 2.361 0 3.88.274 1.13.93 1.935 2.05 1.935H3.65v-1.744c0-1.26 1.102-2.372 2.41-2.372h3.855c1.073 0 1.93-.873 1.93-1.94V2.14c0-1.034-.882-1.812-1.93-1.984-.663-.11-1.35-.159-2.01-.156M5.818 1.17a.728.728 0 0 1 0 1.455.727.727 0 0 1 0-1.455"
        />
        <path
            fill="url(#logo-python_svg__b)"
            d="M12.326 4.08v1.695c0 1.314-1.126 2.42-2.41 2.42H6.06c-1.055 0-1.93.894-1.93 1.94v3.634c0 1.035.91 1.643 1.93 1.94 1.222.355 2.394.42 3.855 0 .972-.278 1.93-.838 1.93-1.94v-1.454H7.99v-.485h5.785c1.121 0 1.54-.774 1.93-1.936.402-1.195.385-2.345 0-3.88-.278-1.103-.807-1.934-1.93-1.934zm-2.168 9.204a.727.727 0 0 1 0 1.455.728.728 0 0 1 0-1.455"
        />
        <defs>
            <linearGradient id="logo-python_svg__a" x1={0} x2={8.8} y1={0} y2={7.6} gradientUnits="userSpaceOnUse">
                <stop stopColor="#5A9FD4" />
                <stop offset={1} stopColor="#306998" />
            </linearGradient>
            <linearGradient
                id="logo-python_svg__b"
                x1={10.1}
                x2={6.9}
                y1={13.9}
                y2={9.4}
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FFD43B" />
                <stop offset={1} stopColor="#FFE873" />
            </linearGradient>
        </defs>
    </svg>
);
export default SvgLogoPython;
