import type { ReactElement, SVGProps } from "react";
const SvgAcronymJs = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 2.5A2.5 2.5 0 0 1 2.5 0h11A2.5 2.5 0 0 1 16 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 13.5zM7.5 8v4.125a.375.375 0 0 1-.75 0v-.375h-1.5v.375a1.875 1.875 0 0 0 3.75 0V8zm4.25 1.875c0-.207.168-.375.375-.375H13.5V8h-1.375a1.875 1.875 0 0 0 0 3.75.375.375 0 0 1 0 .75H10.5V14h1.625a1.875 1.875 0 0 0 0-3.75.375.375 0 0 1-.375-.375"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymJs;
