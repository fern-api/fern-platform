import { useEffect } from "react";
import { useFeatureFlags } from "../atoms/flags";

let hasBeenCalled = false;

export const useConsoleMessage = (): void => {
    const { isWhitelabeled } = useFeatureFlags();

    useEffect(() => {
        if (hasBeenCalled || isWhitelabeled) {
            return;
        }

        hasBeenCalled = true;

        const color = "#1da32b";
        const svgString = `<svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 24"><path d="M36.916 0H42.7v4.071H38.09c-.977 0-1.514.4-1.514 1.37v1.435h5.111v4.071h-5.11v12.417h-4.71V10.947h-4.134v-4.07h4.135V4.873C31.869 1.67 33.718 0 36.913 0h.004ZM41.753 15.022c0-5.24 3.363-8.645 8.273-8.645s8.238 3.271 8.238 8.512c0 .6-.033 1.203-.1 1.902h-11.77c.202 2.069 1.581 3.205 3.833 3.205 1.514 0 2.487-.633 2.926-1.536h4.81c-.977 3.272-3.531 5.407-7.766 5.407-5.078 0-8.44-3.505-8.44-8.845h-.004Zm11.77-1.769v-.066c0-1.87-1.212-3.139-3.497-3.139-2.286 0-3.531 1.27-3.665 3.205h7.161ZM59.91 6.876h4.134V9.78c.402-1.87 1.748-2.905 3.866-2.905h2.96v.566c0 1.935-1.58 3.505-3.53 3.505-1.85 0-2.726.936-2.726 2.805v9.615h-4.708V6.876h.003ZM72.531 6.876h4.135v1.67c.976-1.436 2.758-2.17 4.675-2.17 4.067 0 6.624 2.606 6.624 6.977v10.015h-4.708v-9.515c0-2.202-1.01-3.272-2.893-3.272-1.883 0-3.128 1.303-3.128 3.405v9.378h-4.709V6.876h.004ZM20.121 1.568h-2.753c-3.36 0-6.289 2.395-6.289 6.036v5.783A7.816 7.816 0 0 0 3.821 8.49H.286v.798c0 3.838 3.139 6.965 7.015 6.965h8.657c3.866 0 7.016-3.116 7.016-6.954V8.5h-3.525a7.817 7.817 0 0 0-6.894 4.122c-.022-.809.022-1.662.198-2.449.474-2.198 1.972-2.515 2.445-2.558l.121-.011c2.71-.328 4.813-2.613 4.813-5.401v-.635h-.01Zm-15.837.81L6.817 3A4.191 4.191 0 0 1 9.9 8.085l-.122.47-2.07-.514A4.741 4.741 0 0 1 4.812 5.91a4.666 4.666 0 0 1-.54-3.531h.012ZM5.396 18.362h12.456l-1.3 3.215a2.981 2.981 0 0 1-2.775 1.858H9.471a2.981 2.981 0 0 1-2.775-1.858l-1.3-3.204v-.01Z"/></svg>`;
        const svgUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

        // eslint-disable-next-line no-console
        console.log(
            "\n%cBuilt with %c %c\n%cCheck out https://buildwithfern.com\n",
            `
                font-size: 14px;
                color: ${color};
            `,
            `
                font-size: 1px;
                padding: 22px 0 2px 88px;
                background: url(${svgUrl}) no-repeat;
                background-size: contain;
                background-position: center;
            `,
            "",
            `
                margin-block: 4px;
                font-size: 11px;
                color: ${color};
            `,
        );
    }, [isWhitelabeled]);
};
