import type { ReactElement, SVGProps } from "react";
const SvgMenu = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" fillRule="evenodd" d="M1.75 4H1v1.5h14V4zm0 6.5H1V12h14v-1.5z" clipRule="evenodd" />
    </svg>
);
export default SvgMenu;
