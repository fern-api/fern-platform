import { toTree } from "../../parse";
import { rehypeExpressionToMd } from "../rehype-expression-to-md";

describe("rehype-expression-to-md", () => {
  it("should convert jsx body of an expression to md", () => {
    const hast = toTree("{<div>[Hello](https://example.com)</div>}").hast;
    (rehypeExpressionToMd as any)()(hast);
    expect(hast).toMatchSnapshot();
  });

  it("should convert markdown inside of attributes into jsx", () => {
    const hast = toTree(
      '{<Frame caption="[Hello](https://example.com)"><img /></Frame>}'
    ).hast;
    (rehypeExpressionToMd as any)()(hast);
    expect(hast).toMatchSnapshot();
  });
});
