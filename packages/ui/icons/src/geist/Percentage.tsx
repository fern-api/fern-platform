import type { ReactElement, SVGProps } from "react";
const SvgPercentage = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m11.475 1.332-.279.697-5 12.5-.278.696-1.393-.557.279-.697 5-12.5.278-.696zM4 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M7 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0m6.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPercentage;
