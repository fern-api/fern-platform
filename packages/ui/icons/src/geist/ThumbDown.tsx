import type { ReactElement, SVGProps } from "react";
const SvgThumbDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.895 13.76a.25.25 0 0 1-.395-.203V10.75A1.75 1.75 0 0 0 4.75 9H2.5V2.5h9.688c.574 0 1.074.39 1.213.947l1 4A1.25 1.25 0 0 1 13.188 9H8.5v3.485a.25.25 0 0 1-.105.204zM5 13.557c0 1.423 1.609 2.251 2.767 1.424l1.5-1.072A1.75 1.75 0 0 0 10 12.486V10.5h3.188a2.75 2.75 0 0 0 2.668-3.417l-1-4A2.75 2.75 0 0 0 12.188 1H1v9.5h3.75a.25.25 0 0 1 .25.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgThumbDown;
