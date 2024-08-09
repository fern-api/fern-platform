import type { ReactElement, SVGProps } from "react";
const SvgLogoYCombinator = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#FB651E" d="M16 0H0v16h16z" />
        <path
            fill="#fff"
            d="M7.46 9.047 4.716 3.902H5.97l1.615 3.256q.038.087.087.18a2 2 0 0 1 .087.193.4.4 0 0 1 .037.068l.025.056a4 4 0 0 1 .2.46q.098-.211.217-.454l.242-.503 1.64-3.256h1.168l-2.77 5.207v3.318H7.46z"
        />
    </svg>
);
export default SvgLogoYCombinator;
