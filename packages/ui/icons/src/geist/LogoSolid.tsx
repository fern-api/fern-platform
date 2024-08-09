import type { ReactElement, SVGProps } from "react";
const SvgLogoSolid = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-solid_svg__a)">
            <path
                fill="#76B3E1"
                d="M16 3.678S10.667-.276 6.54.637l-.3.101c-.604.203-1.107.507-1.409.913l-.201.304-1.51 2.636 2.617.507c1.107.71 2.516 1.013 3.824.71l4.629.912z"
            />
            <path
                fill="url(#logo-solid_svg__b)"
                d="M16 3.678S10.667-.276 6.54.637l-.3.101c-.604.203-1.107.507-1.409.913l-.201.304-1.51 2.636 2.617.507c1.107.71 2.516 1.013 3.824.71l4.629.912z"
                opacity={0.3}
            />
            <path
                fill="#518AC8"
                d="m4.83 3.678-.402.102c-1.71.507-2.214 2.129-1.308 3.548 1.006 1.318 3.12 2.028 4.83 1.52l6.239-2.128S8.855 2.766 4.83 3.678"
            />
            <path
                fill="url(#logo-solid_svg__c)"
                d="m4.83 3.678-.402.102c-1.71.507-2.214 2.129-1.308 3.548 1.006 1.318 3.12 2.028 4.83 1.52l6.239-2.128S8.855 2.766 4.83 3.678"
                opacity={0.3}
            />
            <path
                fill="url(#logo-solid_svg__d)"
                d="M13.082 8.24a4.53 4.53 0 0 0-2.185-1.503 4.5 4.5 0 0 0-2.645-.017l-6.24 2.027L0 12.296l11.27 1.926 2.013-3.65c.403-.71.302-1.52-.201-2.332"
            />
            <path
                fill="url(#logo-solid_svg__e)"
                d="M11.07 11.789a4.53 4.53 0 0 0-2.185-1.504 4.5 4.5 0 0 0-2.646-.017L0 12.296s5.333 4.055 9.46 3.041l.301-.101c1.71-.507 2.315-2.13 1.308-3.447z"
            />
        </g>
        <defs>
            <linearGradient id="logo-solid_svg__b" x1={2.4} x2={14.9} y1={0.4} y2={6.5} gradientUnits="userSpaceOnUse">
                <stop offset={0.1} stopColor="#76B3E1" />
                <stop offset={0.3} stopColor="#DCF2FD" />
                <stop offset={1} stopColor="#76B3E1" />
            </linearGradient>
            <linearGradient id="logo-solid_svg__c" x1={9.2} x2={7} y1={3.4} y2={10.8} gradientUnits="userSpaceOnUse">
                <stop stopColor="#76B3E1" />
                <stop offset={0.5} stopColor="#4377BB" />
                <stop offset={1} stopColor="#1F3B77" />
            </linearGradient>
            <linearGradient id="logo-solid_svg__d" x1={1.4} x2={14.2} y1={6.6} y2={15.2} gradientUnits="userSpaceOnUse">
                <stop stopColor="#315AA9" />
                <stop offset={0.5} stopColor="#518AC8" />
                <stop offset={1} stopColor="#315AA9" />
            </linearGradient>
            <linearGradient id="logo-solid_svg__e" x1={7.2} x2={2} y1={7.7} y2={26.6} gradientUnits="userSpaceOnUse">
                <stop stopColor="#4377BB" />
                <stop offset={0.5} stopColor="#1A336B" />
                <stop offset={1} stopColor="#1A336B" />
            </linearGradient>
            <clipPath id="logo-solid_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoSolid;
