# Reporting — CELEXTRIX Exact Route Identity v4

A Stage-A report is expected only as a control demonstration. The canonical valid control pair is published by the protocol.

A Stage-B report is materially stronger. To count as a theorem contradiction, provide:

- the exact v4 canonical submission;
- the complete fixed-format proof transcript;
- output from at least one conforming verifier;
- two distinct admitted closed routes;
- the same Stage-B observer value for those routes.

A valid Stage-B contradiction must survive all of these checks:

```text
route -> exact base-5 code
route code -> 23 base-101 limbs
23 limbs -> route code -> exact route
Stage-B observer -> 23 limbs -> exact route
```

Malformed transcripts, alternate number spellings, non-ASCII data, unknown fields, crashes, modified equations, or changing the admitted grammar do not count as a theorem contradiction.

Security-sensitive attacks against unrelated live services are outside scope.
