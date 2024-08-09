import type { ReactElement, SVGProps } from "react";
const SvgSpaces = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="transparent"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M12.742 5.776a4.75 4.75 0 1 0-2.62 3.975M3.262 6.31A4.75 4.75 0 1 0 8 6.46"
        />
        <path
            fill="transparent"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M5.855 9.5a4.752 4.752 0 0 1 9.395 1A4.75 4.75 0 0 1 8 14.54"
        />
    </svg>
);
export default SvgSpaces;
