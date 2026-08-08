"""Official BREAK RECOGNITION checker."""
from __future__ import annotations
import json
from pathlib import Path
import sys

from .genesis import GenesisIntegrityError, assert_frozen_genesis
from .model import ChallengeInputError
from .oracle import oracle_pair
from .strict_json import StrictJSONError, loads_strict
from .subject import verify_pair

def check_break(value: object) -> dict[str, object]:
    subject = verify_pair(value)
    oracle = oracle_pair(value)

    accepted = (
        bool(oracle["endpoint_equal"])
        and not bool(oracle["target_equivalent"])
        and subject["decision"] == "EQUIVALENT"
    )

    if accepted:
        status = (
            "BREAK_ACCEPTED_STAGE_A"
            if subject["stage"] == "stage_a_blind_observer"
            else "BREAK_ACCEPTED_STAGE_B"
        )
        reason = "target-distinct histories collided under the subject observer"
    elif not oracle["endpoint_equal"]:
        status = "NO_BREAK"
        reason = "histories do not have the same endpoint"
    elif oracle["target_equivalent"]:
        status = "NO_BREAK"
        reason = "independent oracle says the declared Recognition target is equivalent"
    else:
        status = "NO_BREAK"
        reason = "subject observer kept the target-distinct histories separate"

    return {
        "protocol": subject["protocol"],
        "stage": subject["stage"],
        "status": status,
        "reason": reason,
        "subject_decision": subject["decision"],
        "oracle_endpoint_equal": oracle["endpoint_equal"],
        "oracle_target_equivalent": oracle["target_equivalent"],
    }

def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 1:
        print("usage: python -m challenge.break_checker SUBMISSION.json", file=sys.stderr)
        return 2
    try:
        assert_frozen_genesis()
        value = loads_strict(Path(argv[0]).read_text(encoding="utf-8"))
        result = check_break(value)
    except (OSError, StrictJSONError, ChallengeInputError, GenesisIntegrityError) as exc:
        print(json.dumps({"status": "INVALID", "error": str(exc)}, indent=2, sort_keys=True))
        return 2
    print(json.dumps(result, indent=2, sort_keys=True))
    return 1 if str(result["status"]).startswith("BREAK_ACCEPTED") else 0

if __name__ == "__main__":
    raise SystemExit(main())
