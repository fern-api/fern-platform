import type { ReactElement, SVGProps } from "react";
const SvgSlashBack = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m11.985 15.394-.296-.69-6-14-.295-.689-1.379.591.296.69 6 14 .295.689z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSlashBack;
