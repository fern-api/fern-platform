import type { ReactElement, SVGProps } from "react";
const SvgBuildings = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 2.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75V14.5h-5zM7.5 16H1V2.25A2.25 2.25 0 0 1 3.25 0h3.5A2.25 2.25 0 0 1 9 2.25V6.5h3.25a2.25 2.25 0 0 1 2.25 2.25V16zM9 14.5h4V8.75a.75.75 0 0 0-.75-.75H9zm-4.25-11H4V5h2V3.5zM4 6.5h2V8H4zm6.75 3H10V11h2V9.5zM4 9.5h2V11H4z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBuildings;
