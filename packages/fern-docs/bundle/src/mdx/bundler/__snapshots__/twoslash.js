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
  var frontmatter = {
    "title": "TWOSLASH PAGE"
  };
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      code: "code",
      div: "div",
      em: "em",
      li: "li",
      p: "p",
      path: "path",
      pre: "pre",
      span: "span",
      strong: "strong",
      svg: "svg",
      ul: "ul",
      ...useMDXComponents(),
      ...props.components
    };
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsx)(_components.p, {
        children: "Some information about the project."
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "const"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " hi"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ' "'
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#C3E88D"
                        },
                        children: "Hello"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: '"'
                      })]
                    })
                  }), "hi"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ="
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: ' "'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "Hello"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "const"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover twoslash-query-presisted",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-arrow"
                    }), (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " msg"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ' "'
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#C3E88D"
                        },
                        children: "Hello, world"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: '"'
                      })]
                    })]
                  }), "msg"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ="
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: " `"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: "${"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " hi"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ' "'
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#C3E88D"
                        },
                        children: "Hello"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#22863A",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: '"'
                      })]
                    })
                  }), "hi"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: "}"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: ", world"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: "`"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line"
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "var"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " Console"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["The ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), " module provides a simple debugging console that is similar to the\nJavaScript console mechanism provided by web browsers."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
                        children: "The module exports two specific components:"
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
                        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "Console"
                          }), " class with methods such as ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.log()"
                          }), ", ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.error()"
                          }), " and ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.warn()"
                          }), " that can be used to write to any Node.js stream."]
                        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " instance configured to write to ", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstdout",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stdout"
                            })
                          }), " and\n", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstderr",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stderr"
                            })
                          }), ". The global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " can be used without importing the ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "node:console"
                          }), " module."]
                        }), "\n"]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.em, {
                          children: (0, import_jsx_runtime.jsx)(_components.strong, {
                            children: "Warning"
                          })
                        }), ": The global console object's methods are neither consistently\nsynchronous like the browser APIs they resemble, nor are they consistently\nasynchronous like all other Node.js streams. See the ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/process.html#a-note-on-process-io",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "note on process I/O"
                          })
                        }), " for\nmore information."]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the global ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), ":"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "console.log('hello world');\n// Prints: hello world, to stdout\nconsole.log('hello %s', 'world');\n// Prints: hello world, to stdout\nconsole.error(new Error('Whoops, something bad happened'));\n// Prints error message and stack trace to stderr:\n//   Error: Whoops, something bad happened\n//     at [eval]:5:15\n//     at Script.runInThisContext (node:vm:132:18)\n//     at Object.runInThisContext (node:vm:309:38)\n//     at node:internal/process/execution:77:19\n//     at [eval]-wrapper:6:22\n//     at evalScript (node:internal/process/execution:76:60)\n//     at node:internal/main/eval_string:23:3\n\nconst name = 'Will Robinson';\nconsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to stderr\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Console"
                        }), " class:"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const out = getStreamSomehow();\nconst err = getStreamSomehow();\nconst myConsole = new console.Console(out, err);\n\nmyConsole.log('hello world');\n// Prints: hello world, to out\nmyConsole.log('hello %s', 'world');\n// Prints: hello world, to out\nmyConsole.error(new Error('Whoops, something bad happened'));\n// Prints: [Error: Whoops, something bad happened], to err\n\nconst name = 'Will Robinson';\nmyConsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to err\n"
                        })
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@see"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "[source](https://github.com/nodejs/node/blob/v18.19.1/lib/console.js)"
                        })]
                      })
                    })]
                  }), "console"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "."
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  children: ["e", (0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-completion-cursor",
                    children: (0, import_jsx_runtime.jsx)(_components.ul, {
                      className: "twoslash-completion-list",
                      children: (0, import_jsx_runtime.jsxs)(_components.li, {
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-completions-icon completions-method",
                          children: (0, import_jsx_runtime.jsxs)(_components.svg, {
                            viewBox: "0 0 32 32",
                            children: [(0, import_jsx_runtime.jsx)(_components.path, {
                              fill: "currentColor",
                              d: "m19.626 29.526l-.516-1.933a12.004 12.004 0 0 0 6.121-19.26l1.538-1.28a14.003 14.003 0 0 1-7.143 22.473"
                            }), (0, import_jsx_runtime.jsx)(_components.path, {
                              fill: "currentColor",
                              d: "M10 29H8v-3.82l.804-.16C10.262 24.727 12 23.62 12 20v-1.382l-4-2v-2.236l4-2V12c0-5.467 3.925-9 10-9h2v3.82l-.804.16C21.738 7.273 20 8.38 20 12v.382l4 2v2.236l-4 2V20c0 5.467-3.925 9-10 9m0-2c4.935 0 8-2.682 8-7v-2.618l3.764-1.882L18 13.618V12c0-4.578 2.385-6.192 4-6.76V5c-4.935 0-8 2.682-8 7v1.618L10.236 15.5L14 17.382V20c0 4.578-2.385 6.192-4 6.76Z"
                            }), (0, import_jsx_runtime.jsx)(_components.path, {
                              fill: "currentColor",
                              d: "M5.231 24.947a14.003 14.003 0 0 1 7.147-22.474l.516 1.932a12.004 12.004 0 0 0-6.125 19.263Z"
                            })]
                          })
                        }), (0, import_jsx_runtime.jsxs)(_components.span, {
                          children: [(0, import_jsx_runtime.jsx)(_components.span, {
                            className: "twoslash-completions-matched",
                            children: "e"
                          }), (0, import_jsx_runtime.jsx)(_components.span, {
                            className: "twoslash-completions-unmatched",
                            children: "rror"
                          })]
                        })]
                      })
                    })
                  })]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line"
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "function"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#82AAFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                className: "twoslash-highlighted",
                children: (0, import_jsx_runtime.jsx)(_components.span, {
                  style: {
                    color: "#6F42C1",
                    "--shiki-dark": "#82AAFF"
                  },
                  children: (0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-hover",
                    children: [(0, import_jsx_runtime.jsx)(_components.span, {
                      className: "twoslash-popup-container",
                      children: (0, import_jsx_runtime.jsxs)(_components.code, {
                        className: "twoslash-popup-code",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#D32F2F",
                            "--shiki-dark": "#C792EA"
                          },
                          children: "function"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#6F42C1",
                            "--shiki-dark": "#82AAFF"
                          },
                          children: " add"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#24292EFF",
                            "--shiki-dark": "#89DDFF"
                          },
                          children: "("
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#24292EFF",
                            fontStyle: "inherit",
                            "--shiki-dark": "#EEFFFF",
                            "--shiki-dark-font-style": "italic"
                          },
                          children: "a"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#D32F2F",
                            "--shiki-dark": "#89DDFF"
                          },
                          children: ":"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#1976D2",
                            "--shiki-dark": "#FFCB6B"
                          },
                          children: " number"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#212121",
                            "--shiki-dark": "#89DDFF"
                          },
                          children: ","
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#24292EFF",
                            fontStyle: "inherit",
                            "--shiki-dark": "#EEFFFF",
                            "--shiki-dark-font-style": "italic"
                          },
                          children: " b"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#D32F2F",
                            "--shiki-dark": "#89DDFF"
                          },
                          children: ":"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#1976D2",
                            "--shiki-dark": "#FFCB6B"
                          },
                          children: " number"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#24292EFF",
                            "--shiki-dark": "#89DDFF"
                          },
                          children: ")"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#D32F2F",
                            "--shiki-dark": "#89DDFF"
                          },
                          children: ":"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          style: {
                            color: "#1976D2",
                            "--shiki-dark": "#FFCB6B"
                          },
                          children: " number"
                        })]
                      })
                    }), "add"]
                  })
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "("
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  fontStyle: "inherit",
                  "--shiki-dark": "#EEFFFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: "a"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " number"
                      })]
                    })
                  }), "a"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#FFCB6B"
                },
                children: " number"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ","
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  fontStyle: "inherit",
                  "--shiki-dark": "#EEFFFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  fontStyle: "inherit",
                  "--shiki-dark": "#EEFFFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: "b"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " number"
                      })]
                    })
                  }), "b"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#FFCB6B"
                },
                children: " number"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ")"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: " {"
              })]
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  fontStyle: "inherit",
                  "--shiki-dark": "#89DDFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: "  return"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: "a"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " number"
                      })]
                    })
                  }), "a"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " +"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: "b"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " number"
                      })]
                    })
                  }), "b"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line",
              children: (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "}"
              })
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsx)(_components.code, {
            children: (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "var"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " Console"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["The ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), " module provides a simple debugging console that is similar to the\nJavaScript console mechanism provided by web browsers."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
                        children: "The module exports two specific components:"
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
                        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "Console"
                          }), " class with methods such as ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.log()"
                          }), ", ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.error()"
                          }), " and ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.warn()"
                          }), " that can be used to write to any Node.js stream."]
                        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " instance configured to write to ", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstdout",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stdout"
                            })
                          }), " and\n", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstderr",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stderr"
                            })
                          }), ". The global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " can be used without importing the ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "node:console"
                          }), " module."]
                        }), "\n"]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.em, {
                          children: (0, import_jsx_runtime.jsx)(_components.strong, {
                            children: "Warning"
                          })
                        }), ": The global console object's methods are neither consistently\nsynchronous like the browser APIs they resemble, nor are they consistently\nasynchronous like all other Node.js streams. See the ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/process.html#a-note-on-process-io",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "note on process I/O"
                          })
                        }), " for\nmore information."]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the global ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), ":"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "console.log('hello world');\n// Prints: hello world, to stdout\nconsole.log('hello %s', 'world');\n// Prints: hello world, to stdout\nconsole.error(new Error('Whoops, something bad happened'));\n// Prints error message and stack trace to stderr:\n//   Error: Whoops, something bad happened\n//     at [eval]:5:15\n//     at Script.runInThisContext (node:vm:132:18)\n//     at Object.runInThisContext (node:vm:309:38)\n//     at node:internal/process/execution:77:19\n//     at [eval]-wrapper:6:22\n//     at evalScript (node:internal/process/execution:76:60)\n//     at node:internal/main/eval_string:23:3\n\nconst name = 'Will Robinson';\nconsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to stderr\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Console"
                        }), " class:"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const out = getStreamSomehow();\nconst err = getStreamSomehow();\nconst myConsole = new console.Console(out, err);\n\nmyConsole.log('hello world');\n// Prints: hello world, to out\nmyConsole.log('hello %s', 'world');\n// Prints: hello world, to out\nmyConsole.error(new Error('Whoops, something bad happened'));\n// Prints: [Error: Whoops, something bad happened], to err\n\nconst name = 'Will Robinson';\nmyConsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to err\n"
                        })
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@see"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "[source](https://github.com/nodejs/node/blob/v18.19.1/lib/console.js)"
                        })]
                      })
                    })]
                  }), "console"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#89DDFF"
                },
                children: "."
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#82AAFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "Console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#82AAFF"
                        },
                        children: "log"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "(message"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "?:"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " any"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ","
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: " ..."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "optionalParams: any[]): "
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "void"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " ("
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "+"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#F78C6C"
                        },
                        children: "1"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " overload)"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Prints to ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "stdout"
                        }), " with newline. Multiple arguments can be passed, with the\nfirst used as the primary message and all additional used as substitution\nvalues similar to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "http://man7.org/linux/man-pages/man3/printf.3.html",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "printf(3)"
                          })
                        }), "\n(the arguments are all passed to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), ")."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const count = 5;\nconsole.log('count: %d', count);\n// Prints: count: 5, to stdout\nconsole.log('count:', count);\n// Prints: count: 5, to stdout\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["See ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), " for more information."]
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@since"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "v0.1.100"
                        })]
                      })
                    })]
                  }), "log"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: "("
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " level"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " string"
                      })]
                    })
                  }), "level"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: ")"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            })
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsx)(_components.span, {
              className: "line",
              children: (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#C2C3C5",
                  fontStyle: "inherit",
                  "--shiki-dark": "#545454",
                  "--shiki-dark-font-style": "italic"
                },
                children: "// @filename: b.ts"
              })
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  fontStyle: "inherit",
                  "--shiki-dark": "#89DDFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: "import"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: " {"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " helloWorld"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " string"
                      })]
                    })
                  }), "helloWorld"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: " }"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  fontStyle: "inherit",
                  "--shiki-dark": "#89DDFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: " from"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: " '"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "./a"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: "'"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line"
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "var"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " Console"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["The ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), " module provides a simple debugging console that is similar to the\nJavaScript console mechanism provided by web browsers."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
                        children: "The module exports two specific components:"
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
                        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "Console"
                          }), " class with methods such as ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.log()"
                          }), ", ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.error()"
                          }), " and ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.warn()"
                          }), " that can be used to write to any Node.js stream."]
                        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " instance configured to write to ", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstdout",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stdout"
                            })
                          }), " and\n", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstderr",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stderr"
                            })
                          }), ". The global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " can be used without importing the ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "node:console"
                          }), " module."]
                        }), "\n"]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.em, {
                          children: (0, import_jsx_runtime.jsx)(_components.strong, {
                            children: "Warning"
                          })
                        }), ": The global console object's methods are neither consistently\nsynchronous like the browser APIs they resemble, nor are they consistently\nasynchronous like all other Node.js streams. See the ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/process.html#a-note-on-process-io",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "note on process I/O"
                          })
                        }), " for\nmore information."]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the global ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), ":"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "console.log('hello world');\n// Prints: hello world, to stdout\nconsole.log('hello %s', 'world');\n// Prints: hello world, to stdout\nconsole.error(new Error('Whoops, something bad happened'));\n// Prints error message and stack trace to stderr:\n//   Error: Whoops, something bad happened\n//     at [eval]:5:15\n//     at Script.runInThisContext (node:vm:132:18)\n//     at Object.runInThisContext (node:vm:309:38)\n//     at node:internal/process/execution:77:19\n//     at [eval]-wrapper:6:22\n//     at evalScript (node:internal/process/execution:76:60)\n//     at node:internal/main/eval_string:23:3\n\nconst name = 'Will Robinson';\nconsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to stderr\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Console"
                        }), " class:"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const out = getStreamSomehow();\nconst err = getStreamSomehow();\nconst myConsole = new console.Console(out, err);\n\nmyConsole.log('hello world');\n// Prints: hello world, to out\nmyConsole.log('hello %s', 'world');\n// Prints: hello world, to out\nmyConsole.error(new Error('Whoops, something bad happened'));\n// Prints: [Error: Whoops, something bad happened], to err\n\nconst name = 'Will Robinson';\nmyConsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to err\n"
                        })
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@see"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "[source](https://github.com/nodejs/node/blob/v18.19.1/lib/console.js)"
                        })]
                      })
                    })]
                  }), "console"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#89DDFF"
                },
                children: "."
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#82AAFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "Console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#82AAFF"
                        },
                        children: "log"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "(message"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "?:"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " any"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ","
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: " ..."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "optionalParams: any[]): "
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "void"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " ("
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "+"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#F78C6C"
                        },
                        children: "1"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " overload)"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Prints to ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "stdout"
                        }), " with newline. Multiple arguments can be passed, with the\nfirst used as the primary message and all additional used as substitution\nvalues similar to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "http://man7.org/linux/man-pages/man3/printf.3.html",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "printf(3)"
                          })
                        }), "\n(the arguments are all passed to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), ")."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const count = 5;\nconsole.log('count: %d', count);\n// Prints: count: 5, to stdout\nconsole.log('count:', count);\n// Prints: count: 5, to stdout\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["See ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), " for more information."]
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@since"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "v0.1.100"
                        })]
                      })
                    })]
                  }), "log"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: "("
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " helloWorld"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " string"
                      })]
                    })
                  }), "helloWorld"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: ")"
              })]
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "var"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " Console"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["The ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), " module provides a simple debugging console that is similar to the\nJavaScript console mechanism provided by web browsers."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
                        children: "The module exports two specific components:"
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
                        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "Console"
                          }), " class with methods such as ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.log()"
                          }), ", ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.error()"
                          }), " and ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.warn()"
                          }), " that can be used to write to any Node.js stream."]
                        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " instance configured to write to ", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstdout",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stdout"
                            })
                          }), " and\n", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstderr",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stderr"
                            })
                          }), ". The global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " can be used without importing the ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "node:console"
                          }), " module."]
                        }), "\n"]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.em, {
                          children: (0, import_jsx_runtime.jsx)(_components.strong, {
                            children: "Warning"
                          })
                        }), ": The global console object's methods are neither consistently\nsynchronous like the browser APIs they resemble, nor are they consistently\nasynchronous like all other Node.js streams. See the ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/process.html#a-note-on-process-io",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "note on process I/O"
                          })
                        }), " for\nmore information."]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the global ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), ":"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "console.log('hello world');\n// Prints: hello world, to stdout\nconsole.log('hello %s', 'world');\n// Prints: hello world, to stdout\nconsole.error(new Error('Whoops, something bad happened'));\n// Prints error message and stack trace to stderr:\n//   Error: Whoops, something bad happened\n//     at [eval]:5:15\n//     at Script.runInThisContext (node:vm:132:18)\n//     at Object.runInThisContext (node:vm:309:38)\n//     at node:internal/process/execution:77:19\n//     at [eval]-wrapper:6:22\n//     at evalScript (node:internal/process/execution:76:60)\n//     at node:internal/main/eval_string:23:3\n\nconst name = 'Will Robinson';\nconsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to stderr\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Console"
                        }), " class:"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const out = getStreamSomehow();\nconst err = getStreamSomehow();\nconst myConsole = new console.Console(out, err);\n\nmyConsole.log('hello world');\n// Prints: hello world, to out\nmyConsole.log('hello %s', 'world');\n// Prints: hello world, to out\nmyConsole.error(new Error('Whoops, something bad happened'));\n// Prints: [Error: Whoops, something bad happened], to err\n\nconst name = 'Will Robinson';\nmyConsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to err\n"
                        })
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@see"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "[source](https://github.com/nodejs/node/blob/v18.19.1/lib/console.js)"
                        })]
                      })
                    })]
                  }), "console"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#89DDFF"
                },
                children: "."
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#82AAFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "Console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#82AAFF"
                        },
                        children: "log"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "(message"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "?:"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " any"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ","
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: " ..."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "optionalParams: any[]): "
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "void"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " ("
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "+"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#F78C6C"
                        },
                        children: "1"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " overload)"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Prints to ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "stdout"
                        }), " with newline. Multiple arguments can be passed, with the\nfirst used as the primary message and all additional used as substitution\nvalues similar to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "http://man7.org/linux/man-pages/man3/printf.3.html",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "printf(3)"
                          })
                        }), "\n(the arguments are all passed to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), ")."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const count = 5;\nconsole.log('count: %d', count);\n// Prints: count: 5, to stdout\nconsole.log('count:', count);\n// Prints: count: 5, to stdout\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["See ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), " for more information."]
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@since"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "v0.1.100"
                        })]
                      })
                    })]
                  }), "log"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: "("
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " level"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " string"
                      })]
                    })
                  }), "level"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: ")"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line"
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "const"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " level"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " string"
                      })]
                    })
                  }), "level"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#FFCB6B"
                },
                children: " string"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ="
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: ' "'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "Danger"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "var"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " Console"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["The ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), " module provides a simple debugging console that is similar to the\nJavaScript console mechanism provided by web browsers."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.p, {
                        children: "The module exports two specific components:"
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.ul, {
                        children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "Console"
                          }), " class with methods such as ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.log()"
                          }), ", ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.error()"
                          }), " and ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console.warn()"
                          }), " that can be used to write to any Node.js stream."]
                        }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                          children: ["A global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " instance configured to write to ", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstdout",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stdout"
                            })
                          }), " and\n", (0, import_jsx_runtime.jsx)(_components.a, {
                            href: "https://nodejs.org/docs/latest-v18.x/api/process.html#processstderr",
                            children: (0, import_jsx_runtime.jsx)(_components.code, {
                              children: "process.stderr"
                            })
                          }), ". The global ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "console"
                          }), " can be used without importing the ", (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "node:console"
                          }), " module."]
                        }), "\n"]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.em, {
                          children: (0, import_jsx_runtime.jsx)(_components.strong, {
                            children: "Warning"
                          })
                        }), ": The global console object's methods are neither consistently\nsynchronous like the browser APIs they resemble, nor are they consistently\nasynchronous like all other Node.js streams. See the ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/process.html#a-note-on-process-io",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "note on process I/O"
                          })
                        }), " for\nmore information."]
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the global ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "console"
                        }), ":"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "console.log('hello world');\n// Prints: hello world, to stdout\nconsole.log('hello %s', 'world');\n// Prints: hello world, to stdout\nconsole.error(new Error('Whoops, something bad happened'));\n// Prints error message and stack trace to stderr:\n//   Error: Whoops, something bad happened\n//     at [eval]:5:15\n//     at Script.runInThisContext (node:vm:132:18)\n//     at Object.runInThisContext (node:vm:309:38)\n//     at node:internal/process/execution:77:19\n//     at [eval]-wrapper:6:22\n//     at evalScript (node:internal/process/execution:76:60)\n//     at node:internal/main/eval_string:23:3\n\nconst name = 'Will Robinson';\nconsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to stderr\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Example using the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Console"
                        }), " class:"]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const out = getStreamSomehow();\nconst err = getStreamSomehow();\nconst myConsole = new console.Console(out, err);\n\nmyConsole.log('hello world');\n// Prints: hello world, to out\nmyConsole.log('hello %s', 'world');\n// Prints: hello world, to out\nmyConsole.error(new Error('Whoops, something bad happened'));\n// Prints: [Error: Whoops, something bad happened], to err\n\nconst name = 'Will Robinson';\nmyConsole.warn(`Danger ${name}! Danger!`);\n// Prints: Danger Will Robinson! Danger!, to err\n"
                        })
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@see"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "[source](https://github.com/nodejs/node/blob/v18.19.1/lib/console.js)"
                        })]
                      })
                    })]
                  }), "console"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#89DDFF"
                },
                children: "."
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#82AAFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsxs)(_components.span, {
                    className: "twoslash-popup-container",
                    children: [(0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "Console"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#82AAFF"
                        },
                        children: "log"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "(message"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "?:"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " any"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ","
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: " ..."
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: "optionalParams: any[]): "
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "void"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " ("
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: "+"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#F78C6C"
                        },
                        children: "1"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " overload)"
                      })]
                    }), (0, import_jsx_runtime.jsxs)(_components.div, {
                      className: "twoslash-popup-docs",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Prints to ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "stdout"
                        }), " with newline. Multiple arguments can be passed, with the\nfirst used as the primary message and all additional used as substitution\nvalues similar to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "http://man7.org/linux/man-pages/man3/printf.3.html",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "printf(3)"
                          })
                        }), "\n(the arguments are all passed to ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), ")."]
                      }), "\n", (0, import_jsx_runtime.jsx)(_components.pre, {
                        children: (0, import_jsx_runtime.jsx)(_components.code, {
                          className: "language-js",
                          children: "const count = 5;\nconsole.log('count: %d', count);\n// Prints: count: 5, to stdout\nconsole.log('count:', count);\n// Prints: count: 5, to stdout\n"
                        })
                      }), "\n", (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["See ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nodejs.org/docs/latest-v18.x/api/util.html#utilformatformat-args",
                          children: (0, import_jsx_runtime.jsx)(_components.code, {
                            children: "util.format()"
                          })
                        }), " for more information."]
                      })]
                    }), (0, import_jsx_runtime.jsx)(_components.div, {
                      className: "twoslash-popup-docs twoslash-popup-docs-tags",
                      children: (0, import_jsx_runtime.jsxs)(_components.span, {
                        className: "twoslash-popup-docs-tag",
                        children: [(0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-name",
                          children: "@since"
                        }), (0, import_jsx_runtime.jsx)(_components.span, {
                          className: "twoslash-popup-docs-tag-value",
                          children: "v0.1.100"
                        })]
                      })
                    })]
                  }), "log"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: "("
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "This is shown"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: ")"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsx)(_components.span, {
              className: "line",
              children: (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#C2C3C5",
                  fontStyle: "inherit",
                  "--shiki-dark": "#545454",
                  "--shiki-dark-font-style": "italic"
                },
                children: "// This suppose to throw an error,"
              })
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line",
              children: (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#C2C3C5",
                  fontStyle: "inherit",
                  "--shiki-dark": "#545454",
                  "--shiki-dark-font-style": "italic"
                },
                children: "// but it won't because we disabled noImplicitAny."
              })
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "const"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#6F42C1",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: "const"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#6F42C1",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " fn"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: " ("
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          fontStyle: "inherit",
                          "--shiki-dark": "#EEFFFF",
                          "--shiki-dark-font-style": "italic"
                        },
                        children: "a"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " any"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ")"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#D32F2F",
                          "--shiki-dark": "#C792EA"
                        },
                        children: " =>"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#1976D2",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: " any"
                      })]
                    })
                  }), "fn"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ="
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ("
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  fontStyle: "inherit",
                  "--shiki-dark": "#EEFFFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: "a"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " any"
                      })]
                    })
                  }), "a"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ")"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: " =>"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: (0, import_jsx_runtime.jsxs)(_components.span, {
                  className: "twoslash-hover",
                  children: [(0, import_jsx_runtime.jsx)(_components.span, {
                    className: "twoslash-popup-container",
                    children: (0, import_jsx_runtime.jsxs)(_components.code, {
                      className: "twoslash-popup-code",
                      children: [(0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#FFCB6B"
                        },
                        children: "a"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#212121",
                          "--shiki-dark": "#89DDFF"
                        },
                        children: ":"
                      }), (0, import_jsx_runtime.jsx)(_components.span, {
                        style: {
                          color: "#24292EFF",
                          "--shiki-dark": "#EEFFFF"
                        },
                        children: " any"
                      })]
                    })
                  }), "a"]
                })
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " "
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: "+"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#F78C6C"
                },
                children: " 1"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "const"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " level"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ="
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: ' "'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "Danger"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  fontStyle: "inherit",
                  "--shiki-dark": "#89DDFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: "export"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: " {};"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line"
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsxs)(_components.code, {
            children: [(0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  fontStyle: "inherit",
                  "--shiki-dark": "#89DDFF",
                  "--shiki-dark-font-style": "italic"
                },
                children: "export"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: " declare"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: " const"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#EEFFFF"
                },
                children: " hello"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: " ="
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: ' "'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "world"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: ";"
              })]
            }), "\n", (0, import_jsx_runtime.jsx)(_components.span, {
              className: "line"
            })]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {
        children: (0, import_jsx_runtime.jsx)(_components.pre, {
          className: "shiki shiki-themes min-light material-theme-darker twoslash lsp",
          style: {
            backgroundColor: "#ffffff",
            "--shiki-dark-bg": "#212121",
            color: "#24292eff",
            "--shiki-dark": "#EEFFFF"
          },
          tabIndex: "0",
          children: (0, import_jsx_runtime.jsx)(_components.code, {
            children: (0, import_jsx_runtime.jsxs)(_components.span, {
              className: "line",
              children: [(0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "{"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "version"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#1976D2",
                  "--shiki-dark": "#F78C6C"
                },
                children: "3"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ","
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "file"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "index.d.ts"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ","
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "sourceRoot"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '""'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ","
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "sources"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "["
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "index.ts"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "]"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ","
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "names"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "[]"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ","
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#C792EA"
                },
                children: "mappings"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#D32F2F",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#212121",
                  "--shiki-dark": "#89DDFF"
                },
                children: ":"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#C3E88D"
                },
                children: "AAAA,eAAO,MAAM,KAAK,EAAE,MAAgB,CAAC"
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#22863A",
                  "--shiki-dark": "#89DDFF"
                },
                children: '"'
              }), (0, import_jsx_runtime.jsx)(_components.span, {
                style: {
                  color: "#24292EFF",
                  "--shiki-dark": "#89DDFF"
                },
                children: "}"
              })]
            })
          })
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
  return __toCommonJS(mdx_bundler_entry_point__random_uuid__exports);
})();
;return Component;