import type { ReactElement, SVGProps } from "react";
const SvgConnection = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.5 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0M9.415 5.524a3 3 0 1 1 1.06 1.06l-3.89 3.892a3 3 0 1 1-1.06-1.06zM2.5 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgConnection;
