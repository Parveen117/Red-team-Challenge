"""Subject verifier.

The subject never compares the raw four-channel Recognition target. It sees:
    endpoint + observer code.

Stage A uses a rank-3 observer.
Stage B uses the theorem-minimal rank-4 repair.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .constants import P, PROTOCOL, STAGES
from .model import Step, validate_submission

@dataclass(frozen=True)
class SubjectRecord:
    endpoint: tuple[int, int]
    memory: tuple[int, int, int, int]
    observer_code: tuple[int, ...]

def _observer_code(memory: tuple[int, int, int, int], stage: str) -> tuple[int, ...]:
    code = []
    for a in STAGES[stage]:
        total = 0
        power = 1
        for component in memory:
            total = (total + power * component) % P
            power = (power * a) % P
        code.append(total)
    return tuple(code)

def analyze_subject(path: tuple[Step, ...], stage: str) -> SubjectRecord:
    current_x = 0
    current_y = 0
    cocycle = 0
    curvature_ledger: list[int] = []
    previous: Step | None = None

    for step in path:
        cocycle = (cocycle + step.x * current_y) % P
        if previous is not None:
            kappa = (step.x * previous.y - previous.x * step.y) % P
            curvature_ledger.append(kappa)
        current_x = (current_x + step.x) % P
        current_y = (current_y + step.y) % P
        previous = step

    aggregate = sum(curvature_ledger) % P
    moment1 = sum((i + 1) * k for i, k in enumerate(curvature_ledger)) % P
    moment2 = sum((i + 1) * (i + 1) * k for i, k in enumerate(curvature_ledger)) % P
    memory = (cocycle, aggregate, moment1, moment2)
    return SubjectRecord(
        endpoint=(current_x, current_y),
        memory=memory,
        observer_code=_observer_code(memory, stage),
    )

def verify_pair(value: Any) -> dict[str, Any]:
    stage, left_path, right_path = validate_submission(value)
    left = analyze_subject(left_path, stage)
    right = analyze_subject(right_path, stage)
    observation_equal = (
        left.endpoint == right.endpoint
        and left.observer_code == right.observer_code
    )
    return {
        "protocol": PROTOCOL,
        "stage": stage,
        "decision": "EQUIVALENT" if observation_equal else "DISTINCT",
        "observation_equal": observation_equal,
        "left_endpoint": list(left.endpoint),
        "right_endpoint": list(right.endpoint),
        "left_code": list(left.observer_code),
        "right_code": list(right.observer_code),
    }
