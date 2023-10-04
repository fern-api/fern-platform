/**
 * @jest-environment jsdom
 */

Object.defineProperty(navigator, "clipboard", {
    value: {
        writeText: async () => {
            // Ignore
        },
    },
});

import { cleanup, fireEvent, render } from "@testing-library/react";
import { CopyToClipboardButton } from "../CopyToClipboardButton";

afterEach(cleanup);

it("CopyToClipboardButton changes the text after click", () => {
    const { getByTestId } = render(<CopyToClipboardButton content="abc" testId="copy-btn" />);

    const innerHtmlBeforeClick = getByTestId("copy-btn").innerHTML;

    fireEvent.click(getByTestId("copy-btn"));

    const innerHtmlAfterClick = getByTestId("copy-btn").innerHTML;

    expect(innerHtmlAfterClick).not.toEqual(innerHtmlBeforeClick);
});
