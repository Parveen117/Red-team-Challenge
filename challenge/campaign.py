"""Deterministic consistency campaign.

This is not a red-team search. It checks that the subject's internal target
calculation agrees with the independently structured oracle before compression.
"""
from __future__ import annotations
import argparse
import random
from .constants import P
from .model import Step
from .oracle import analyze_oracle
from .subject import analyze_subject

def run(cases: int, seed: int) -> dict[str, int | str]:
    rng = random.Random(seed)
    for i in range(cases):
        length = rng.randint(2, 12)
        path = tuple(Step(rng.randrange(P), rng.randrange(P)) for _ in range(length))
        oracle = analyze_oracle(path)
        for stage in ("stage_a_blind_observer", "stage_b_minimal_repair"):
            subject = analyze_subject(path, stage)
            if subject.endpoint != oracle.endpoint or subject.memory != oracle.memory:
                raise AssertionError(f"subject/oracle divergence at case {i}, stage {stage}")
    return {"status": "PASS_SUBJECT_ORACLE_TARGET_AGREEMENT", "cases": cases, "seed": seed}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=int, default=50000)
    parser.add_argument("--seed", type=int, default=117)
    args = parser.parse_args()
    result = run(args.cases, args.seed)
    print(result)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
