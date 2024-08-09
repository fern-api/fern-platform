import type { ReactElement, SVGProps } from "react";
const SvgMusicalNotes = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.25 1H5.5v8.401a3 3 0 1 0 1.49 2.349H7V2.5h6.5v4.401a3 3 0 1 0 1.49 2.349H15V1zm4.25 8.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m-8 2.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMusicalNotes;
