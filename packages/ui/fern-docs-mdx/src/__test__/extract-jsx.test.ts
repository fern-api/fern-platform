import { toTree } from "../parse.js";

describe("extractJsx", () => {
    it("ignores html elements", () => {
        const tree = toTree("<div><h1>Hello</h1></div>");
        expect(tree.jsxElements).toEqual([]);
        expect(tree.esmElements).toEqual([]);
    });

    it("extracts mdx jsx elements", () => {
        const tree = toTree("<MyComponent />");
        expect(tree.jsxElements).toEqual(["MyComponent"]);
        expect(tree.esmElements).toEqual([]);
    });

    it("extracts jsx elements in expressions", () => {
        const tree = toTree("<div>{<MyComponent />}</div>");
        expect(tree.jsxElements).toEqual(["MyComponent"]);
        expect(tree.esmElements).toEqual([]);
    });

    it("extracts esm elements in mdxjsEsm using default export", () => {
        const tree = toTree("export default function MyComponent() { return <div>Hello</div> }");
        expect(tree.esmElements).toEqual(["MyComponent"]);
        expect(tree.jsxElements).toEqual([]);
    });

    it("extracts esm elements in mdxjsEsm using named exports", () => {
        const tree = toTree("export const MyComponent = () => <div>Hello</div>");
        expect(tree.esmElements).toEqual(["MyComponent"]);
        expect(tree.jsxElements).toEqual([]);
    });

    it("extracts esm elements in mdxjsEsm using destructured named exports", () => {
        const tree = toTree("export const { MyComponent } = { MyComponent: () => <div>Hello</div> }");
        expect(tree.esmElements).toEqual(["MyComponent"]);
        expect(tree.jsxElements).toEqual([]);
    });

    it("extracts esm elements in mdxjsEsm using spread properties", () => {
        const tree = toTree(
            "export const { ...rest } = { MyComponent: () => <div>Hello</div> }\n\n <rest.MyComponent />",
        );
        expect(tree.esmElements).toEqual(["MyComponent"]);
        expect(tree.jsxElements).toEqual([]);
    });

    it("extracts esm elements that are assigned to variables", () => {
        const tree = toTree("export const MyComponent = () => <div>Hello</div>\n\n <MyComponent />");
        expect(tree.esmElements).toEqual(["MyComponent"]);
        expect(tree.jsxElements).toEqual([]);
    });

    it("extracts jsx elements inside of jsx elements", () => {
        const tree = toTree("<MyComponent><MyComponent2>Hello</MyComponent2></MyComponent>");
        expect(tree.jsxElements).toEqual(["MyComponent", "MyComponent2"]);
        expect(tree.esmElements).toEqual([]);
    });

    it("extracts jsx elements inside of jsx expressions", () => {
        const tree = toTree("<MyComponent>{<MyComponent2>Hello</MyComponent2>}</MyComponent>");
        expect(tree.jsxElements).toEqual(["MyComponent", "MyComponent2"]);
        expect(tree.esmElements).toEqual([]);
    });

    it("extracts jsx elements inside of jsx attributes", () => {
        const tree = toTree("<MyComponent prop={<MyComponent2>Hello</MyComponent2>} />");
        expect(tree.jsxElements).toEqual(["MyComponent", "MyComponent2"]);
        expect(tree.esmElements).toEqual([]);
    });

    it("extracts jsx elements inside of jsx attributes with a spread property", () => {
        const tree = toTree("<MyComponent prop={{ ...{ MyComponent2: () => <div>Hello</div> } }} />");
        expect(tree.jsxElements).toEqual(["MyComponent"]);
        expect(tree.esmElements).toEqual(["MyComponent2"]);
    });
});
