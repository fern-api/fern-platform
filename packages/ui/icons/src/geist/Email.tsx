import type { ReactElement, SVGProps } from "react";
const SvgEmail = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 0C3.578 0 0 3.617 0 8.03 0 12.412 3.55 16 7.938 16a7.94 7.94 0 0 0 4.208-1.207l.252-.157-.796-1.272-.251.157a6.44 6.44 0 0 1-3.413.979C4.387 14.5 1.5 11.59 1.5 8.03 1.5 4.438 4.414 1.5 8 1.5A6.5 6.5 0 0 1 14.5 8v.607c0 .77-.624 1.393-1.393 1.393-.887 0-1.607-.72-1.607-1.607V4.5H10v.627a3.5 3.5 0 1 0 .647 5.163 3.1 3.1 0 0 0 2.46 1.21A2.893 2.893 0 0 0 16 8.607V8a8 8 0 0 0-8-8m2 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgEmail;
