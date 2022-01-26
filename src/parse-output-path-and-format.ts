const mime = require("mime-types");
const path = require("path");

export function parseOutputPathAndFormat(output: string, format: string) {
  const extension = path.extname(output);
  const extensionMimeType = mime.lookup(extension);

  if (extensionMimeType) {
    return [output, extensionMimeType];
  }

  const formatExtension = mime.extension(format);

  if (!formatExtension) {
    throw new Error(
      `Could not determine image type from path: '${output}' or from the format '${format}'.\n\nYou can try passing a image_format of 'image/jpeg' or 'image/png'`
    );
  }

  const friendlyExtensionOutput =
    formatExtension === "jpeg" ? "jpg" : formatExtension;

  return [`${output}.${friendlyExtensionOutput}`, format];
}
