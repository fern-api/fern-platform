import type { ReactElement, SVGProps } from "react";
const SvgKeyOld = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M11.25 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5M6.5 4.75a4.75 4.75 0 1 1 1.963 3.847L7.061 10l1.97 1.97.53.53-.53.53-2.25 2.25-.531.53-.53-.53-1.97-1.97-1.97 1.97-.53.53-1.06-1.06.53-.53 1.97-1.97.53-.53 2.25-2.25.53-.53 1.403-1.403A4.73 4.73 0 0 1 6.5 4.75m-1.69 7.5 1.44 1.44 1.19-1.19L6 11.06z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgKeyOld;
