# Public Launch Checklist

This checklist is for the first repository-level public release of the complete `Red-team-Challenge` suite.

## Already satisfied

- [x] Repository visibility is public.
- [x] Default branch is `main`.
- [x] All challenge/framework versions remain together in one repository.
- [x] Root README identifies v2 as the active CELEXTRIX red-team target.
- [x] v3 and v4 are labeled as Mathematical Framework Establishment references.
- [x] Finite-model claim boundary is visible at the top-level public entry point.
- [x] GitHub Issues are enabled.
- [x] Challenge-specific Issue Forms are present.
- [x] CI gates exist for BREAK RECOGNITION, CELEXTRIX v1, v2, v3, and v4.
- [x] The latest public-framing state has passed all five CI gates.
- [x] No open pull request is required for the current challenge implementation state.

## Owner decision before release

- [ ] **Choose whether to add an open-source license.**

The repository currently has no recognized license. A public repository without a license is still publicly viewable, but normal copyright restrictions remain and third parties do not automatically receive broad permission to copy, modify, or redistribute the code.

If the intended challenge allows people to clone, modify locally, build tooling around it, and redistribute forks, choose an appropriate license before or alongside the release. This is a legal/rights decision and should be made by the repository owner, not inferred by tooling.

## Final manual GitHub release action

GitHub currently has no published Release for this repository.

Create one repository-level release containing the complete suite:

```text
Tag: red-team-challenge-suite-v1.0.0
Target: main
Title: RED TEAM CHALLENGE — Public Falsification & Mathematical Framework Suite v1.0.0
```

Use the ready-to-paste release body in [`PUBLIC_RELEASE_V1.md`](PUBLIC_RELEASE_V1.md).

Select **Set as the latest release** and do not mark it as a pre-release.

Before pressing **Publish release**, verify that the tag preview points to the exact current `main` commit containing this checklist and `PUBLIC_RELEASE_V1.md`.

## After pressing Publish release

The suite is open.

Do not change the frozen release/tag in response to an incoming report. Instead:

```text
report
-> reproduce
-> classify
   -> expected control
   -> implementation defect
   -> specification ambiguity
   -> theorem contradiction
-> preserve evidence
-> repair only in a later version/release if needed
```

## Suggested launch post

```text
RED TEAM CHALLENGE is open.

A public falsification suite for Recognition / CELEXTRIX is now available.

The repository preserves the complete evolution:

blindness
-> faithful checker
-> mathematical authority
-> exact identity

ACTIVE ADVERSARIAL TARGET:
CELEXTRIX Impossible Return — Faithful Checker v2

Also included:
- BREAK RECOGNITION v1
- historical Impossible Return v1
- Mathematical Framework Establishment I — v3
- Mathematical Framework Establishment II — v4

Everything needed to reproduce, test, challenge, or report a result is in the public repository.

Scope is deliberately finite and explicit. This is not authorization to attack unrelated systems or services.

If you think you found a break, use the repository's GitHub Issue Forms and provide complete reproducible evidence.
```

## Launch discipline

The launch is more valuable if the released target stays stable.

- Do not strengthen v2 merely because a new attack idea is proposed.
- Let independent challengers test the frozen release.
- Treat Stage-A controls as expected behavior, not successful breaks of the repaired stage.
- Keep mathematical contradictions separate from checker/runtime defects.
- Record failed attacks as useful evidence only when they are reproducible and clearly scoped.
