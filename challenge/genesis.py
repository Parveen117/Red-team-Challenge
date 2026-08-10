"""Frozen Genesis integrity gate."""
from __future__ import annotations
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENESIS = ROOT / "genesis.json"
EXPECTED_GENESIS_SHA256 = "62b2768695c23e3935f1b54a02d74ed8bf8d3bc1420a755c85235f7f176050b1"


class GenesisIntegrityError(RuntimeError):
    pass


def canonical_genesis_bytes(raw: bytes) -> bytes:
    """Normalize only platform newline encoding before hashing Genesis.

    Git may materialize a tracked text file as CRLF on Windows even when the
    repository object is LF. Genesis identity must therefore bind the exact
    tracked text modulo newline transport, not the client's checkout policy.
    No whitespace, JSON, key-order, or semantic canonicalization is performed.
    """
    return raw.replace(b"\r\n", b"\n").replace(b"\r", b"\n")


def genesis_sha256(raw: bytes) -> str:
    return hashlib.sha256(canonical_genesis_bytes(raw)).hexdigest()


def assert_frozen_genesis() -> str:
    digest = genesis_sha256(GENESIS.read_bytes())
    if digest != EXPECTED_GENESIS_SHA256:
        raise GenesisIntegrityError(
            f"Genesis SHA-256 mismatch: expected {EXPECTED_GENESIS_SHA256}, got {digest}"
        )
    return digest
