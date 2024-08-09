import type { ReactElement, SVGProps } from "react";
const SvgFulcrum = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m15.206 1.721.721-.206-.412-1.442-.721.206-14 4-.721.206.412 1.442.721-.206zM7.111 5.397 8 4l.889 1.397 5.157 8.103L15 15H1l.955-1.5zM3.733 13.5 8 6.794l4.268 6.706H3.732z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFulcrum;
