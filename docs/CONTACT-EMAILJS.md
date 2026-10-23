# Contact form (EmailJS)

The `/contact/` page can send messages through [EmailJS](https://www.emailjs.com/) on the **free plan**, using a tiny inline `fetch` to their REST API (no `@emailjs/browser` SDK).

When any of the three public env vars is unset at build time, the form is **not** rendered and visitors use the mailto link to `siteConfig.contactEmail` instead. The mailto link stays visible as a secondary option either way. Do not attach confidential files — the page copy states this clearly.

## Build-time env vars

Set these in Cloudflare Workers Builds (and locally in `.env`). They are `PUBLIC_*` because EmailJS’s **public** key is designed for browser use. **Never** put the EmailJS **private** key in the repo, wrangler vars, or any `PUBLIC_*` variable.

| Variable | Purpose |
|---|---|
| `PUBLIC_EMAILJS_SERVICE_ID` | Email service ID from the EmailJS dashboard |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | Email template ID |
| `PUBLIC_EMAILJS_PUBLIC_KEY` | Account **public** key (`user_id` in the REST body) |

All three must be non-empty to enable the form (`isEmailjsConfigured()` in `src/config/site.ts`).

See also [`.env.example`](../.env.example) and [DEPLOYMENT.md](./DEPLOYMENT.md).

## REST call

`POST https://api.emailjs.com/api/v1.0/email/send`

```json
{
  "service_id": "<PUBLIC_EMAILJS_SERVICE_ID>",
  "template_id": "<PUBLIC_EMAILJS_TEMPLATE_ID>",
  "user_id": "<PUBLIC_EMAILJS_PUBLIC_KEY>",
  "template_params": {
    "from_name": "...",
    "reply_to": "...",
    "message": "...",
    "page_url": "https://…/contact/",
    "site_name": "LocalFile Convert"
  }
}
```

## EmailJS template variables

Create a template that uses:

| Variable | Meaning |
|---|---|
| `{{from_name}}` | Visitor name |
| `{{reply_to}}` | Visitor email (set Reply-To in EmailJS to this) |
| `{{message}}` | Message body |
| `{{page_url}}` | Absolute contact page URL |
| `{{site_name}}` | Site brand name |

## Free-plan safeguards (client-side)

- Hidden honeypot field (`company`) — bots that fill it get a fake success; no API call
- One send per 60 seconds per browser (`localStorage`)
- Message length cap (2000 characters)
- Submit button disabled while the request is in flight

These reduce accidental quota burn; they are not a substitute for EmailJS dashboard rate limits or spam filters.

## CSP

This site does not ship a site-wide `Content-Security-Policy` that blocks `fetch` (only `frame-ancestors` on `/embed/*`). If you add a CSP later in `public/_headers` or the Worker, allow:

```http
connect-src 'self' https://api.emailjs.com …
```

(and whatever hosts you already need for GA4 / AdSense).

## Privacy note for visitors

Remind people not to attach or paste confidential file contents. Tools convert in-browser; support should only need tool URL, browser/OS, and error text.
