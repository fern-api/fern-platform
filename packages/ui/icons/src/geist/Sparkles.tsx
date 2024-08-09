import type { ReactElement, SVGProps } from "react";
const SvgSparkles = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="M2.5.5V0h1v.5a2 2 0 0 0 2 2H6v1h-.5a2 2 0 0 0-2 2V6h-1v-.5a2 2 0 0 0-2-2H0v-1h.5a2 2 0 0 0 2-2m12 4V5h-1v-.5a1 1 0 0 0-1-1H12v-1h.5a1 1 0 0 0 1-1V1h1v.5a1 1 0 0 0 1 1h.5v1h-.5a1 1 0 0 0-1 1m-6.093.43L8.5 4h1l.093.93a5 5 0 0 0 4.478 4.477L15 9.5v1l-.93.093a5 5 0 0 0-4.477 4.478L9.5 16h-1l-.093-.93a5 5 0 0 0-4.478-4.477L3 10.5v-1l.93-.093A5 5 0 0 0 8.406 4.93z"
        />
    </svg>
);
export default SvgSparkles;
