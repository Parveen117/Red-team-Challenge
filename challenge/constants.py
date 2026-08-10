"""Frozen mathematical constants for BREAK RECOGNITION v1."""
from __future__ import annotations

P = 101
PROTOCOL = "break-recognition-v1"
MAX_HISTORY_LENGTH = 12
STAGES = {
    "stage_a_blind_observer": (1, 2, 3),
    "stage_b_minimal_repair": (1, 2, 3, 4),
}
TARGET_DIMENSION = 4
