"""Frozen Genesis integrity gate for Break the Geometry v1."""
from __future__ import annotations

import hashlib
from pathlib import Path

EXPECTED_GENESIS_SHA256 = "74c056de373ed736acf1fc11a426d426cd09d56f70c5fe1698a77abb3d69f49b"
ROOT = Path(__file__).resolve().parents[1]
GENESIS = ROOT / "genesis.json"


class GenesisIntegrityError(RuntimeError):
    pass


def assert_frozen_genesis() -> str:
    try:
        raw = GENESIS.read_bytes()
    except OSError as exc:
        raise GenesisIntegrityError(f"cannot read frozen Genesis: {exc}") from exc
    digest = hashlib.sha256(raw).hexdigest()
    if digest != EXPECTED_GENESIS_SHA256:
        raise GenesisIntegrityError(
            f"Genesis SHA-256 mismatch: expected {EXPECTED_GENESIS_SHA256}, got {digest}"
        )
    return digest
