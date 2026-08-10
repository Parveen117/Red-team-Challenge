"""Frozen Genesis integrity gate."""
from __future__ import annotations
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENESIS = ROOT / "genesis.json"
EXPECTED_GENESIS_SHA256 = "62b2768695c23e3935f1b54a02d74ed8bf8d3bc1420a755c85235f7f176050b1"

class GenesisIntegrityError(RuntimeError):
    pass

def assert_frozen_genesis() -> str:
    raw = GENESIS.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != EXPECTED_GENESIS_SHA256:
        raise GenesisIntegrityError(
            f"Genesis SHA-256 mismatch: expected {EXPECTED_GENESIS_SHA256}, got {digest}"
        )
    return digest
