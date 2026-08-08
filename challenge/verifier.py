"""CLI for the subject verifier."""
from __future__ import annotations

import json
from pathlib import Path
import sys

from .core import ChallengeInputError, verify_pair
from .strict_json import StrictJSONError, loads_strict
from .genesis import GenesisIntegrityError, assert_frozen_genesis


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 1:
        print("usage: python -m challenge.verifier SUBMISSION.json", file=sys.stderr)
        return 2
    try:
        assert_frozen_genesis()
        value = loads_strict(Path(argv[0]).read_text(encoding="utf-8"))
        result = verify_pair(value)
    except (OSError, StrictJSONError, ChallengeInputError, GenesisIntegrityError) as exc:
        print(json.dumps({"decision": "INVALID", "error": str(exc)}, sort_keys=True))
        return 2
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
