const mime = require("mime-types");
const path = require("path");

const appendExtension = function (output, format) {
  const extension = mime.extension(format);
  return `${output}.${extension}`;
};

const validExtension = function (extension, format) {
  const mimeType = mime.lookup(extension);
  if (mimeType !== format) {
    throw new Error(
      `Output filetype is not valid provided format. Output file extension (${extension}) should have mimeType: ${mimeType}`
    );
  }
  return true;
};

export function scrubOutput(output, imageFormat) {
  const format = imageFormat || mime.lookup(output) || "image/png";
  const extension = path.extname(output);
  if (extension && validExtension(extension, format)) return [output, format];
  return [appendExtension(output, format), format];
}
