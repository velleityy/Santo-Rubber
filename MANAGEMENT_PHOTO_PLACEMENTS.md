# Santo Rubber Group — management-approved photographs

## Placement (same photos for English, Indonesian and Chinese)

| Site location | File | Reference |
|---|---|---|
| Home hero (factory production, all 3 languages) | `factory-production-floor.webp` | Factory production photo, Nov 2, 3:22:37 PM (1) |
| Custom molded rubber product card / primary dialog | `automotive-rubber-components.webp` | Management photo #10 |
| Custom molded rubber gallery | `industrial-bushings.webp`, `molded-sample-tray.webp`, `black-custom-molded-parts.webp` | #9, #1, #11 |
| Extruded rubber card / primary dialog | `assorted-extruded-profiles.webp` | #16 |
| Extrusion gallery | `industrial-extruded-profiles.webp`, `transparent-tubing.webp` | #4, #3 |
| Footwear card / primary dialog | `footwear-rubber-outsoles.webp` | #19 |
| Footwear gallery | `footwear-outsole-catalog.webp` | #20 |
| Marine card / primary dialog | `marine-pneumatic-fenders-site.webp` | **#18, per management placement confirmation** |
| Marine gallery | `marine-pneumatic-fender-photo.webp`, `dock-bumpers.webp` | #17, #2 |

The compounds, recycled-rubber, laboratory and facilities sections retain the current images unless otherwise agreed.

## Required image upload before merging

The image files were supplied in ChatGPT, not through a GitHub-accessible upload.
The photo archive `santo-management-photos-ready-for-github-v2.zip` contains optimized assets.
Extract the archive locally. In GitHub, navigate to the repository's `assets/` folder
on the PR branch `feature/product-imagery-layout-polish-20261108`, select
**Add file → Upload files**, and drag the extracted `.webp` files from the archive's
`assets/` folder (not the ZIP itself). Commit to the PR branch.

The HTML and JavaScript already reference the above filenames for all three languages.
Until uploaded, they fall back to the prior imagery to avoid broken thumbnails. Once uploaded,
all language routes will show the management images automatically.

## Quality checks

- GitHub Actions > Multilingual website QA tests English, Indonesian and Simplified Chinese.
- Desktop 1440px, tablet 768px, phone 390px and compact phone 320px.
- Check product cards/dialog galleries, language switching, inquiry form routing and overflow.
- Inspect the screenshot artifact manually for image crop and typography.
- Do not merge this PR before confirming that each new photo renders.

## Image source

Photos supplied by Santo Rubber management for this website. Do not describe the
photographs as third-party stock images. Avoid claiming unverified certifications or features
based solely on an image.
