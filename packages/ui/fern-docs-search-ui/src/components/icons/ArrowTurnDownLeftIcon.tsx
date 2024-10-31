import { SVGProps, forwardRef } from "react";

export const ArrowTurnDownLeftIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
    <svg
        ref={ref}
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="arrow-turn-down-left"
        className="svg-inline--fa fa-arrow-turn-down-left"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        {...props}
    >
        <path
            fill="currentColor"
            d="M448 64c0-17.7 14.3-32 32-32s32 14.3 32 32V224c0 53-43 96-96 96H109.3l73.4 73.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L109.3 256H416c17.7 0 32-14.3 32-32V64z"
        />
    </svg>
));

ArrowTurnDownLeftIcon.displayName = "ArrowTurnDownLeftIcon";
