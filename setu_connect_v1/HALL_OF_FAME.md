# SETU v1 — findings that reproduced

Every entry here is a reproduced finding against a published artifact,
with the fix commit next to it. Empty is not a boast: it means nobody
has broken it *yet*, and that is the whole point of publishing it.

| # | Finding | Reported by | Class | Fixed in |
| - | ------- | ----------- | ----- | -------- |
| — | (none yet) | | | |

Reported-but-out-of-scope submissions are closed with the reason, not
deleted. Two prior findings from our own bench are recorded below so
the standard is visible:

- **Blank page on browsers without WebCrypto Ed25519** — found by a
  first-time visitor, not by us. The page rendered only its header and
  said nothing. Fixed by adding capability detection, an audited
  fallback backend, and on-screen error surfacing.
- **Receipt parent-count contract change** — our own older test caught
  a silent change to the receipt chain shape, which is exactly what a
  test is for.
