var Component = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // global-externals:react/jsx-runtime
  var require_jsx_runtime = __commonJS({
    "global-externals:react/jsx-runtime"(exports, module) {
      module.exports = _jsx_runtime;
    }
  });

  // _mdx_bundler_entry_point-_random_uuid_.mdx
  var mdx_bundler_entry_point__random_uuid__exports = {};
  __export(mdx_bundler_entry_point__random_uuid__exports, {
    default: () => MDXContent,
    frontmatter: () => frontmatter
  });
  var import_jsx_runtime = __toESM(require_jsx_runtime());

  // global-externals:@mdx-js/react
  var { useMDXComponents } = MdxJsReact;

  // _mdx_bundler_entry_point-_random_uuid_.mdx
  var frontmatter = void 0;
  function _createMdxContent(props) {
    const _components = {
      code: "code",
      h2: "h2",
      li: "li",
      p: "p",
      strong: "strong",
      ul: "ul",
      ...useMDXComponents(),
      ...props.components
    }, { CodeBlock, ErrorBoundary } = _components;
    if (!CodeBlock) _missingMdxReference("CodeBlock", true);
    if (!ErrorBoundary) _missingMdxReference("ErrorBoundary", true);
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsx)(_components.h2, {
        id: "185",
        children: "1.8.5"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: [(0, import_jsx_runtime.jsx)(_components.strong, {
          children: (0, import_jsx_runtime.jsx)(_components.code, {
            children: "(feat):"
          })
        }), " Add forward-compatible enums. Set ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "experimental-enable-forward-compatible-enums"
        }), " to ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "true"
        }), " in the configuration to generate forward-compatible enums.\nWith forward-compatible enums you can create and parse an enum value that is not predefined."]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
        children: ["\n", (0, import_jsx_runtime.jsx)(_components.li, {
          children: "Forward compatible enums are not compatible with the previously generated native enums.\nThis is a breaking change for the users of the generated SDK, but only users using switch-case statements are affected."
        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
          children: ["Use the ", (0, import_jsx_runtime.jsx)(_components.code, {
            children: "Value"
          }), " property to get the string value of the enum. - For each value in the enum,", "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
            children: ["\n", (0, import_jsx_runtime.jsx)(_components.li, {
              children: "a public static property is generated, which is an instance of the enum class,"
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
              children: ["a public static property is generated within the nested ", (0, import_jsx_runtime.jsx)(_components.code, {
                children: "Values"
              }), " class with the string value of the enum."]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["Here\u2019s a before and after for creating and parsing a resource with a predefined enum value and a custom enum value:\n", (0, import_jsx_runtime.jsx)(_components.strong, {
          children: "Before"
        }), ":\n", (0, import_jsx_runtime.jsx)(_components.code, {
          children: 'csharp var resource = client.CreateResource(new Resource { Id = "2", EnumProperty = MyEnum.Value2 } ); // The line below does not compile because the enum does not have a `Value3` value. // resource = client.CreateResource(new Resource { Id = "3", EnumProperty = MyEnum.Value3 } ); resource = client.GetResource("3"); switch(resource.EnumProperty) {     case MyEnum.Value1:         Console.WriteLine("Value1");         break;     case MyEnum.Value2:         Console.WriteLine("Value2");         break;     default:         // this will never be reached until the SDK is updated with the new enum value         Console.WriteLine("Unknown");         break; } if(resource.EnumProperty == MyEnum.Value1) {         Console.WriteLine("Value1"); } else if (resource.EnumProperty == MyEnum.Value2) {         Console.WriteLine("Value2"); } else {     // this will never be reached until the SDK is updated with the new enum value     Console.WriteLine("Unknown"); } '
        }), "\nNo exception is thrown, but the output incorrectly shows ", (0, import_jsx_runtime.jsx)(_components.code, {
          children: "Value1"
        }), " because .NET falls back to the first value in the enum.\n", (0, import_jsx_runtime.jsx)(_components.strong, {
          children: "After"
        }), ":"]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          code: '    case MyEnum.Values.Value1:\n        Console.WriteLine("Value1");\n        break;\n    case MyEnum.Values.Value2:\n        Console.WriteLine("Value2");\n        break;\n    default:\n        Console.WriteLine(resource.EnumProperty.Value);\n        break;\n} if(resource.EnumProperty == MyEnum.Value1) {\n    Console.WriteLine("Value1");\n} else if (resource.EnumProperty == MyEnum.Value2) {\n    Console.WriteLine("Value2");\n} else {\n    Console.WriteLine(resource.EnumProperty.Value);\n} ```\nThe output correctly shows `Value3`.\n',
          language: "csharp",
          className: "language-csharp",
          title: 'var resource = client.CreateResource(new Resource { Id = "2", EnumProperty = MyEnum.Value2 } ); resource = client.CreateResource(new Resource { Id = "3", EnumProperty = MyEnum.Custom("value3") } ); resource = client.GetResource("3"); switch(resource.EnumProperty.Value) {'
        })
      })]
    });
  }
  function MDXContent(props = {}) {
    const { wrapper: MDXLayout } = {
      ...useMDXComponents(),
      ...props.components
    };
    return MDXLayout ? (0, import_jsx_runtime.jsx)(MDXLayout, {
      ...props,
      children: (0, import_jsx_runtime.jsx)(_createMdxContent, {
        ...props
      })
    }) : _createMdxContent(props);
  }
  function _missingMdxReference(id, component) {
    throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
  }
  return __toCommonJS(mdx_bundler_entry_point__random_uuid__exports);
})();
;return Component;