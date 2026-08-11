# Reporting semantics

Faithful Checker v2 deliberately separates three classes.

## Stage A control witness

`BREAK_ACCEPTED_STAGE_A_CONTROL`

This is expected. It demonstrates the one-dimensional kernel of the rank-3 Stage-A observer.

## Checker faithfulness defect

`CHECKER_FAITHFULNESS_FAILURE`

This means the implementation was not entitled to adjudicate the mathematical challenge. Examples include disagreement among the three target implementations, observer algorithm disagreement, failed Stage-B inverse reconstruction, implementation-manifest drift, or theorem-gate drift.

This is a real implementation finding, but not a counterexample to the Stage-B finite theorem.

## Stage B theorem contradiction

`THEOREM_CONTRADICTION_STAGE_B`

This class is reachable only if:

- the canonical wire is admitted;
- Genesis integrity closes;
- the implementation manifest closes;
- the exact Stage-B rank/determinant/inverse theorem gate closes;
- subject, oracle, and reference targets agree;
- Horner and matrix observers agree;
- inverse reconstruction returns the original target;
- both routes are valid and closed;
- the two Stage-B observer codes are equal;
- the two faithful targets are different.

Under the frozen finite model this conjunction is algebraically inconsistent. A report must reproduce on the exact released commit without modifying any bound artifact.
