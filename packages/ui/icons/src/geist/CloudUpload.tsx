import type { ReactElement, SVGProps } from "react";
const SvgCloudUpload = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 4.875a3.375 3.375 0 0 1 6.401-1.497c.29.584.894 1.122 1.7 1.122h2.649a2.25 2.25 0 0 1 1.478 3.947l-.566.493.986 1.13.565-.492A3.75 3.75 0 0 0 12.25 3H9.601c-.09 0-.248-.07-.356-.288A4.875 4.875 0 0 0 0 4.875v1.529a4.09 4.09 0 0 0 1.53 3.193l.584.47.94-1.169-.584-.47a2.59 2.59 0 0 1-.97-2.024zm5.793 2.521a1 1 0 0 1 1.414 0l3.073 3.074.53.53-1.06 1.06-.53-.53-1.97-1.97V16h-1.5V9.56l-1.97 1.97-.53.53L3.69 11l.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCloudUpload;
