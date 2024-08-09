import type { ReactElement, SVGProps } from "react";
const SvgTextItalic = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.25 1H14.5v1.5h-3.953l-3.52 11h4.723V15H1.5v-1.5h3.953l3.52-11H4.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTextItalic;
