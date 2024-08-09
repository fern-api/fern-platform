import type { ReactElement, SVGProps } from "react";
const SvgListOrdered = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.623.873a.622.622 0 0 0-.774-.604l-1 .25-.604.151.302 1.208.604-.151.227-.057v2.08H1.377v1.245h3.245V3.75h-.999zM7.75 2.127h-.622v1.245h7.745V2.127zm-.622 5.25h7.745v1.245H7.128zm0 5.25h7.745v1.245H7.128zm-4.06-.88c-.023-.008-.06-.014-.123.014l-.692.308-.569.253-.506-1.138.57-.253.692-.308c1.432-.636 2.69 1.172 1.596 2.294l-1.309 1.34h1.896v1.245H2.437c-.994 0-1.498-1.195-.804-1.906l1.512-1.549c.048-.049.055-.086.056-.11a.2.2 0 0 0-.038-.115.2.2 0 0 0-.095-.076z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgListOrdered;
