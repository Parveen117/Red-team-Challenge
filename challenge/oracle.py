"""Independent Recognition target oracle.

This module deliberately does not call the subject target computation.
Cocycle memory is evaluated by the closed pair-sum formula; curvature channels
are recomputed from adjacent determinants.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .constants import P
from .model import Step, validate_submission

@dataclass(frozen=True)
class OracleRecord:
    endpoint: tuple[int, int]
    memory: tuple[int, int, int, int]

def analyze_oracle(path: tuple[Step, ...]) -> OracleRecord:
    endpoint = (
        sum(s.x for s in path) % P,
        sum(s.y for s in path) % P,
    )

    cocycle = sum(
        path[j].x * path[i].y
        for i in range(len(path))
        for j in range(i + 1, len(path))
    ) % P

    kappas = tuple(
        (path[i + 1].x * path[i].y - path[i].x * path[i + 1].y) % P
        for i in range(len(path) - 1)
    )
    aggregate = sum(kappas) % P
    moment1 = sum((i + 1) * k for i, k in enumerate(kappas)) % P
    moment2 = sum((i + 1) ** 2 * k for i, k in enumerate(kappas)) % P

    return OracleRecord(
        endpoint=endpoint,
        memory=(cocycle, aggregate, moment1, moment2),
    )

def oracle_pair(value: Any) -> dict[str, Any]:
    stage, left_path, right_path = validate_submission(value)
    left = analyze_oracle(left_path)
    right = analyze_oracle(right_path)
    return {
        "stage": stage,
        "endpoint_equal": left.endpoint == right.endpoint,
        "target_equivalent": (
            left.endpoint == right.endpoint and left.memory == right.memory
        ),
        "left_endpoint": left.endpoint,
        "right_endpoint": right.endpoint,
        "left_memory": left.memory,
        "right_memory": right.memory,
    }
