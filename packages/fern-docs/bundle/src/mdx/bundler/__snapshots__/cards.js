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
    "title": "Cards",
    "description": "Use cards to display content in a box"
  };
  function AsideComponent() {
    const { ErrorBoundary, CodeGroup, CodeBlock } = MdxJsReact.useMDXComponents();
    return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
      children: (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsxs)(CodeGroup, {
          children: [(0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(CodeBlock, {
              title: "Basic",
              code: `<Card
  title="Python"
  icon="brands python"
  href="https://github.com/fern-api/fern/tree/main/generators/python"
>
  View Fern's Python SDK generator.
</Card>
`,
              language: "jsx",
              className: "language-jsx"
            })
          }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(CodeBlock, {
              title: "Custom Icon",
              code: `<Card
  title="Python"
  icon={
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg"
      alt="Python logo"
    />
  }
  href="https://github.com/fern-api/fern/tree/main/generators/python"
>
  View Fern's Python SDK generator.
</Card>
`,
              language: "jsx",
              className: "language-jsx"
            })
          }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(CodeBlock, {
              title: "Icon Position",
              code: '<Card title="Location" icon="regular globe" iconPosition="left">\n  You can set the icon position as `left` or `top`. Default is `top`.\n</Card>\n',
              language: "jsx",
              className: "language-jsx"
            })
          })]
        })
      })
    });
  }
  var Aside = AsideComponent;
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      code: "code",
      h2: "h2",
      h3: "h3",
      img: "img",
      p: "p",
      table: "table",
      tbody: "tbody",
      td: "td",
      th: "th",
      thead: "thead",
      tr: "tr",
      ...useMDXComponents(),
      ...props.components
    }, { Card, CardGroup, ErrorBoundary } = _components;
    if (!Card) _missingMdxReference("Card", true);
    if (!CardGroup) _missingMdxReference("CardGroup", true);
    if (!ErrorBoundary) _missingMdxReference("ErrorBoundary", true);
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsx)(_components.p, {
        children: "Cards are container components that group related content and actions together. They provide a flexible way to present information with optional elements like icons, titles, and links in a visually distinct box."
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h2, {
        id: "properties",
        children: "Properties"
      }), "\n", (0, import_jsx_runtime.jsxs)(_components.table, {
        children: [(0, import_jsx_runtime.jsx)(_components.thead, {
          children: (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.th, {
              children: "Property"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Type"
            }), (0, import_jsx_runtime.jsx)(_components.th, {
              children: "Description"
            })]
          })
        }), (0, import_jsx_runtime.jsxs)(_components.tbody, {
          children: [(0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "title"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "string"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "The title text to display in the card"
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "icon"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "string | img"
              })
            }), (0, import_jsx_runtime.jsxs)(_components.td, {
              children: ["Either a ", (0, import_jsx_runtime.jsx)(_components.a, {
                href: "https://fontawesome.com/icons",
                children: "Font Awesome"
              }), " icon class (e.g. \u2018brands python\u2019) or a custom image"]
            })]
          }), (0, import_jsx_runtime.jsxs)(_components.tr, {
            children: [(0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "href"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: (0, import_jsx_runtime.jsx)(_components.code, {
                children: "string"
              })
            }), (0, import_jsx_runtime.jsx)(_components.td, {
              children: "Optional URL that makes the entire card clickable"
            })]
          })]
        })]
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "basic",
        children: "Basic"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CardGroup, {
          children: (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(Card, {
              title: "Python",
              icon: "brands python",
              href: "https://github.com/fern-api/fern/tree/main/generators/python",
              id: "python",
              children: (0, import_jsx_runtime.jsx)(_components.p, {
                children: "The icon field references a Font Awesome icon."
              })
            })
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "custom-icon",
        children: "Custom icon"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CardGroup, {
          children: (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(Card, {
              title: "Python",
              icon: (0, import_jsx_runtime.jsx)(_components.img, {
                src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
                alt: "Python logo"
              }),
              href: "https://github.com/fern-api/fern/tree/main/generators/python",
              id: "python-1",
              children: (0, import_jsx_runtime.jsx)(_components.p, {
                children: "Pass in an image tag to use a custom icon."
              })
            })
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(_components.h3, {
        id: "icon-position",
        children: "Icon position"
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(CardGroup, {
          children: (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsx)(Card, {
              title: "Location",
              icon: "regular globe",
              iconPosition: "left",
              id: "location",
              children: (0, import_jsx_runtime.jsxs)(_components.p, {
                children: ["You can set the icon position as ", (0, import_jsx_runtime.jsx)(_components.code, {
                  children: "left"
                }), " or ", (0, import_jsx_runtime.jsx)(_components.code, {
                  children: "top"
                }), ". Default is ", (0, import_jsx_runtime.jsx)(_components.code, {
                  children: "top"
                }), "."]
              })
            })
          })
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