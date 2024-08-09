import type { ReactElement, SVGProps } from "react";
const SvgEdge = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.5 1S4.586 4.748 3.941 5.397a.234.234 0 0 0-.027.298c.064.094.186.13.292.086l3.7-1.508 3.869 6.087c.066.104.2.141.312.087a.235.235 0 0 0 .116-.298A3301 3301 0 0 0 8.5 1M6.293 7.039a.234.234 0 0 0-.067-.311.244.244 0 0 0-.322.035C5.124 7.633 0 13.5 0 13.5s5.186 1.303 6.03 1.494a.24.24 0 0 0 .274-.132.234.234 0 0 0-.076-.29l-3.066-2.229L6.293 7.04zm7.761 1.55a.241.241 0 0 0-.469.077v3.716l-7.132.138a.24.24 0 0 0-.236.22.24.24 0 0 0 .202.25C7.682 13.193 16 14.573 16 14.573s-1.669-5.183-1.946-5.984"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgEdge;
