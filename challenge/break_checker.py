"""Official break checker.

A v1 break exists only when:
1. the candidate is valid under the frozen grammar;
2. the independent oracle says the pair is an eligible public collision;
3. the oracle says the recognition targets are different; and
4. the subject verifier nevertheless returns EQUIVALENT.
"""
from __future__ import annotations

import json
from pathlib import Path
import sys

from .core import ChallengeInputError, verify_pair
from .oracle import oracle_pair
from .strict_json import StrictJSONError, loads_strict


def check_break(value: object) -> dict[str, object]:
    subject = verify_pair(value)
    oracle = oracle_pair(value)

    accepted = (
        bool(oracle["public_observation_equal"])
        and not bool(oracle["target_equivalent"])
        and subject["decision"] == "EQUIVALENT"
    )

    if accepted:
        status = "BREAK_ACCEPTED"
        reason = "subject false-equivalence reproduced inside frozen v1 grammar"
    elif not oracle["public_observation_equal"]:
        status = "NO_BREAK"
        reason = "candidate is not an eligible public-observation collision"
    elif oracle["target_equivalent"]:
        status = "NO_BREAK"
        reason = "independent oracle says the declared recognition targets are equivalent"
    else:
        status = "NO_BREAK"
        reason = "subject verifier correctly kept target-inequivalent histories distinct"

    return {
        "protocol": subject["protocol"],
        "track": subject["track"],
        "status": status,
        "reason": reason,
        "subject_decision": subject["decision"],
        "oracle_public_observation_equal": oracle["public_observation_equal"],
        "oracle_target_equivalent": oracle["target_equivalent"],
    }


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 1:
        print("usage: python -m challenge.break_checker SUBMISSION.json", file=sys.stderr)
        return 2
    try:
        value = loads_strict(Path(argv[0]).read_text(encoding="utf-8"))
        result = check_break(value)
    except (OSError, StrictJSONError, ChallengeInputError) as exc:
        result = {"status": "INVALID", "error": str(exc)}
        print(json.dumps(result, indent=2, sort_keys=True))
        return 2

    print(json.dumps(result, indent=2, sort_keys=True))
    return 1 if result["status"] == "BREAK_ACCEPTED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
