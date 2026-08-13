# Publishing this challenge (and why links 404 before you do)

Three separate things must be true before a link you share actually
works. A visitor hitting any one of them sees a 404 and leaves.

## 1. The code must be on the branch the link points at

A URL like `github.com/<owner>/<repo>/blob/main/setu_connect_v1/...`
resolves against **main**. Until this work is merged into main, every
such link 404s even though the files exist on the feature branch.

    merge the PR  ->  main contains setu_connect_v1/  ->  blob links work

Before merging, a link on the feature branch works only in this form:
`.../blob/claude/setu-challenge/setu_connect_v1/...`

## 2. GitHub Pages must be switched on, or the pages are just source

GitHub renders an `.html` file in a repository as **source code**, not
as a running page. The four-attack page will not run for a visitor
until Pages serves it.

    Settings -> Pages -> Source: Deploy from a branch
    Branch: main   Folder: / (root)

Then the public URLs are:

    https://<owner>.github.io/<repo>/                    root landing
    https://<owner>.github.io/<repo>/setu_connect_v1/web/  the challenge

`index.html` at the repository root and `.nojekyll` are committed for
exactly this: without a root `index.html` the Pages root URL 404s, and
without `.nojekyll` Jekyll can silently drop files.

Pages takes a minute or two on first build. A 404 immediately after
enabling it usually means "not built yet", not "broken".

## 3. Links inside the pages must resolve

`node tools_link_check.mjs` at the repository root walks every `.md`
and `.html` file and fails if any relative link points at a path that
does not exist. Run it before publishing and after any rename. It was
added because a visitor found dead links before we did — which is
precisely the kind of report this repository asks for.

## Sharing before any of that is ready

Every page here is self-contained: downloading `breakit.html` and
opening it from disk works with no server and no network. That is the
fallback for sharing with one person; Pages is what makes it shareable
with a thousand.
