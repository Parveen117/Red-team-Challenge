"""Independent semantic oracle for Break the Geometry v1.

This deliberately avoids the subject implementation's sequential memory
recurrence. The cocycle memory is recomputed from the closed pair-sum formula.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .core import ChallengeInputError, P, Step, validate_submission


@dataclass(frozen=True)
class OracleRecord:
    endpoint: tuple[int, int]
    cocycle_memory: int
    typed_curvature_ledger: tuple[int, ...]
    aggregate_curvature: int
    spectral_shadow: tuple[int, int]

    def public_shadow(self, track: str) -> tuple[Any, ...]:
        if track == "path_memory":
            return (self.endpoint, self.spectral_shadow)
        if track == "typed_residue":
            return (
                self.endpoint,
                self.spectral_shadow,
                self.cocycle_memory,
                self.aggregate_curvature,
            )
        raise ChallengeInputError(f"unknown track: {track}")

    def target_key(self, track: str) -> tuple[Any, ...]:
        if track == "path_memory":
            return (self.endpoint, self.cocycle_memory)
        if track == "typed_residue":
            return (
                self.endpoint,
                self.cocycle_memory,
                self.typed_curvature_ledger,
            )
        raise ChallengeInputError(f"unknown track: {track}")


def analyze_history_oracle(path: tuple[Step, ...]) -> OracleRecord:
    x = sum(step.x for step in path) % P
    y = sum(step.y for step in path) % P

    # For steps a_0,...,a_{n-1}, sequential use of
    # omega(b,a)=b_x*a_y gives sum_{i<j} x_j*y_i.
    memory = 0
    for i in range(len(path)):
        for j in range(i + 1, len(path)):
            memory = (memory + path[j].x * path[i].y) % P

    ledger = tuple(
        (path[i + 1].x * path[i].y - path[i].x * path[i + 1].y) % P
        for i in range(len(path) - 1)
    )

    return OracleRecord(
        endpoint=(x, y),
        cocycle_memory=memory,
        typed_curvature_ledger=ledger,
        aggregate_curvature=sum(ledger) % P,
        spectral_shadow=((2 * x) % P, (x * x) % P),
    )


def oracle_pair(value: Any) -> dict[str, Any]:
    track, left_path, right_path = validate_submission(value)
    left = analyze_history_oracle(left_path)
    right = analyze_history_oracle(right_path)
    return {
        "track": track,
        "public_observation_equal": left.public_shadow(track) == right.public_shadow(track),
        "target_equivalent": left.target_key(track) == right.target_key(track),
        "left_target": repr(left.target_key(track)),
        "right_target": repr(right.target_key(track)),
    }
