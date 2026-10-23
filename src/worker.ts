/**
 * Cloudflare Worker entry: permanent trailing-slash redirects (308) plus
 * static assets. Built-in assets html_handling uses temporary 307; this
 * worker runs first and upgrades slash consolidation to 308.
 *
 * FILE_EXT allows long extensions (e.g. .webmanifest is 11 chars) so
 * extensioned assets are not redirected to …/file.ext/.
 */
export interface Env {
  ASSETS: Fetcher;
}

const FILE_EXT = /\.[a-zA-Z0-9]{1,16}$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      url.pathname.length > 1 &&
      !url.pathname.endsWith('/') &&
      !FILE_EXT.test(url.pathname)
    ) {
      url.pathname = `${url.pathname}/`;
      return Response.redirect(url.toString(), 308);
    }

    return env.ASSETS.fetch(request);
  },
};
