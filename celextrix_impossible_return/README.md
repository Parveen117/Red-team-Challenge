# BREAK CELEXTRIX: IMPOSSIBLE RETURN

Public red-team challenge for the CELEXTRIX higher-order path-memory interface.

> **Make CELEXTRIX forget how you returned.**

The browser experience is built around a simple idea: two routes can end at the same point while carrying different route memory. This challenge turns that idea into a frozen finite checker over exact arithmetic in `Z_101`.

## Two tracks

### Stage A — Find the route-memory blind spot

Each valid closed route produces four exact edge-moment channels:

1. signed doubled area;
2. x-weighted doubled area;
3. y-weighted doubled area;
4. radial-weighted doubled area.

The Stage-A subject observer exposes only three polynomial evaluations, at `1, 2, 3`. Its observation map therefore has one abstract blind dimension.

Submit two distinct valid closed routes with:

- the same endpoint;
- the same Stage-A observer code;
- different full route-memory targets.

Winning machine result:

```text
BREAK_ACCEPTED_STAGE_A
```

This track is intentionally breakable. It is an executable blindness witness, not a security claim.

### Stage B — Break the theorem-minimal repair

Stage B adds the fourth evaluation at `4`. The resulting 4x4 Vandermonde determinant is:

```text
12 mod 101
```

and is invertible. Equality of all four observer values therefore determines the declared four-channel target exactly.

A Stage-B success must expose an implementation, strict-JSON, arithmetic, subject/oracle, or certificate-faithfulness defect.

Winning machine result:

```text
BREAK_ACCEPTED_STAGE_B
```

## Quick start

No package installation is required. Use Node.js 20 or newer.

```bash
node celextrix_impossible_return/tests.mjs
node celextrix_impossible_return/campaign.mjs --stage A --cases 50000 --seed 117
node celextrix_impossible_return/checker.mjs celextrix_impossible_return/submission.example.json
```

To ask the deterministic Stage-A search to emit a candidate submission:

```bash
node celextrix_impossible_return/campaign.mjs --stage A --cases 50000 --seed 117 --emit-witness
```

The repository does not commit a winning pair as a fixture.

## Submission grammar

```json
{
  "protocol": "celextrix-impossible-return-v1",
  "stage": "A",
  "left": "NNEESSWW",
  "right": "EENNWWSS"
}
```

Rules:

- only the fields `protocol`, `stage`, `left`, `right` are admitted;
- `stage` is `A` or `B`;
- routes use only `N`, `E`, `S`, `W`;
- route length is from 8 through 64 symbols;
- both routes must return to the origin;
- the two route strings must be distinct;
- duplicate JSON keys and trailing content are rejected.

## Break predicate

```text
valid submission
AND same endpoint
AND subject observer says EQUIVALENT
AND independent oracle target is different
AND subject/oracle reconstruction agrees on each raw route target
```

The subject accumulates route moments incrementally. The oracle first constructs the complete vertex/edge list and independently reduces the four channels. A checker result is not accepted if those two implementations disagree about the represented routes.

## Frozen Genesis

Protocol:

```text
celextrix-impossible-return-v1
```

Genesis SHA-256:

```text
de3891fc5abe736eb572b777cab0dace48167b05fb5f9679d360eba14dc67c9f
```

The checker reconstructs this hash before evaluating any submission.

## Reporting a break

Use the repository Issue Form **CELEXTRIX Impossible Return break report**. Include:

- challenge stage;
- exact checker commit SHA;
- complete submission JSON;
- exact machine result;
- a concise explanation of why the submission satisfies the frozen grammar.

Do not include passwords, tokens, private keys, personal data, destructive payloads, or attacks against unrelated services.

## Claim boundary

This is a finite exact route-memory challenge. It does not claim universal path-signature completeness, continuum holonomy, browser invulnerability, cryptographic hardness, or physical realization of the full Recognition framework.

Stage A proves a declared finite observer is blind. Stage B proves only that the four declared channels are separated by the repaired finite observer. External browser, deployment, account, DNS, and platform security remain separate systems.
