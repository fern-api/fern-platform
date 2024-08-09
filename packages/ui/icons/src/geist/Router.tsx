import type { ReactElement, SVGProps } from "react";
const SvgRouter = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m5.71 1.742.626-.415A7.97 7.97 0 0 1 10.75 0c1.63 0 3.149.488 4.414 1.327l.626.415-.83 1.25-.624-.414A6.47 6.47 0 0 0 10.75 1.5a6.47 6.47 0 0 0-3.586 1.078l-.625.414zM11.25 8V6h-1.5v2H0v5.5A2.5 2.5 0 0 0 2.5 16h11a2.5 2.5 0 0 0 2.5-2.5V8zM1.5 9.5h13v4a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zm2.25 3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 11.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.397-8.163-.662.354.707 1.323.661-.354c.49-.261 1.05-.41 1.647-.41s1.157.149 1.647.41l.661.354.707-1.323-.662-.354A5 5 0 0 0 10.75 3c-.85 0-1.651.212-2.353.587"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRouter;
