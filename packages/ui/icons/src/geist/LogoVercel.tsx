import type { ReactElement, SVGProps } from "react";
const SvgLogoVercel = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" fillRule="evenodd" d="m8 1 8 14H0z" clipRule="evenodd" />
    </svg>
);
export default SvgLogoVercel;
