import type { ReactElement, SVGProps } from "react";
const SvgPaperclip = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.86 1.707a2 2 0 0 0-1.423.59L3.195 8.538a3.37 3.37 0 1 0 4.766 4.767l6.243-6.243.5-.5 1 1-.5.5-6.242 6.243a4.785 4.785 0 1 1-6.768-6.767l6.243-6.243a3.426 3.426 0 1 1 4.845 4.845l-6.25 6.242a2.067 2.067 0 0 1-2.922-2.92L9.877 3.7l.5-.5 1 1-.5.5-5.767 5.76a.652.652 0 1 0 .922.922l6.25-6.242a2.011 2.011 0 0 0-1.423-3.434z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPaperclip;
