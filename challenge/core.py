"""Subject implementation for Break the Geometry v1.

All arithmetic is exact over Z_p. No floating-point tolerance participates in
the recognition decision.
"""
from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from typing import Any

P = 101
MAX_PATH_LENGTH = 32
PROTOCOL = "break-the-geometry-v1"
TRACKS = {"path_memory", "typed_residue"}


class ChallengeInputError(ValueError):
    pass


@dataclass(frozen=True)
class Step:
    x: int
    y: int


@dataclass(frozen=True)
class GeometryRecord:
    endpoint: tuple[int, int]
    cocycle_memory: int
    typed_curvature_ledger: tuple[int, ...]
    aggregate_curvature: int
    spectral_shadow: tuple[int, int]
    path_sha256: str

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


def _require_exact_keys(value: dict[str, Any], keys: set[str], label: str) -> None:
    got = set(value)
    if got != keys:
        raise ChallengeInputError(
            f"{label} must have exact keys {sorted(keys)}; got {sorted(got)}"
        )


def parse_step(value: Any, index: int) -> Step:
    if not isinstance(value, dict):
        raise ChallengeInputError(f"step {index} must be an object")
    _require_exact_keys(value, {"x", "y"}, f"step {index}")
    x = value["x"]
    y = value["y"]
    if type(x) is not int or type(y) is not int:
        raise ChallengeInputError(f"step {index} coordinates must be JSON integers")
    if not (0 <= x < P and 0 <= y < P):
        raise ChallengeInputError(f"step {index} coordinates must lie in [0,{P - 1}]")
    return Step(x, y)


def parse_history(value: Any, label: str) -> tuple[Step, ...]:
    if not isinstance(value, list):
        raise ChallengeInputError(f"{label} must be a JSON array")
    if not (1 <= len(value) <= MAX_PATH_LENGTH):
        raise ChallengeInputError(
            f"{label} length must lie in [1,{MAX_PATH_LENGTH}]"
        )
    return tuple(parse_step(step, i) for i, step in enumerate(value))


def validate_submission(value: Any) -> tuple[str, tuple[Step, ...], tuple[Step, ...]]:
    if not isinstance(value, dict):
        raise ChallengeInputError("submission must be an object")
    _require_exact_keys(value, {"protocol", "track", "left", "right"}, "submission")
    if value["protocol"] != PROTOCOL:
        raise ChallengeInputError("protocol mismatch")
    track = value["track"]
    if track not in TRACKS:
        raise ChallengeInputError(f"track must be one of {sorted(TRACKS)}")
    left = parse_history(value["left"], "left")
    right = parse_history(value["right"], "right")
    return track, left, right


def _path_digest(path: tuple[Step, ...]) -> str:
    serial = [{"x": s.x, "y": s.y} for s in path]
    raw = json.dumps(
        serial, sort_keys=True, separators=(",", ":"), allow_nan=False
    ).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def analyze_history(path: tuple[Step, ...]) -> GeometryRecord:
    # Subject implementation uses sequential composition.
    x = 0
    y = 0
    memory = 0
    ledger: list[int] = []
    previous: Step | None = None

    for step in path:
        memory = (memory + step.x * y) % P
        if previous is not None:
            curvature = (step.x * previous.y - previous.x * step.y) % P
            ledger.append(curvature)
        x = (x + step.x) % P
        y = (y + step.y) % P
        previous = step

    spectral = ((2 * x) % P, (x * x) % P)
    return GeometryRecord(
        endpoint=(x, y),
        cocycle_memory=memory,
        typed_curvature_ledger=tuple(ledger),
        aggregate_curvature=sum(ledger) % P,
        spectral_shadow=spectral,
        path_sha256=_path_digest(path),
    )


def verify_pair(value: Any) -> dict[str, Any]:
    track, left_path, right_path = validate_submission(value)
    left = analyze_history(left_path)
    right = analyze_history(right_path)

    public_equal = left.public_shadow(track) == right.public_shadow(track)
    target_equal = left.target_key(track) == right.target_key(track)

    return {
        "protocol": PROTOCOL,
        "track": track,
        "decision": "EQUIVALENT" if target_equal else "DISTINCT",
        "public_observation_equal": public_equal,
        "left": {
            "endpoint": list(left.endpoint),
            "cocycle_memory": left.cocycle_memory,
            "typed_curvature_ledger": list(left.typed_curvature_ledger),
            "aggregate_curvature": left.aggregate_curvature,
            "spectral_shadow": list(left.spectral_shadow),
            "path_sha256": left.path_sha256,
        },
        "right": {
            "endpoint": list(right.endpoint),
            "cocycle_memory": right.cocycle_memory,
            "typed_curvature_ledger": list(right.typed_curvature_ledger),
            "aggregate_curvature": right.aggregate_curvature,
            "spectral_shadow": list(right.spectral_shadow),
            "path_sha256": right.path_sha256,
        },
    }
