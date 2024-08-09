import type { ReactElement, SVGProps } from "react";
const SvgLink = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.47 1.47a4.285 4.285 0 1 1 6.06 6.06l-2.5 2.5-1.06-1.06 2.5-2.5a2.786 2.786 0 0 0-3.94-3.94l-2.5 2.5-1.06-1.06zm3.06 4.06-6 6-1.06-1.06 6-6zm-10.06 9a4.285 4.285 0 0 0 6.06 0l2.5-2.5-1.06-1.06-2.5 2.5a2.786 2.786 0 0 1-3.94-3.94l2.5-2.5-1.06-1.06-2.5 2.5a4.285 4.285 0 0 0 0 6.06"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLink;
