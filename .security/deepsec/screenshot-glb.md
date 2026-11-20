# screenshot-glb

## What this codebase does

This Node.js/TypeScript CLI renders a local GLB model into an image.
It stages inputs in an OS temporary directory, starts an HTTP file server,
builds a model-viewer HTML page, and captures it with Puppeteer/Chromium.
`src/cli.ts` wires the file handler, server, options, renderer, and cleanup.
Model-viewer JavaScript comes from Shopify's CDN or a caller-supplied file.
The CLI also accepts output paths, attributes, dimensions, and timeouts.
The repository does not implement a hosted upload service.

## Auth shape

- The CLI has no application login or per-user authorization checks.
  The invoking process controls arguments and filesystem permissions.
- `FileServer` serves files without authentication and sends wildcard
  CORS headers. `server.listen(0)` does not explicitly bind loopback.
- `getLocalUrl` builds localhost URLs; that does not prove the server
  listens only locally or keeps requests within its mount directory.
- `getModelViewerUrl` chooses a fixed Shopify CDN path or a
  major/minor version path. `model_viewer_path` stages local JavaScript.
- Chromium starts with `--no-sandbox` and `--disable-setuid-sandbox`.
  External isolation and host/network permissions require caller evidence.

## Threat model

Lower-trust models or options can reach browser execution, host networking,
temporary file serving, and image output on the invoking machine.
Investigate script/HTML injection, unintended file reads or writes,
network access to sensitive destinations, and resource exhaustion.
The boundary is especially relevant if a service wraps this CLI with
merchant-controlled inputs; identify such a caller before assuming one.
Treat executable JavaScript, browser permissions, and process isolation
as separate trust decisions.

## Project-specific patterns to flag

- `prepareAppOptions` turns `model_viewer_attributes` into an object
  through `URLSearchParams`; `htmlTemplate` interpolates attribute
  names and values into HTML. Trace quotes, event attributes, URL-valued
  attributes, background color, and other option-controlled HTML/CSS.
- `validateCustomAttributes` blocks overrides of several defaults.
  It is not a general HTML escaping or attribute allowlist primitive.
- `FileServer` joins `request.url` to the mount directory before
  `fs.readFile`. Review path normalization, containment, reachable
  interfaces, and wildcard CORS together; do not assume containment.
- `FileHandler.addFile` copies a resolved caller path using its basename
  into a shared per-run temp directory. Review sensitive input selection,
  basename collisions, file replacement, and cleanup on error paths.
- `parseOutputPathAndFormat` derives a filename and image type.
  `captureScreenshot` passes the resulting path to `page.screenshot`.
  Trace whether a lower-trust caller can choose a sensitive write target.
- `checkFileExistsAtUrl` selects HTTP/HTTPS GET from a supplied URL
  and has no timeout here. Trace its actual CDN/local inputs, response
  handling, and connection lifecycle before claiming arbitrary SSRF.
- `page.setContent` loads interpolated HTML with networking enabled.
  Review model-viewer JavaScript provenance and any external model assets.
- Dimensions, timeouts, and model complexity can affect memory and CPU.
  Check validation and cleanup; the render timeout does not automatically
  bound earlier URL checks, page loads, or every browser operation.
- Browser console values and errors are forwarded to the host console.
  Trace exposure if page-controlled material contains sensitive data.

## Known false-positives

- A caller-selected local model-viewer build is intentionally executable.
  A finding needs a lower-trust caller or an unintended trust transition.
- `page.evaluate` uses a fixed callback; its presence alone is not
  execution of an attacker-provided JavaScript string.
- The default model-viewer URL is on a fixed Shopify CDN host. Version
  parsing is not itself an arbitrary-host URL construction primitive.
- `src/__mocks__/**` is excluded from candidate selection. Mock file
  and network implementations do not establish production behavior.
- Local CLI input/output paths are intended features. Show unauthorized
  caller influence or exposure before reporting arbitrary file access.
- Sandbox-disabling flags are deliberate but remain a review boundary.
  Do not assume that a container, restricted network, or safe wrapper exists.
