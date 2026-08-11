# Security and Red-Team Scope

This repository is a public mathematical/executable red-team suite.

## Authorized challenge scope

Authorized testing is limited to the published challenge artifacts, finite protocol definitions, checkers, verifiers, proof transcripts, campaigns, and tests contained in this repository.

For CELEXTRIX Impossible Return v2-v4, the public claim boundary is the declared finite closed-route model over `N,E,S,W`, route length 8 through 64, and the published arithmetic/observer rules.

The repository is **not** authorization to attack:

- GitHub accounts or GitHub infrastructure;
- CELEXTRIX or unrelated live websites/services;
- hosting, DNS, cloud, or deployment infrastructure;
- personal devices or accounts;
- third-party systems;
- people, credentials, private data, or secrets.

## What to report publicly

Use the repository's GitHub Issue Forms for non-secret findings that concern the published finite challenge/framework relation.

Examples:

- v2 checker-faithfulness defect;
- v2 Stage-B theorem contradiction after all frozen gates close;
- v3 theorem/specification/proof-transcript/reproducibility defect;
- v4 theorem/specification/exact-route-identity/reproducibility defect;
- independently reproducible verifier disagreement.

Stage-A blindness controls are intentional and should be reported only as control reproductions where the corresponding form allows it.

## Do not post publicly

Do not place any of the following in a public challenge report:

- passwords, tokens, private keys, session material, or credentials;
- personal or private data;
- destructive payloads;
- exploit material against unrelated live systems;
- evidence that could materially endanger a third party or an unrelated live service.

If a finding concerns something outside the explicitly authorized challenge artifacts, stop testing that external target. The public challenge does not grant permission beyond this repository's declared finite scope.

## Evidence standard

A strong report should contain enough non-secret information for independent reproduction:

```text
exact challenge/version
exact released/tagged state
canonical input or proof transcript
exact verifier/checker output
minimal reproduction steps
classification: control / implementation / specification / theorem
mathematical or technical argument
```

A crash, unsupported input, malformed submission, or unrelated service failure is not by itself a mathematical break.

## Frozen-release discipline

Once a public release/tag is published, that tagged state is treated as immutable evidence. Repairs should be made in a later version/release while preserving the original reported state for reproducibility.
