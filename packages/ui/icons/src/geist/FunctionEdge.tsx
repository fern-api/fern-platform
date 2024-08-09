import type { ReactElement, SVGProps } from "react";
const SvgFunctionEdge = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 2.25A2.25 2.25 0 0 1 2.25 0h11.5A2.25 2.25 0 0 1 16 2.25V8h-1.5V2.25a.75.75 0 0 0-.75-.75H2.25a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75H8V16H2.25A2.25 2.25 0 0 1 0 13.75zM9.246 5C8.42 5 7.75 5.67 7.75 6.496V7H9.5v1.5H7.75v1.004A2.996 2.996 0 0 1 4.754 12.5h-.75V11h.75c.826 0 1.496-.67 1.496-1.496V8.5H4.5V7h1.75v-.504A2.996 2.996 0 0 1 9.246 3.5h.75V5z"
            clipRule="evenodd"
        />
        <path
            fill="var(--ds-purple-700)"
            fillRule="evenodd"
            d="M11.5 11.875c0-.207.168-.375.375-.375H16V10h-4.125a1.875 1.875 0 0 0-1.5 3 1.875 1.875 0 0 0 1.5 3H16v-1.5h-4.125a.375.375 0 0 1 0-.75H15v-1.5h-3.125a.375.375 0 0 1-.375-.375"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFunctionEdge;
