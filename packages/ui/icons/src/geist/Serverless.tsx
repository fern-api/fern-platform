import type { ReactElement, SVGProps } from "react";
const SvgServerless = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.084 1.974a.25.25 0 0 0-.265-.013L2.884 4.725a.75.75 0 0 0-.384.654v4.013l6.87-2.748.001.004 4.678-1.87A.75.75 0 0 1 15 5.5v5.12a2.25 2.25 0 0 1-1.15 1.964l-4.936 2.764a1.75 1.75 0 0 1-1.858-.094L3.492 12.76l1.665-.666 2.759 1.931a.25.25 0 0 0 .265.014l4.936-2.764a.75.75 0 0 0 .383-.654V6.608L7.88 8.856l-.001-.004-5.928 2.37A.75.75 0 0 1 1 10.5V5.38c0-.815.44-1.566 1.15-1.964L7.087.652a1.75 1.75 0 0 1 1.858.094l3.564 2.494-1.665.666-2.759-1.932z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgServerless;
