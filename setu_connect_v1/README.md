# SETU CONNECT v1 — Red-Team Challenge

A live, browser-based communication protocol you are invited to break.
No install, no signup, no account. Open a page, become the attacker.

> **CLAIM BOUNDARY, STATED FIRST:** SETU v1 uses standard, externally
> audited cryptography (Ed25519, X25519, HKDF-SHA256, AES-256-GCM). We
> invented none of it and claim no novelty in it. What is ours — and
> what this challenge is actually about — is the TRUST GRAMMAR built on
> top: identities as signed capsules, connections that require both
> sides, and message content bound by the sender's signature. This
> challenge does not claim unbreakability. It claims that four specific
> attacks fail, and it hands you the code to try a fifth.

## Start here

| Artifact | What it is |
| --- | --- |
| [`web/breakit.html`](web/breakit.html) | **The challenge.** Four real attacks, four buttons, run them yourself. |
| [`web/demo.html`](web/demo.html) | Two simulated phones in one page; the relay's entire view printed live. |
| [`web/connect.html`](web/connect.html) | Serverless mode: two real people, codes pasted over any app. |
| [`harness/attack_suite.mjs`](harness/attack_suite.mjs) | The same four attacks, headless: `node harness/attack_suite.mjs` |
| [`harness/protocol_suite.mjs`](harness/protocol_suite.mjs) | Eight protocol-grammar properties (the part that is actually ours) |

Every HTML file is self-contained: open it from disk, no server, no
network. Read the source — it is the whole implementation.

> **If a link here 404s for you:** GitHub shows `.html` files as source
> rather than running them, and blob links only resolve on branches that
> actually contain the files. See [`PUBLISHING.md`](PUBLISHING.md) — the
> live pages need GitHub Pages enabled, and this folder needs to be on
> the branch your link points at.

## The four declared attacks (all must fail)

    A1  READ         open an intercepted envelope with an attacker key
    A2  TAMPER       flip one ciphertext bit and have it accepted
    A3  FORGE        send a message stamped with another subject_id
    A4  SERVER       read mailbox contents with full server access

`harness/attack_suite.mjs` asserts all four fail. If that suite ever
passes an attack, the web page is lying and the finding is automatic.

## What a valid break looks like

A submission is admitted if it is reproducible from the published
artifacts alone, using only what an attacker in the stated position
actually has.

    ADMITTED POSITIONS
      network attacker    sees/modifies/replays envelopes in transit
      malicious server    full relay state + logs + ability to drop,
                          reorder, replay, or fabricate envelopes
      malicious peer      a connected peer misusing protocol messages
      unconnected sender  anyone who has your public connect-code

    NOT ADMITTED (out of scope, will be closed)
      unlocked device access, screen recording, shoulder surfing
      breaking AES-GCM / Ed25519 / X25519 as primitives
      attacks on GitHub, hosting, DNS, browsers, or any third party
      denial of service against a deployed relay
      social engineering of any person

## Known gaps — do not report these, they are already ours

These are stated because a challenge that hides its gaps is marketing,
not a challenge:

1. **No forward secrecy yet.** v1 derives a fresh ephemeral key per
   message but is NOT the Signal double ratchet. Compromise of a
   long-term X25519 private key exposes past messages sealed to it.
   Ratchet is planned before any public launch.
2. **Identity lives in browser storage.** Clear site data and the
   identity is gone; there is no recovery yet. Social recovery via the
   connection graph is designed, not shipped.
3. **Calls are peer-to-peer.** Signalling is sealed, but WebRTC media
   is direct, so the two callers learn each other's IP addresses. A
   TURN relay would hide it and is not shipped.
4. **Metadata at the relay.** A deployed relay sees mailbox ids,
   envelope sizes and timing. It does not see plaintext, sender ids, or
   who connects to whom — but traffic analysis over sizes/timing is a
   real class we have not defended against.
5. **No independent audit.** None. Everything here is evidence you can
   run, not a certificate anyone issued.

## What IS interesting to us

- replay of a valid envelope accepted twice as two messages;
- a connection state reachable without both signatures;
- a message displayed to a user whose signature does not verify;
- profile/name spoofing surviving verification;
- any capsule accepted whose `self` hash does not match its content;
- canonicalisation disagreement between the Node and browser paths
  (same capsule, different bytes signed);
- call signalling accepted from an unconnected or unverified peer.

Those are the seams where our own grammar could fail, and they are
worth more to us than the ciphers.

## Reporting

Open a GitHub issue titled `SETU-v1: <one line>` containing: the
attack position from the table above, exact reproduction steps, the
artifact and its commit sha, and expected vs observed behaviour. Do
not include anyone's private data or keys. Findings that reproduce get
credited by name in `HALL_OF_FAME.md` unless you ask otherwise.

There is no cash bounty. Announcing one before an audit and a funded
account would be dishonest, so we do not.
