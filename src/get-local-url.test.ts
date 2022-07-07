import {getLocalUrl} from './get-local-url';

it('returns a local url', () => {
  expect(getLocalUrl({port: '8080', fileName: 'file.glb'})).toBe(
    'http://localhost:8080/file.glb',
  );
});

it('returns returns a url when port is a number', () => {
  expect(getLocalUrl({port: 3333, fileName: 'file.glb'})).toBe(
    'http://localhost:3333/file.glb',
  );
});
