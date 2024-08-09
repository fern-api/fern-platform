import type { ReactElement, SVGProps } from "react";
const SvgSpeakerFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" d="M2 11V5a1 1 0 0 1 1-1h3l8-4v16l-8-4H3a1 1 0 0 1-1-1" />
    </svg>
);
export default SvgSpeakerFill;
