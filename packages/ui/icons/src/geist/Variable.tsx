import type { ReactElement, SVGProps } from "react";
const SvgVariable = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 4.5a1.5 1.5 0 1 0-1.086-2.537L8.296 6.55l-.652-1.866A4.75 4.75 0 0 0 3.16 1.5H2V3h1.16a3.25 3.25 0 0 1 3.068 2.179l.924 2.646-2.91 3.242c-.39.435-1.078.434-1.67.433H2.5a1.5 1.5 0 1 0 .98 2.636.8.8 0 0 0 .119-.107L7.717 9.44l1.159 3.319a2.53 2.53 0 0 0 4.175.954l1.48-1.479-1.061-1.06-1.48 1.478a1.03 1.03 0 0 1-1.698-.388L8.86 8.167l2.903-3.234c.39-.434 1.076-.434 1.668-.433h.068z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgVariable;
