import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false,
});

export async function markdownToHtml(input: string): Promise<string> {
  return marked.parse(input) as string | Promise<string>;
}

export function wrapHtmlDocument(bodyHtml: string, title = 'Converted Markdown'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:system-ui,sans-serif;line-height:1.6;max-width:48rem;margin:2rem auto;padding:0 1rem;color:#14201f}
pre,code{font-family:ui-monospace,monospace}
pre{background:#f4f7f6;padding:1rem;overflow:auto}
img{max-width:100%}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
