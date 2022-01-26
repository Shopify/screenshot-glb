import { parseOutputPathAndFormat } from "./parse-output-path-and-format";

describe("parseOutputPathAndFormat", () => {
  it("handles jpg", () => {
    expect(parseOutputPathAndFormat("image.jpg", "image/jpeg")).toEqual([
      "image.jpg",
      "image/jpeg",
    ]);
  });

  it("handles png", () => {
    expect(parseOutputPathAndFormat("image.png", "image/png")).toEqual([
      "image.png",
      "image/png",
    ]);
  });

  it("handles name with period", () => {
    expect(parseOutputPathAndFormat("image.something", "image/jpeg")).toEqual([
      "image.something.jpg",
      "image/jpeg",
    ]);
  });

  it("handles mismatched image and format", () => {
    expect(parseOutputPathAndFormat("image.jpg", "image/png")).toEqual([
      "image.jpg",
      "image/jpeg",
    ]);

    expect(parseOutputPathAndFormat("image.png", "image/jpeg")).toEqual([
      "image.png",
      "image/png",
    ]);
  });

  it("handles missing extension", () => {
    expect(parseOutputPathAndFormat("image", "image/png")).toEqual([
      "image.png",
      "image/png",
    ]);

    expect(parseOutputPathAndFormat("image", "image/jpeg")).toEqual([
      "image.jpg",
      "image/jpeg",
    ]);
  });

  it("handles when format cannot be determined from the extension or format", () => {
    const path = "image";
    const format = "who-knows";

    expect(() => parseOutputPathAndFormat(path, format)).toThrow(
      new Error(
        `Could not determine image type from path: 'image' or from the format 'who-knows'.\n\nYou can try passing a image_format of 'image/jpeg' or 'image/png'`
      )
    );
  });
});
