import renderer from "react-test-renderer";

import { cleanup, fireEvent, render } from "@testing-library/react";

import { CopyToClipboardButton } from "../CopyToClipboardButton";

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

afterEach(cleanup);

describe("CopyToClipboardButton", () => {
  it("renders correctly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const component = renderer.create(
      <CopyToClipboardButton testId="copy-btn" content={"test"} />
    );
    const tree = component.toJSON() as renderer.ReactTestRendererJSON;
    expect(tree).toMatchSnapshot();
  });

  it("changes content after click", () => {
    const { getByTestId } = render(
      <CopyToClipboardButton content="abc" testId="copy-btn" />
    );

    const innerHtmlBeforeClick = getByTestId("copy-btn").innerHTML;

    fireEvent.click(getByTestId("copy-btn"));

    const innerHtmlAfterClick = getByTestId("copy-btn").innerHTML;

    expect(innerHtmlAfterClick).not.toEqual(innerHtmlBeforeClick);
  });
});
