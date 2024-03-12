# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 2024-03-07

- Added `headers` to the WebSocket API Reference
- Fixed revalidate-all to include all basepaths (not just the pages) so that redirects are also revalidated.
- Fixed freezing API Playground when an onChange event is triggered by a literal.
- Fixed `content-type` in the cURL code snippets when `multipart/form-data` provided.
- Sort `Deprecated` and `Beta` object properties to the bottom of each object in the API Reference.
- devex: Added CI integration to revalidate all customer docs pages when a new frontend version is deployed.

# 2024-03-06

- New `<Steps />` mdx component based on nextra's https://nextra.site/docs/guide/built-ins/steps.
- Fixed double-outline issue around object properties in the API Reference when they are deep-linked.
- Added new color scheme options, including sidebar, header, and card background colors
- Enabled `excerpt` in frontmatter to render a short description under the title of each markdown page.

# 2024-03-05

- Added a error state when the Websocket connection fails in API Playground.
- Moved the api-playground-enabled config to [vercel edge config](https://vercel.com/buildwithfern/~/stores/edge-config/ecfg_lp1z4ajavumgwe1aimfx02eh3qce/items) so that it can be toggled without a redeploy.

# 2024-03-04

### DevEx improvements

- Enabled PR Previews [#480](https://github.com/fern-api/fern-platform/pull/480)

### Improvements

- Render non-markdown as whitespace-pre-wrap to preserve single new-lines and spaces.
- Improve SEO by adding the main title as a suffix to the page title i.e. `Page Title — Fern Docs`.
- Overflowing tabs in `<CodeBlocks/>` now use horizontal scrolling, with a hover-over bounce effect to indicate that the code is scrollable.

### Bug fixes

- Fixed issue with jsonparse throwing an error when a json property key contains special characters.
- Fixed revalidate-all issues, now it returns a 200, 207, or 500 status code.
- Fixed issues with JSX sanitization that was causing some HTML components to be removed from the rendered output.
- Reverted server-side syntax highlighting to client-side to reduce response sizes (lambda returns 502 when response is too large).
- Fixed broken API Playground proxy and sizing

# 2024-03-03

- Added `<Tabs/>` and `<Accordion/>` MDX components based on mintlify's [tabs](https://mintlify.com/docs/content/components/tabs) and [accordion](https://mintlify.com/docs/content/components/accordions).
- Safely remove JSX from markdown descriptions that are not supported by our frontend.
- Added outline to object properties in the API Reference when they are deep-linked
- Fixed routing issues where nonstandard characters in the URL would cause the page to 404. (encodeUri)
- Added integration with Axiom for logging and error tracking.
- Bumped /api/revalidate-all timeout to 300 seconds.
- cosmetic: Fixed version dropdown styling bug (where the dropdown was sticking to the logo)
- Fixed broken sitemap.xml and robots.txt which was preventing SEO indexing.
- Moved some API endpoints to Vercel Edge Functions to reduce latency and improve performance (including our home-rolled Fontawesome CDN)

# 2024-03-02

- Enable staging environment (xxx.docs.staging.buildwithfern.com) for testing the `main` branch on all customer sites.
- Improved how the ToC responds to user-scrolling by using a simple querySelector to find the active heading, rather than using useIntersectionObserver. This should make the ToC more responsive and less jumpy.
- Add error-boundary when MDX rendering fails.
- Prevent 500 errors: error boundary doesn't work on server-side rendering, so we need to introduce a /static and /dynamic version of the same page so that when errors are caught on the server-side, the user is redirected to the client-side version of the page.

# 2024-03-01

- Fully removed react-markdown in favor of using next-mdx-remote to serialize all description fields. This allows us to use the same components that we already we use in markdown guides in the API reference. Also, this reduces the bundle size and improves client-side performance since all markdown-based descriptions are now compiled server-side. See [#468](https://github.com/fern-api/fern-platform/pull/468).

# 2024-02-29

- API Playground now supports WebSocket. See [#470](https://github.com/fern-api/fern-platform/pull/470)

# 2024-02-28

- Fixed [scrolling issue in mobile](https://github.com/fern-api/fern-platform/commit/a0dbc6195c3de6c2145dce32baf1826bb6b99c25).
- Fixed random navigation regressions due to major shiki-related refactor.

# 2024-02-27

- Resolved issues with shiki syntax highlighter causing the page to crash on some code samples because the server-generated HAST was too large. Switching to client-side rendering for code samples to avoid this issue.
- Resolved issues with scrolling navigation issues due to updated code sample rendering. There's still an outstanding bug with scrolling on mobile, which is currently jumpy and still being investigated.
- Added Changelog Page under API sections. See [#469](https://github.com/fern-api/fern-platform/pull/469)

# 2024-02-26

- Replaced `react-syntax-highlighter` with [`shiki`](https://shiki.style/) for better performance syntax highlighting. See [#463](https://github.com/fern-api/fern-platform/pull/463) for more details.

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
