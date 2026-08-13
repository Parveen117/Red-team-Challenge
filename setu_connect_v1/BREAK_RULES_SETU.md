# SETU v1 — break rules

## Frozen artifacts

The challenge is frozen at the commit that adds this file. Everything
under `setu_connect_v1/` is in scope as published: three self-contained
HTML files and two zero-dependency Node suites. Nothing else is.

    web/breakit.html        the four-attack page
    web/demo.html           two simulated devices + live relay view
    web/connect.html        serverless two-person mode
    harness/attack_suite.mjs      A1..A4, must all fail
    harness/protocol_suite.mjs    P1..P8, protocol grammar properties

Run both suites before submitting anything:

    node harness/attack_suite.mjs
    node harness/protocol_suite.mjs

## Verdict classes

    ATTACK_SUCCEEDED_A1..A4
      One of the four declared attacks works. Highest class. Show the
      exact envelope/keys and the reproduction script.

    PROTOCOL_PROPERTY_BROKEN_P1..P8
      A grammar property fails: a connection reachable without both
      signatures, a capsule accepted whose self-hash does not match,
      canonicalisation disagreement between the Node and browser paths,
      an accept without its offer, and so on. This is the class we care
      about most, because it is the part we built.

    IMPLEMENTATION_DEFECT
      The page or suite behaves differently from what it claims — for
      example a message displayed whose signature did not verify, an
      envelope accepted twice as two messages (replay), or a UI state
      that says "connected" without a mutual accept. Real finding.

    OUT_OF_SCOPE
      Device access, screenshots by the recipient, breaking AES-GCM /
      Ed25519 / X25519 as primitives, attacks on GitHub, hosting, DNS,
      browsers, third parties, or denial of service. Closed with reason.

    KNOWN_GAP
      Already listed in this folder's README (no forward secrecy yet,
      browser-storage identity, P2P call IP exposure, relay traffic
      analysis, no independent audit). Closed as known, not as invalid —
      and if you have a concrete exploit for one, that is interesting.

## Submission

GitHub issue titled `SETU-v1: <one line>` with:

    verdict class, attack position, artifact + commit sha,
    exact reproduction steps or a script, expected vs observed

No private data, no third-party keys, no attacks on live services.
Reproduced findings are credited in `HALL_OF_FAME.md`. There is no cash
bounty; announcing one before an independent audit and a funded account
would be dishonest.

## What we will not do

We will not quietly patch and stay silent. Every reproduced finding
gets an entry naming the reporter, the class, and the fix commit — the
same discipline the rest of this repository already follows for its
mathematical retractions.
