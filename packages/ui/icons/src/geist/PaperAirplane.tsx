import type { ReactElement, SVGProps } from "react";
const SvgPaperAirplane = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m14.748.294-14 5L.73 6.7l6.085 2.34a.25.25 0 0 1 .143.144L9.3 15.27l1.407-.017 5-14-.958-.958zM7.314 7.625 3.157 6.026l8.954-3.198zm1.06 1.06 1.6 4.158 3.198-8.954z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPaperAirplane;
