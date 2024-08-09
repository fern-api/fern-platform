import type { ReactElement, SVGProps } from "react";
const SvgStopwatchFast = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7-.25h4v1.5H9.75v.79a6.97 6.97 0 0 1 3.641 1.508l.579-.578.53-.53 1.06 1.06-.53.53-.578.579a7 7 0 0 1-9.715 9.944H2v-1.5h3a.75.75 0 0 1 .48.173 5.5 5.5 0 1 0-.782-7.654l-1.172-.936A7 7 0 0 1 8.25 2.04v-.79H7zm4.652 7.659-.53.53L9.53 9.53l-.53.53L7.94 9l.53-.53 1.59-1.591.531-.53zM2 7h3v1.5H2zM.75 10H0v1.5h5V10z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgStopwatchFast;
