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
    Aside: () => Aside,
    default: () => MDXContent,
    frontmatter: () => frontmatter
  });
  var import_jsx_runtime = __toESM(require_jsx_runtime());

  // global-externals:@mdx-js/react
  var { useMDXComponents } = MdxJsReact;

  // _mdx_bundler_entry_point-_random_uuid_.mdx
  var frontmatter = {
    "title": "Tabs",
    "description": "The Tabs component allows you to display related content in a tabbed view."
  };
  function AsideComponent() {
    const { ErrorBoundary, CodeBlock } = MdxJsReact.useMDXComponents();
    return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
      children: (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
          title: "Markdown",
          code: `<Tabs>
  <Tab title="First Tab">
    \u261D\uFE0F Welcome to the content that you can only see inside the first Tab.
  </Tab>
  <Tab title="Second Tab">
    \u270C\uFE0F Here's content that's only inside the second Tab.
  </Tab>
  <Tab title="Third Tab">
    \u{1F4AA} Here's content that's only inside the third Tab.
  </Tab>
</Tabs>
`,
          language: "jsx",
          className: "language-jsx"
        })
      })
    });
  }
  var Aside = AsideComponent;
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      h2: "h2",
      p: "p",
      ...useMDXComponents(),
      ...props.components
    }, { ErrorBoundary, ParamField, Tab, TabGroup } = _components;
    if (!ErrorBoundary) _missingMdxReference("ErrorBoundary", true);
    if (!ParamField) _missingMdxReference("ParamField", true);
    if (!Tab) _missingMdxReference("Tab", true);
    if (!TabGroup) _missingMdxReference("TabGroup", true);
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsx)(_components.p, {
        children: "The Tabs component organizes content into separate tabs that users can switch between. Each tab can contain different types of content like examples or code snippets."
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "properties",
        children: "Properties"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(ParamField, {
          path: "title",
          type: "string",
          required: true,
          children: (0, import_jsx_runtime.jsx)(_components.p, {
            children: "The title displayed in the tab header"
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(ParamField, {
          path: "language",
          type: "string",
          required: false,
          children: (0, import_jsx_runtime.jsx)(_components.p, {
            children: "The language associated with the code block. Any arbitrary string may be used.\nWhen a user selects a tab with a specific language, all other tabs assigned to\nthe same language will automatically sync and switch to match."
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(ParamField, {
          path: "children",
          type: "string | JSX",
          required: true,
          children: (0, import_jsx_runtime.jsx)(_components.p, {
            children: "The content to be displayed when the tab is selected. Can include text,\nmarkdown, and components."
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)("br", {})
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsxs)(TabGroup, {
          children: [(0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(Tab, {
              title: "First Tab",
              id: "first-tab",
              children: (0, import_jsx_runtime.jsx)(_components.p, {
                children: "\u261D\uFE0F Welcome to the content that you can only see inside the first Tab."
              })
            })
          }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(Tab, {
              title: "Second Tab",
              id: "second-tab",
              children: (0, import_jsx_runtime.jsx)(_components.p, {
                children: "\u270C\uFE0F Here\u2019s content that\u2019s only inside the second Tab."
              })
            })
          }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(Tab, {
              title: (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
                children: (0, import_jsx_runtime.jsx)(_components.p, {
                  children: (0, import_jsx_runtime.jsx)(_components.a, {
                    href: "https://github.com",
                    children: "Third Tab"
                  })
                })
              }),
              id: "third-tabhttpsgithubcom",
              children: (0, import_jsx_runtime.jsx)(_components.p, {
                children: "\u{1F4AA} Here\u2019s content that\u2019s only inside the third Tab. The title of this tab is\na link."
              })
            })
          })]
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {})]
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