/**
 * @vitest-environment jsdom
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

describe("CopyToClipboardButton", () => {
  it("changes content after click", () => {
    const { getByTestId } = render(
      <CopyToClipboardButton data-testid="copy-btn" content="abc" />
    );

    const innerHtmlBeforeClick = getByTestId("copy-btn").innerHTML;

    fireEvent.click(getByTestId("copy-btn"));

    const innerHtmlAfterClick = getByTestId("copy-btn").innerHTML;

    expect(innerHtmlAfterClick).not.toEqual(innerHtmlBeforeClick);
  });
});
