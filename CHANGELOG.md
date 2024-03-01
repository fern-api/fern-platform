# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 2024-03-01

- Fully removed react-markdown in favor of using next-mdx-remote to serialize all description fields. This allows us to use the same components that we already we use in markdown guides in the API reference. Also, this reduces the bundle size and improves client-side performance since all markdown-based descriptions are now compiled server-side. See [#468](https://github.com/fern-api/fern-ui/pull/468).

# 2024-02-29

- API Playground now supports WebSocket. See [#470](https://github.com/fern-api/fern-ui/pull/470)

# 2024-02-28

- Fixed [scrolling issue in mobile](https://github.com/fern-api/fern-ui/commit/a0dbc6195c3de6c2145dce32baf1826bb6b99c25).
- Fixed random navigation regressions due to major shiki-related refactor.

# 2024-02-27

- Resolved issues with shiki syntax highlighter causing the page to crash on some code samples because the server-generated HAST was too large. Switching to client-side rendering for code samples to avoid this issue.
- Resolved issues with scrolling navigation issues due to updated code sample rendering. There's still an outstanding bug with scrolling on mobile, which is currently jumpy and still being investigated.
- Added Changelog Page under API sections. See [#469](https://github.com/fern-api/fern-ui/pull/469)

# 2024-02-26

- Replaced `react-syntax-highlighter` with [`shiki`](https://shiki.style/) for better performance syntax highlighting. See [#463](https://github.com/fern-api/fern-ui/pull/463) for more details.

# 2024-02-23

- Replaced FernMenu with FernDropdown for better accessibility and cleaner/consistent visual style. This affects the version dropdown and code sample dropdown.
- Hide Python Async example (for now) until we can provide a better selection state.
- When a language selection is changed, maintain the same visual scroll position by measuring the scroll position before and after the change.
- Added Go SDK to the code snippet language selection.
- Replaced the custom implementation of code snippets rendering for JSON and cURL with default syntax highlighter to improve performance and reduce complexity.
- Icon is now available as a markdown component. Usage (color and size are optional):

```markdown
<Icon icon="check" color="green" size={4} />
```

# 2024-02-22

Init changelog! 🙌

- Added line numbers to code samples.
- Added Content-Type toggle to endpoint that supports both application/json and multipart/form-data.
