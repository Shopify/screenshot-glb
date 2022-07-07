interface Args {
  port: string | number;
  fileName: string;
}

export function getLocalUrl({port, fileName}: Args): string {
  return `http://localhost:${port}/${fileName}`;
}
