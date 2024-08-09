import type { ReactElement, SVGProps } from "react";
const SvgDroplet = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.475 5.737 8 2.142l3.525 3.595c1.967 2.004 1.967 5.267 0 7.272a4.91 4.91 0 0 1-7.05 0c-1.967-2.005-1.967-5.268 0-7.272m-1.071-1.05L6.949 1.07 8 0l1.05 1.071 3.546 3.615c2.539 2.588 2.539 6.785 0 9.373a6.41 6.41 0 0 1-9.192 0c-2.539-2.588-2.539-6.785 0-9.373zM11.25 9.5v-.75h-1.5v.75A1.75 1.75 0 0 1 8 11.25h-.75v1.5H8a3.25 3.25 0 0 0 3.25-3.25"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgDroplet;
