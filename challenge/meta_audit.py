"""Executable calibration for the v1 meta-break proof."""
from __future__ import annotations

from itertools import product

from .core import Step, analyze_history
from .oracle import analyze_history_oracle


def main() -> int:
    alphabet = tuple(Step(x, y) for x, y in product(range(3), repeat=2))
    checked = 0
    for length in range(1, 5):
        for path in product(alphabet, repeat=length):
            checked += 1
            subject = analyze_history(path)
            oracle = analyze_history_oracle(path)
            assert subject.endpoint == oracle.endpoint
            assert subject.cocycle_memory == oracle.cocycle_memory
            assert subject.typed_curvature_ledger == oracle.typed_curvature_ledger
            assert subject.aggregate_curvature == oracle.aggregate_curvature
            assert subject.spectral_shadow == oracle.spectral_shadow
    print(f"META_AUDIT_PASS paths={checked} result=V1_TARGETS_IDENTICAL")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
