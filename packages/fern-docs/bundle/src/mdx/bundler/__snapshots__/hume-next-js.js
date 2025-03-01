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
    "title": "EVI Next.js Quickstart",
    "excerpt": "A quickstart guide for implementing the Empathic Voice Interface (EVI) with Next.js."
  };
  function _createMdxContent(props) {
    const _components = {
      a: "a",
      code: "code",
      li: "li",
      ol: "ol",
      p: "p",
      strong: "strong",
      ...useMDXComponents(),
      ...props.components
    }, { Callout, CodeBlock, ErrorBoundary, Step, StepGroup, Tab, TabGroup } = _components;
    if (!Callout) _missingMdxReference("Callout", true);
    if (!CodeBlock) _missingMdxReference("CodeBlock", true);
    if (!ErrorBoundary) _missingMdxReference("ErrorBoundary", true);
    if (!Step) _missingMdxReference("Step", true);
    if (!StepGroup) _missingMdxReference("StepGroup", true);
    if (!Tab) _missingMdxReference("Tab", true);
    if (!TabGroup) _missingMdxReference("TabGroup", true);
    return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
        children: ["This guide provides instructions for integrating EVI into your Next.js projects with Hume\u2019s ", (0, import_jsx_runtime.jsx)(_components.a, {
          href: "https://www.npmjs.com/package/@humeai/voice-react",
          children: "React SDK"
        }), "\nand includes detailed steps for using EVI with Next.js App Router and Pages Router."]
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsx)(Callout, {
          intent: "info",
          children: (0, import_jsx_runtime.jsxs)(_components.p, {
            children: ["Kickstart your project with our pre-configured ", (0, import_jsx_runtime.jsx)(_components.a, {
              href: "https://vercel.com/templates/next.js/empathic-voice-interface-starter",
              children: "Vercel template for the\nEmpathic Voice\nInterface"
            }), ".\nInstall with one click to instantly set up a ready-to-use project and start\nbuilding with TypeScript right away!"]
          })
        })
      }), "\n", (0, import_jsx_runtime.jsx)(ErrorBoundary, {
        children: (0, import_jsx_runtime.jsxs)(TabGroup, {
          children: [(0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsxs)(Tab, {
              title: "Next.js (App Router)",
              id: "nextjs-app-router",
              children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                children: ["This tutorial utilizes Hume\u2019s React SDK to interact with EVI. It includes detailed steps for both the\n", (0, import_jsx_runtime.jsx)(_components.strong, {
                  children: "App Router"
                }), " in Next.js and is broken down into four key components:"]
              }), (0, import_jsx_runtime.jsxs)(_components.ol, {
                children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "Authentication"
                  }), ": Generate and use an access token to authenticate with EVI."]
                }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "Setting up context provider"
                  }), ": Set up the ", (0, import_jsx_runtime.jsx)(_components.code, {
                    children: "<VoiceProvider/>"
                  }), "."]
                }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "Starting a chat and display messages"
                  }), ": Implement the functionality to start a chat with EVI and display messages."]
                }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "That\u2019s it!"
                  }), ": Audio playback and interruptions are handled for you."]
                }), "\n"]
              }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                children: (0, import_jsx_runtime.jsx)(Callout, {
                  intent: "info",
                  children: (0, import_jsx_runtime.jsxs)(_components.p, {
                    children: ["The Hume React SDK abstracts much of the logic for managing the WebSocket connection, as\nwell as capturing and preparing audio for processing. For a closer look at how the React\npackage manages these aspects of the integration, we invite you to explore the source code\nhere: ", (0, import_jsx_runtime.jsx)(_components.a, {
                      href: "https://github.com/HumeAI/empathic-voice-api-js/tree/main/packages/react",
                      children: "@humeai/voice-react"
                    })]
                  })
                })
              }), (0, import_jsx_runtime.jsxs)(_components.p, {
                children: ["To see this code fully implemented within a frontend web application using the App Router from Next.js, visit this GitHub repository:\n", (0, import_jsx_runtime.jsx)(_components.a, {
                  href: "https://github.com/HumeAI/hume-api-examples/tree/main/evi-next-js-app-router",
                  children: "evi-nextjs-app-router"
                }), "."]
              }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                children: (0, import_jsx_runtime.jsxs)(StepGroup, {
                  children: [(0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsx)(Step, {
                      title: "Prerequisites",
                      id: "prerequisites",
                      children: (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Before you begin, you will need to have ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nextjs.org/docs/getting-started/installation",
                          children: "an existing Next.js project set up using the App Router"
                        }), "."]
                      })
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Authenticate",
                      id: "authenticate",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["In order to make an authenticated connection we will first need to generate an access token. Doing so will\nrequire your API key and Secret key. These keys can be obtained by logging into the portal and visiting the\n", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://platform.hume.ai/settings/keys",
                          children: "API keys page"
                        }), "."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(Callout, {
                          intent: "info",
                          children: (0, import_jsx_runtime.jsx)(_components.p, {
                            children: "In the sample code below, the API key and Secret key have been saved to\nenvironment variables. Avoid hardcoding these values in your project to\nprevent them from being leaked."
                          })
                        })
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "React",
                          code: '// ./app/page.tsx\nimport ClientComponent from "@/components/ClientComponent";\nimport { fetchAccessToken } from "hume";\n\nexport default async function Page() {\n  const accessToken = await fetchAccessToken({\n    apiKey: String(process.env.HUME_API_KEY),\n    secretKey: String(process.env.HUME_SECRET_KEY),\n  });\n\n  if (!accessToken) {\n    throw new Error();\n  }\n\n  return <ClientComponent accessToken={accessToken} />;\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Setup Context Provider",
                      id: "setup-context-provider",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["After fetching our access token we can pass it to our ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "ClientComponent"
                        }), ". First we set up the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "<VoiceProvider/>"
                        }), " so that our ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Messages"
                        }), " and ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Controls"
                        }), " components can access the context. We also pass the access token to the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "auth"
                        }), " prop of the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "<VoiceProvider/>"
                        }), " for setting up the WebSocket connection."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "TypeScript",
                          code: '// ./components/ClientComponent.tsx\n"use client";\nimport { VoiceProvider } from "@humeai/voice-react";\nimport Messages from "./Messages";\nimport Controls from "./Controls";\n\nexport default function ClientComponent({\n  accessToken,\n}: {\n  accessToken: string;\n}) {\n  return (\n    <VoiceProvider auth={{ type: "accessToken", value: accessToken }}>\n      <Messages />\n      <Controls />\n    </VoiceProvider>\n  );\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsx)(Step, {
                      title: "Audio input",
                      id: "audio-input",
                      children: (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.code, {
                          children: "<VoiceProvider/>"
                        }), " will handle the microphone and playback logic."]
                      })
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Starting session",
                      id: "starting-session",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["In order to start a session, you can use the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "connect"
                        }), " function. It is important that this event is attached to a user interaction event (like a click) so that the browser is capable of playing Audio."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "TypeScript",
                          code: '// ./components/Controls.tsx\n"use client";\nimport { useVoice, VoiceReadyState } from "@humeai/voice-react";\nexport default function Controls() {\n  const { connect, disconnect, readyState } = useVoice();\n\n  if (readyState === VoiceReadyState.OPEN) {\n    return (\n      <button\n        onClick={() => {\n          disconnect();\n        }}\n      >\n        End Session\n      </button>\n    );\n  }\n\n  return (\n    <button\n      onClick={() => {\n        connect()\n          .then(() => {\n            /* handle success */\n          })\n          .catch(() => {\n            /* handle error */\n          });\n      }}\n    >\n      Start Session\n    </button>\n  );\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Displaying message history",
                      id: "displaying-message-history",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["To display the message history, we can use the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "useVoice"
                        }), " hook to access the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "messages"
                        }), " array. We can then map over the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "messages"
                        }), " array to display the role (", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Assistant"
                        }), " or ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "User"
                        }), ") and content of each message."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "TypeScript",
                          code: '// ./components/Messages.tsx\n"use client";\nimport { useVoice } from "@humeai/voice-react";\n\nexport default function Messages() {\n  const { messages } = useVoice();\n\n  return (\n    <div>\n      {messages.map((msg, index) => {\n        if (msg.type === "user_message" || msg.type === "assistant_message") {\n          return (\n            <div key={msg.type + index}>\n              <div>{msg.message.role}</div>\n              <div>{msg.message.content}</div>\n            </div>\n          );\n        }\n\n        return null;\n      })}\n    </div>\n  );\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsx)(Step, {
                      title: "Interrupt",
                      id: "interrupt",
                      children: (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["This ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://github.com/HumeAI/hume-api-examples/tree/main/evi-next-js-app-router",
                          children: "Next.js example"
                        }), " will handle interruption events automatically!"]
                      })
                    })
                  })]
                })
              })]
            })
          }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
            children: (0, import_jsx_runtime.jsxs)(Tab, {
              title: "Next.js (Pages Router)",
              id: "nextjs-pages-router",
              children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                children: ["This tutorial utilizes Hume\u2019s React SDK to interact with EVI. It includes detailed steps for both the\n", (0, import_jsx_runtime.jsx)(_components.strong, {
                  children: "Pages Router"
                }), " in Next.js and is broken down into four key components:"]
              }), (0, import_jsx_runtime.jsxs)(_components.ol, {
                children: ["\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "Authentication"
                  }), ": Generate and use an access token to authenticate with EVI."]
                }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "Setting up context provider"
                  }), ": Set up the ", (0, import_jsx_runtime.jsx)(_components.code, {
                    children: "<VoiceProvider/>"
                  }), "."]
                }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "Starting a chat and display messages"
                  }), ": Implement the functionality to start a chat with EVI and display messages."]
                }), "\n", (0, import_jsx_runtime.jsxs)(_components.li, {
                  children: [(0, import_jsx_runtime.jsx)(_components.strong, {
                    children: "That\u2019s it!"
                  }), ": Audio playback and interruptions are handled for you."]
                }), "\n"]
              }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                children: (0, import_jsx_runtime.jsx)(Callout, {
                  intent: "info",
                  children: (0, import_jsx_runtime.jsxs)(_components.p, {
                    children: ["The Hume React SDK abstracts much of the logic for managing the WebSocket connection, as\nwell as capturing and preparing audio for processing. For a closer look at how the React\npackage manages these aspects of the integration, we invite you to explore the source code\nhere: ", (0, import_jsx_runtime.jsx)(_components.a, {
                      href: "https://github.com/HumeAI/empathic-voice-api-js/tree/main/packages/react",
                      children: "@humeai/voice-react"
                    })]
                  })
                })
              }), (0, import_jsx_runtime.jsxs)(_components.p, {
                children: ["To see this code fully implemented within a frontend web application using the Pages Router from Next.js, visit this GitHub repository: ", (0, import_jsx_runtime.jsx)(_components.a, {
                  href: "https://github.com/HumeAI/hume-api-examples/tree/main/evi-next-js-pages-router",
                  children: "evi-nextjs-pages-router"
                }), "."]
              }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                children: (0, import_jsx_runtime.jsxs)(StepGroup, {
                  children: [(0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsx)(Step, {
                      title: "Prerequisites",
                      id: "prerequisites-1",
                      children: (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["Before you begin, you will need to have ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://nextjs.org/docs/getting-started/installation",
                          children: "an existing Next.js project set up using the Pages Router"
                        }), "."]
                      })
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Authenticate and Setup Context Provider",
                      id: "authenticate-and-setup-context-provider",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["In order to make an authenticated connection we will first need to generate an access token. Doing so will\nrequire your API key and Secret key. These keys can be obtained by logging into the portal and visiting the\n", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://platform.hume.ai/settings/keys",
                          children: "API keys page"
                        }), "."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(Callout, {
                          intent: "info",
                          children: (0, import_jsx_runtime.jsx)(_components.p, {
                            children: "In the sample code below, the API key and Secret key have been saved to\nenvironment variables. Avoid hardcoding these values in your project to\nprevent them from being leaked."
                          })
                        })
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "React",
                          code: '// ./pages/index.tsx\nimport Controls from "@/components/Controls";\nimport Messages from "@/components/Messages";\nimport { fetchAccessToken } from "hume";\nimport { VoiceProvider } from "@humeai/voice-react";\nimport { InferGetServerSidePropsType } from "next";\n\nexport const getServerSideProps = async () => {\n  const accessToken = await fetchAccessToken({\n    apiKey: String(process.env.HUME_API_KEY),\n    secretKey: String(process.env.HUME_SECRET_KEY),\n  });\n\n  if (!accessToken) {\n    return {\n      redirect: {\n        destination: "/error",\n        permanent: false,\n      },\n    };\n  }\n\n  return {\n    props: {\n      accessToken,\n    },\n  };\n};\n\ntype PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;\n\nexport default function Page({ accessToken }: PageProps) {\n  return (\n    <VoiceProvider auth={{ type: "accessToken", value: accessToken }}>\n      <Messages />\n      <Controls />\n    </VoiceProvider>\n  );\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Audio input",
                      id: "audio-input-1",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: [(0, import_jsx_runtime.jsx)(_components.code, {
                          children: "<VoiceProvider/>"
                        }), " is designed to manage microphone inputs and audio playback. It abstracts the complexities of audio processing to allow developers to focus on developing interactive voice-driven functionalities."]
                      }), (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["For a closer look at how ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "<VoiceProvider/>"
                        }), " processes audio inputs and controls playback, you can view the source code ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://github.com/HumeAI/empathic-voice-api-js/blob/main/packages/react/src/lib/VoiceProvider.tsx",
                          children: "here"
                        }), "."]
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Starting session",
                      id: "starting-session-1",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["In order to start a session, you can use the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "connect"
                        }), " function. It is important that this event is attached to a user interaction event (like a click) so that the browser is capable of playing Audio."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "TypeScript",
                          code: '// ./components/Controls.tsx\nimport { useVoice, VoiceReadyState } from "@humeai/voice-react";\nexport default function Controls() {\n  const { connect, disconnect, readyState } = useVoice();\n\n  if (readyState === VoiceReadyState.OPEN) {\n    return (\n      <button\n        onClick={() => {\n          disconnect();\n        }}\n      >\n        End Session\n      </button>\n    );\n  }\n\n  return (\n    <button\n      onClick={() => {\n        connect()\n          .then(() => {\n            /* handle success */\n          })\n          .catch(() => {\n            /* handle error */\n          });\n      }}\n    >\n      Start Session\n    </button>\n  );\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsxs)(Step, {
                      title: "Displaying message history",
                      id: "displaying-message-history-1",
                      children: [(0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["To display the message history, we can use the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "useVoice"
                        }), " hook to access the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "messages"
                        }), " array. We can then map over the ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "messages"
                        }), " array to display the role (", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "Assistant"
                        }), " or ", (0, import_jsx_runtime.jsx)(_components.code, {
                          children: "User"
                        }), ") and content of each message."]
                      }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                        children: (0, import_jsx_runtime.jsx)(CodeBlock, {
                          title: "TypeScript",
                          code: '// ./components/Messages.tsx\nimport { useVoice } from "@humeai/voice-react";\n\nexport default function Messages() {\n  const { messages } = useVoice();\n\n  return (\n    <div>\n      {messages.map((msg, index) => {\n        if (msg.type === "user_message" || msg.type === "assistant_message") {\n          return (\n            <div key={msg.type + index}>\n              <div>{msg.message.role}</div>\n              <div>{msg.message.content}</div>\n            </div>\n          );\n        }\n\n        return null;\n      })}\n    </div>\n  );\n}\n',
                          language: "tsx",
                          className: "language-tsx"
                        })
                      })]
                    })
                  }), (0, import_jsx_runtime.jsx)(ErrorBoundary, {
                    children: (0, import_jsx_runtime.jsx)(Step, {
                      title: "Interrupt",
                      id: "interrupt-1",
                      children: (0, import_jsx_runtime.jsxs)(_components.p, {
                        children: ["This ", (0, import_jsx_runtime.jsx)(_components.a, {
                          href: "https://github.com/HumeAI/hume-api-examples/tree/main/evi-next-js-app-router",
                          children: "Next.js example"
                        }), " will handle interruption events automatically!"]
                      })
                    })
                  })]
                })
              })]
            })
          })]
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