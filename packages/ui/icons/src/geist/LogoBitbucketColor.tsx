import type { ReactElement, SVGProps } from "react";
const SvgLogoBitbucketColor = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#2684FF"
            d="M15.013 1a.47.47 0 0 1 .37.173.5.5 0 0 1 .11.406l-2.04 12.855a.7.7 0 0 1-.22.404.64.64 0 0 1-.419.162H3.027a.47.47 0 0 1-.315-.117.5.5 0 0 1-.166-.302l-2.04-13a.52.52 0 0 1 .11-.405.48.48 0 0 1 .37-.173zm-8.59 9.29h3.123l.846-4.586H5.665l.757 4.587z"
        />
        <path
            fill="url(#logo-bitbucket-color_svg__a)"
            d="M1.155 5.704h4.51l.757 4.587h3.124l3.689 4.544a.64.64 0 0 1-.42.165h-9.79a.47.47 0 0 1-.316-.117.5.5 0 0 1-.165-.302z"
        />
        <defs>
            <linearGradient
                id="logo-bitbucket-color_svg__a"
                x1={0.1}
                x2={7.8}
                y1={7}
                y2={12.8}
                gradientUnits="userSpaceOnUse"
            >
                <stop offset={0.2} stopColor="#0052CC" />
                <stop offset={1} stopColor="#2684FF" />
            </linearGradient>
        </defs>
    </svg>
);
export default SvgLogoBitbucketColor;
