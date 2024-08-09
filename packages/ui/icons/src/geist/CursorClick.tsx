import type { ReactElement, SVGProps } from "react";
const SvgCursorClick = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.5 2V0H7v2zm-4.53.03 1.5 1.5 1.06-1.06-1.5-1.5zm3.276 2.216.55 1.51 3 8.25.67 1.847.73-1.825 1.078-2.693 3.196 3.195 1.06-1.06-3.195-3.196 2.693-1.078 1.825-.73-1.847-.67-8.25-3zm7.401 4.287-1.528.611a1.75 1.75 0 0 0-.975.975l-.61 1.528-1.78-4.893 4.893 1.78zM0 7h2V5.5H0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCursorClick;
