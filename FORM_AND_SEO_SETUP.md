# Santo Rubber Group — Direct inquiries and multilingual SEO

## Inquiry form setup (one-time, required before publishing)

The website is hosted on GitHub Pages, which cannot send emails by itself. This change uses [FormSubmit](https://formsubmit.co/) to accept contact form submissions and forward them to **info@santorubber.com**.

**Mailbox activation is essential:** FormSubmit states that the first submission to a new destination address triggers a confirmation email. An authorized mailbox owner must open that email and activate the form before inquiries are delivered. Do not interpret successful browser tests as proof of actual email delivery.

Suggested acceptance procedure:
1. On a controlled preview or after deployment, submit a test inquiry with a recognizable subject such as "Website test — Santo Rubber Group" and a non-sensitive test email.
2. Check **info@santorubber.com** inbox, spam and quarantine for the FormSubmit activation email.
3. Confirm the form using that activation email, then submit another test inquiry.
4. Confirm the second inquiry arrives with name, email, company, product interest, and project details; use Reply to check the reply-to behavior.
5. Test all three language versions. The destination is shared, so activation may only be needed once.

The browser tests intercept form requests and use mocked responses. **No real emails are sent during CI.**

### User experience
- Primary action: **Send inquiry** (EN), **Kirim pertanyaan** (ID), **发送咨询** (ZH)
- Primary endpoint: `https://formsubmit.co/ajax/info@santorubber.com`
- Non-JavaScript fallback: `https://formsubmit.co/info@santorubber.com`
- WhatsApp remains available; SIP inquiries retain their existing WhatsApp routing.
- If the service fails, visitors can open an email draft or copy the completed inquiry. The form never claims successful delivery when the provider returns an error.
- Spam precautions: provider-side filters and a hidden honeypot. Rate limits and captcha behavior are controlled by the provider.

The form includes a short disclosure, in all three languages, that customer contact and project information is sent through FormSubmit. The public [provider privacy policy](https://formsubmit.co/privacy.pdf) is linked. Management should review this third-party processing arrangement and its own privacy/retention notice before enabling production use. Avoid sending sensitive drawings or confidential documents through the public form; arrange secure exchange after the initial inquiry.

No API credentials are embedded in the website. If the company later adopts a dedicated forms backend, only the submission handler and form action need replacing.

## SEO updates
The three static routes now have distinct, descriptive titles and descriptions:
- `/` — English
- `/id/` — Indonesian
- `/zh/` — Simplified Chinese

Included:
- Open Graph and Twitter social preview metadata
- A share image from the company's existing product photography
- Explicit crawl and large-image-preview meta directives
- Static JSON-LD organization, website, and webpage information
- Existing canonical URLs, `hreflang` alternates, `sitemap.xml`, `robots.txt`
- Removal of client-side code that previously overwrote localized page titles and descriptions

### After deployment
- Check the site's home page and both localized URLs with Google Search Console's URL Inspection tool.
- Submit `https://santorubber.com/sitemap.xml` to Search Console, if it hasn't already been submitted.
- Test structured data with Google's Rich Results Test, and social previews with social-sharing debuggers. SEO enhancements improve clarity but **do not guarantee indexing or rankings**.
- Future phase: separate product category landing pages with verified technical specifications and metadata.

## QA
The Playwright suite checks every locale at 1440px, 768px, 390px and 320px, plus:
- Metadata, language routes, canonicals and structured data
- Success and error paths of direct inquiries using **mocked** network calls
- Email draft fallback and preservation of the user-entered inquiry
- Product cards, company tabs, facilities, images, contact info and navigation

Keep the PR in review until tests pass and the mailbox activation / provider choice has been approved.
