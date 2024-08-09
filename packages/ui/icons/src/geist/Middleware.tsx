import type { ReactElement, SVGProps } from "react";
const SvgMiddleware = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m2.47 3.53.078.079A7 7 0 0 0 1.29 6h1.585A5.52 5.52 0 0 1 6 2.875V1.29a7 7 0 0 0-2.391 1.258L3.53 2.47 2.03.97 1.5.44.44 1.5l.53.53zM7.98 15h.04zm5.472-2.609A7 7 0 0 0 14.71 10h-1.585A5.52 5.52 0 0 1 10 13.125v1.585a7 7 0 0 0 2.391-1.258l.079.078 1.5 1.5.53.53 1.06-1.06-.53-.53-1.5-1.5zm0-8.782A7 7 0 0 1 14.71 6h-1.585A5.52 5.52 0 0 0 10 2.875V1.29a7 7 0 0 1 2.391 1.258l.079-.078 1.5-1.5.53-.53 1.06 1.06-.53.53-1.5 1.5zM1.29 10h1.585A5.52 5.52 0 0 0 6 13.125v1.585a7 7 0 0 1-2.391-1.258l-.079.078-1.5 1.5-.53.53L.44 14.5l.53-.53 1.5-1.5.078-.079A7 7 0 0 1 1.29 10M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMiddleware;
