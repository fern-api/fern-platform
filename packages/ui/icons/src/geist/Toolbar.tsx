import type { ReactElement, SVGProps } from "react";
const SvgToolbar = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm9.634 9.5H5.5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM10.5 8h-5a2 2 0 1 0 0 4h5a2 2 0 1 0 0-4"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgToolbar;
