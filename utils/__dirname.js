import url from 'node:url';
import path from 'node:path';

export const __dirname = (metaURL) => {
  const __filename = url.fileURLToPath(metaURL);
  const __dirname = path.dirname(__filename);
  return __dirname;
};
