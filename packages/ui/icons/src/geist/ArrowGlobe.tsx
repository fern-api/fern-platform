import type { ReactElement, SVGProps } from "react";
const SvgArrowGlobe = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.334 5.625a12 12 0 0 1-.425 2.604 3.75 3.75 0 0 0 1.79-2.604zm-1.899 3.1a3.8 3.8 0 0 1-.87 0 10.8 10.8 0 0 1-.647-3.1h2.164a10.8 10.8 0 0 1-.647 3.1m1.9-4.35a12 12 0 0 0-.427-2.604 3.75 3.75 0 0 1 1.79 2.604h-1.364zm-1.253 0a10.8 10.8 0 0 0-.647-3.1 3.8 3.8 0 0 0-.87 0 10.8 10.8 0 0 0-.647 3.1zm-3.416 0c.046-.877.187-1.75.425-2.604a3.75 3.75 0 0 0-1.79 2.604zm.425 3.854a12 12 0 0 1-.425-2.604H7.302a3.75 3.75 0 0 0 1.79 2.604zM11 10a5 5 0 1 0 0-10 5 5 0 0 0 0 10m-8.75-.5H1.5V11h2.44L.72 14.22l-.53.53 1.06 1.06.53-.53L5 12.06v2.44h1.5v-4a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowGlobe;
