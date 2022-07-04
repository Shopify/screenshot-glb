import https from 'https';

export function checkFileExistsAtUrl(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const urlParts = new URL(url);
    const {hostname, pathname: path} = urlParts;

    const request = https.get(url);

    request.on('response', ({statusCode}) => {
      resolve(statusCode === 200);
    });

    request.on('error', reject);
  });
}
