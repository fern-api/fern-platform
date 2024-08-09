import type { ReactElement, SVGProps } from "react";
const SvgHeadset = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 1a7 7 0 0 0-7 7v3h2.25a2 2 0 0 0 2-2v-.75a2 2 0 0 0-2-2h-.466a5.502 5.502 0 0 1 10.432 0h-.466a2 2 0 0 0-2 2V9a2 2 0 0 0 2 2h.75a2.5 2.5 0 0 1-2.5 2.5h-1V13a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h4a4 4 0 0 0 4-4V8a7 7 0 0 0-7-7m4.75 6.75h.744q.006.124.006.25v1.5h-.75a.5.5 0 0 1-.5-.5v-.75a.5.5 0 0 1 .5-.5m-10.244 0A6 6 0 0 0 2.5 8v1.5h.75a.5.5 0 0 0 .5-.5v-.75a.5.5 0 0 0-.5-.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgHeadset;
