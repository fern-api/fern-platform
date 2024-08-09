import type { ReactElement, SVGProps } from "react";
const SvgHash = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m7.24 1.869.12-.741L5.877.89l-.119.74L5.22 5H1.75v1.5h3.23L4.42 10H1.75v1.5h2.43l-.42 2.632-.12.74 1.482.237.119-.74L5.7 11.5h3.48l-.42 2.632-.12.74 1.482.237.119-.74.459-2.869h3.55V10h-3.31l.56-3.5h2.75V5h-2.51l.5-3.131.12-.741L10.877.89l-.119.74L10.22 5H6.74zM9.98 6.5H6.5L5.94 10h3.48z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgHash;
