import type { ReactElement, SVGProps } from "react";
const SvgMessage = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m2.891 10.403.092.229c.246.613.517 1.473.517 2.368 0 .359-.044.713-.112 1.05a7.2 7.2 0 0 0 2.322-1.297l.515-.43.663.097q.541.079 1.112.08c3.784 0 6.5-2.644 6.5-5.5S11.784 1.5 8 1.5 1.5 4.144 1.5 7c0 1.182.442 2.293 1.231 3.215zm-.078 5.362C1.761 16 1 16 1 16s.433-.69.73-1.563C1.882 13.983 2 13.48 2 13c0-.617-.193-1.27-.409-1.81C.591 10.022 0 8.572 0 7c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7q-.68 0-1.33-.096A8.7 8.7 0 0 1 5 15a9.6 9.6 0 0 1-2.187.765"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMessage;
