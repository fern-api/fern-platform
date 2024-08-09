import type { ReactElement, SVGProps } from "react";
const SvgLogoNewRelic = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="color(display-p3 0 .6745 .4118)" d="M12.261 5.539v4.922l-4.262 2.462V16l6.928-4V4z" />
        <path
            fill="color(display-p3 .1098 .9059 .5137)"
            d="m7.999 3.078 4.262 2.46L14.928 4l-6.93-4L1.07 4l2.665 1.539L8 3.078z"
        />
        <path fill="color(display-p3 .1137 .1451 .1725)" d="M5.334 9.54v4.922L7.999 16V8L1.07 4v3.078z" />
    </svg>
);
export default SvgLogoNewRelic;
