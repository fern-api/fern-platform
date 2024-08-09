import type { ReactElement, SVGProps } from "react";
const SvgLogoHyper = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-hyper_svg__a)">
            <rect
                width={14.5}
                height={14.5}
                x={0.8}
                y={0.8}
                stroke="url(#logo-hyper_svg__b)"
                strokeWidth={1.5}
                rx={3.3}
            />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M7.494 6.804a.1.1 0 0 1-.029.036v-.003L4.691 8.976c-.086.064-.215-.01-.172-.101l.804-1.744a.08.08 0 0 0 .003-.061.1.1 0 0 0-.043-.05L4.05 6.31a.1.1 0 0 1-.034-.03.08.08 0 0 1-.006-.082.1.1 0 0 1 .029-.035L6.82 4.025c.083-.064.212.012.172.1l-.882 1.87a.08.08 0 0 0-.002.067q.015.033.052.05l1.281.58q.025.01.04.028a.08.08 0 0 1 .014.085zm2.129.954a.623.623 0 0 0 0 1.244h1.755a.622.622 0 1 0 0-1.245z"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <linearGradient id="logo-hyper_svg__b" x1={8.3} x2={8.3} y1={0.8} y2={16} gradientUnits="userSpaceOnUse">
                <stop stopColor="#F743B6" />
                <stop offset={1} stopColor="#FCC043" />
            </linearGradient>
            <clipPath id="logo-hyper_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoHyper;
