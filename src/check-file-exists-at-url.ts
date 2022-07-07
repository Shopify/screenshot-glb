import http from 'http';
import https from 'https';

export function checkFileExistsAtUrl(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const urlParts = new URL(url);
    const {protocol} = urlParts;
    let request: http.ClientRequest;

    if (protocol === 'https:') {
      request = https.get(url);
    } else {
      request = http.get(url);
    }

    request.on('response', ({statusCode}) => {
      resolve(statusCode === 200);
    });

    request.on('error', reject);
  });
}
