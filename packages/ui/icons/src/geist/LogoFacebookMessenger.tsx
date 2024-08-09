import type { ReactElement, SVGProps } from "react";
const SvgLogoFacebookMessenger = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="url(#logo-facebook-messenger_svg__a)"
            d="M8 0C3.494 0 0 3.302 0 7.76c0 2.332.956 4.348 2.512 5.74.13.116.21.28.214.456l.044 1.424a.64.64 0 0 0 .898.566l1.588-.7a.64.64 0 0 1 .428-.032c.73.2 1.506.308 2.316.308 4.506 0 8-3.302 8-7.76S12.506 0 8 0"
        />
        <path
            fill="#fff"
            d="m3.196 10.03 2.35-3.728a1.2 1.2 0 0 1 1.736-.32l1.87 1.402a.48.48 0 0 0 .578-.002l2.524-1.916c.336-.256.776.148.552.506l-2.352 3.726a1.2 1.2 0 0 1-1.736.32l-1.87-1.402a.48.48 0 0 0-.578.002l-2.524 1.916c-.336.256-.776-.146-.55-.504"
        />
        <defs>
            <radialGradient
                id="logo-facebook-messenger_svg__a"
                cx={0}
                cy={0}
                r={1}
                gradientTransform="translate(2.68 16)scale(17.6)"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="color(display-p3 0 .6 1)" />
                <stop offset={0.6} stopColor="color(display-p3 .6275 .2 1)" />
                <stop offset={0.9} stopColor="color(display-p3 1 .3216 .502)" />
                <stop offset={1} stopColor="color(display-p3 1 .4392 .3804)" />
            </radialGradient>
        </defs>
    </svg>
);
export default SvgLogoFacebookMessenger;
