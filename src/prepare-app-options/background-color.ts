import {colors} from '../colors';

export function backgroundColors(format: string, backgroundColor?: string) {
  if (backgroundColor) {
    const regex =
      /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})|(rgb(a?)\(\s*(\d+%?\s*,\s*){2}\d+%?\s*(,\s*\d*\.?\d+%?\s*)?\))|(hsl(a?)\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*\d*\.?\d+%?\s*)?\))/g;
    const colors = [];

    let matches = null;

    do {
      matches = regex.exec(backgroundColor);

      if (matches) {
        colors.push(matches[0]);
      }
    } while (matches);

    return colors;
  }

  const defaultBackgroundColor =
    format === 'image/jpeg' ? colors.white : colors.transparent;

  return [defaultBackgroundColor];
}
