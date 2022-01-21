/**
 * @jest-environment jsdom
 */

import { htmlTemplate } from "./html-template";

describe("htmlTemplate", () => {
  const defaultOptions = {
    width: 3051,
    height: 768,
    inputPath: "http://localhost:8081/some_model.glb",
    backgroundColor: "#CAFE00",
    libPort: 8080,
    devicePixelRatio: 1.0,
  };

  describe("style", () => {
    it("should render", () => {
      const { width, height } = defaultOptions;
      document.documentElement.innerHTML = htmlTemplate(defaultOptions);

      expect(document.styleSheets).toHaveLength(1);
      expect(document.styleSheets[0].cssRules).toHaveLength(2);
      expect(document.styleSheets[0].cssRules[0].cssText).toEqual(
        "body {margin: 0;}"
      );
      expect(document.styleSheets[0].cssRules[1].cssText).toEqual(
        `model-viewer {--progress-bar-color: transparent; width: ${width}px; height: ${height}px;}`
      );
    });

    it("should handle width and height", () => {
      const width = 8080;
      const height = 8888;
      document.documentElement.innerHTML = htmlTemplate({
        ...defaultOptions,
        width,
        height,
      });

      expect(document.styleSheets[0].cssRules[1].cssText).toEqual(
        `model-viewer {--progress-bar-color: transparent; width: ${width}px; height: ${height}px;}`
      );
    });
  });

  describe("meta", () => {
    it("should render", () => {
      document.documentElement.innerHTML = htmlTemplate(defaultOptions);

      const metaTags = document.querySelectorAll("meta");

      expect(metaTags).toHaveLength(1);
      expect(metaTags[0].getAttribute("name")).toBe("viewport");
      expect(metaTags[0].getAttribute("content")).toBe(
        `width=device-width, initial-scale=${devicePixelRatio}`
      );
    });

    it("should handle devicePixelRatio", () => {
      const devicePixelRatio = 0.123;

      document.documentElement.innerHTML = htmlTemplate({
        ...defaultOptions,
        devicePixelRatio,
      });

      const metaTag = document.querySelector("meta");

      expect(metaTag.getAttribute("content")).toBe(
        "width=device-width, initial-scale=0.123"
      );
    });
  });

  describe("script", () => {
    it("should render", () => {
      const { libPort } = defaultOptions;

      document.documentElement.innerHTML = htmlTemplate(defaultOptions);

      const scriptTags = document.querySelectorAll("script");

      expect(scriptTags).toHaveLength(1);
      expect(scriptTags[0].getAttribute("type")).toBe("module");
      expect(scriptTags[0].getAttribute("src")).toBe(
        `http://localhost:${libPort}/model-viewer.js`
      );
    });

    it("should handle port", () => {
      const libPort = 8008;
      document.documentElement.innerHTML = htmlTemplate({
        ...defaultOptions,
        libPort,
      });

      const script = document.querySelector("script");

      expect(script.getAttribute("src")).toBe(
        `http://localhost:${libPort}/model-viewer.js`
      );
    });
  });

  describe("model-viewer", () => {
    it("should render", () => {
      const { inputPath, backgroundColor } = defaultOptions;

      document.documentElement.innerHTML = htmlTemplate(defaultOptions);

      const modelViewers = document.querySelectorAll("model-viewer");
      expect(modelViewers).toHaveLength(1);

      const modelViewer = modelViewers[0];
      expect(modelViewer).toBeTruthy();

      expect(modelViewer.getAttribute("id")).toEqual("snapshot-viewer");
      expect(modelViewer.getAttribute("interaction-prompt")).toEqual("none");
      expect(modelViewer.getAttribute("src")).toEqual(inputPath);
      expect(modelViewer.getAttribute("style")).toEqual(
        `background-color: ${backgroundColor};`
      );
    });

    it("should handle inputPath", () => {
      const inputPath = "new.glb";
      document.documentElement.innerHTML = htmlTemplate({
        ...defaultOptions,
        inputPath,
      });

      const modelViewer = document.querySelector("model-viewer");

      expect(modelViewer.getAttribute("src")).toEqual(inputPath);
    });

    it("should handle backgroundColor", () => {
      const backgroundColor = "#FACE00";
      document.documentElement.innerHTML = htmlTemplate({
        ...defaultOptions,
        backgroundColor,
      });

      const modelViewer = document.querySelector("model-viewer");

      expect(modelViewer.getAttribute("style")).toEqual(
        `background-color: ${backgroundColor};`
      );
    });

    it("should pass custom attributes", () => {
      const modelViewerArgs = {
        "environment-image": "https://some-url.hdr",
        exposure: "3",
      };

      document.documentElement.innerHTML = htmlTemplate({
        ...defaultOptions,
        modelViewerArgs,
      });

      const modelViewer = document.querySelector("model-viewer");

      Object.entries(modelViewerArgs).forEach(([attribute, value]) => {
        expect(modelViewer.getAttribute(attribute)).toBe(value);
      });
    });

    it("cannot overwrite src", () => {
      const modelViewerArgs = {
        src: "new-source.glb",
      };

      expect(() =>
        htmlTemplate({
          ...defaultOptions,
          modelViewerArgs,
        })
      ).toThrow(
        new Error("`src` cannot be ovewritten pass the source via -i instead")
      );
    });

    it("cannot overwrite id", () => {
      const modelViewerArgs = {
        id: "an-id",
      };

      expect(() =>
        htmlTemplate({
          ...defaultOptions,
          modelViewerArgs,
        })
      ).toThrow(
        new Error(
          "`id` cannot be passed since it would cause the renderer to break"
        )
      );
    });

    it("cannot overwrite interaction-prompt", () => {
      const modelViewerArgs = {
        "interaction-prompt": "when-focused",
      };

      expect(() =>
        htmlTemplate({
          ...defaultOptions,
          modelViewerArgs,
        })
      ).toThrow(
        new Error(
          "`interaction-prompt` cannot be passed since it would cause unexpected renders"
        )
      );
    });

    it("cannot overwrite style", () => {
      const modelViewerArgs = {
        style: "color: #FF00FF",
      };

      expect(() =>
        htmlTemplate({
          ...defaultOptions,
          modelViewerArgs,
        })
      ).toThrow(
        new Error(
          "`style` cannot be passed since it would cause unexpected renders"
        )
      );
    });
  });
});
