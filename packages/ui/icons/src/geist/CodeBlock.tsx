import type { ReactElement, SVGProps } from "react";
const SvgCodeBlock = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m1.808 4.442.442.442L3.134 4l-.442-.442L1.634 2.5l1.058-1.058L3.134 1 2.25.116l-.442.442L.485 1.881a.875.875 0 0 0 0 1.238zM12 1h-.75v1.5h2.25v9.25a1.75 1.75 0 0 1-1.75 1.75h-7.5a1.75 1.75 0 0 1-1.75-1.75v-5.5H1v5.5A3.25 3.25 0 0 0 4.25 15h7.5A3.25 3.25 0 0 0 15 11.75V1zM7.75 4.884l.442-.442 1.323-1.323a.875.875 0 0 0 0-1.238L8.192.558 7.75.116 6.866 1l.442.442L8.366 2.5 7.308 3.558 6.866 4zm-3.618-.987-.104.618 1.237.207.103-.619.5-3 .104-.618L4.735.278l-.103.619z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCodeBlock;
