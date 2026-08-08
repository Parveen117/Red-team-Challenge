"""Deterministic subject/oracle agreement campaign for v1."""
from __future__ import annotations

import argparse
import json
import random

from .core import P, Step, analyze_history
from .oracle import analyze_history_oracle


def run_campaign(cases: int, seed: int) -> dict[str, int | str]:
    rng = random.Random(seed)
    for case in range(cases):
        length = rng.randint(1, 12)
        path = tuple(Step(rng.randrange(P), rng.randrange(P)) for _ in range(length))
        subject = analyze_history(path)
        oracle = analyze_history_oracle(path)
        if (
            subject.endpoint != oracle.endpoint
            or subject.cocycle_memory != oracle.cocycle_memory
            or subject.typed_curvature_ledger != oracle.typed_curvature_ledger
            or subject.aggregate_curvature != oracle.aggregate_curvature
            or subject.spectral_shadow != oracle.spectral_shadow
        ):
            raise AssertionError(f"subject/oracle mismatch at case {case}")
    return {
        "status": "PASS_SUBJECT_ORACLE_AGREEMENT",
        "cases": cases,
        "seed": seed,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=int, default=50000)
    parser.add_argument("--seed", type=int, default=117)
    args = parser.parse_args()
    if args.cases < 1:
        raise SystemExit("--cases must be positive")
    print(json.dumps(run_campaign(args.cases, args.seed), sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
