"""Shared grammar only. Subject and oracle do not share target computations."""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .constants import MAX_HISTORY_LENGTH, P, PROTOCOL, STAGES

class ChallengeInputError(ValueError):
    pass

@dataclass(frozen=True)
class Step:
    x: int
    y: int

def _exact_keys(value: dict[str, Any], required: set[str], label: str) -> None:
    got = set(value)
    if got != required:
        raise ChallengeInputError(
            f"{label} must have exact keys {sorted(required)}; got {sorted(got)}"
        )

def parse_step(value: Any, index: int) -> Step:
    if not isinstance(value, dict):
        raise ChallengeInputError(f"step {index} must be an object")
    _exact_keys(value, {"x", "y"}, f"step {index}")
    x, y = value["x"], value["y"]
    if type(x) is not int or type(y) is not int:
        raise ChallengeInputError(f"step {index} coordinates must be JSON integers")
    if not (0 <= x < P and 0 <= y < P):
        raise ChallengeInputError(f"step {index} coordinates must lie in [0,{P-1}]")
    return Step(x, y)

def parse_history(value: Any, label: str) -> tuple[Step, ...]:
    if not isinstance(value, list):
        raise ChallengeInputError(f"{label} must be a JSON array")
    if not (2 <= len(value) <= MAX_HISTORY_LENGTH):
        raise ChallengeInputError(
            f"{label} length must lie in [2,{MAX_HISTORY_LENGTH}]"
        )
    return tuple(parse_step(v, i) for i, v in enumerate(value))

def validate_submission(value: Any) -> tuple[str, tuple[Step, ...], tuple[Step, ...]]:
    if not isinstance(value, dict):
        raise ChallengeInputError("submission must be an object")
    _exact_keys(value, {"protocol", "stage", "left", "right"}, "submission")
    if value["protocol"] != PROTOCOL:
        raise ChallengeInputError("protocol mismatch")
    stage = value["stage"]
    if stage not in STAGES:
        raise ChallengeInputError(f"stage must be one of {sorted(STAGES)}")
    return stage, parse_history(value["left"], "left"), parse_history(value["right"], "right")
