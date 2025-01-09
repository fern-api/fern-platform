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
import renderer from "react-test-renderer";
import { CopyToClipboardButton } from "../CopyToClipboardButton";

afterEach(cleanup);

describe("CopyToClipboardButton", () => {
  it("renders correctly", async () => {
    const component = renderer.create(
      <CopyToClipboardButton data-testid="copy-btn" content={"test"} />
    );
    const tree = component.toJSON() as renderer.ReactTestRendererJSON;
    expect(tree).toMatchSnapshot();
  });

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
