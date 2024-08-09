import type { ReactElement, SVGProps } from "react";
const SvgUserScreen = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2.5V9.5h2v-8h-13v8h2V11H1a1 1 0 0 1-1-1zm8 13a3.45 3.45 0 0 0-2.874 1.538l-.126.19V16H3.5v-.727l.126-.189.252-.378a4.954 4.954 0 0 1 8.244 0l.252.378.126.189V16H11v-.273l-.126-.189A3.45 3.45 0 0 0 8 14m-.25-8A2.25 2.25 0 0 0 5.5 8.25v.5A2.25 2.25 0 0 0 7.75 11h.5a2.25 2.25 0 0 0 2.25-2.25v-.5A2.25 2.25 0 0 0 8.25 6zM7 8.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 7 8.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgUserScreen;
