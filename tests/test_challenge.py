from __future__ import annotations

import itertools
from pathlib import Path
import unittest

from challenge.break_checker import check_break
from challenge.core import ChallengeInputError, Step, analyze_history, verify_pair
from challenge.oracle import analyze_history_oracle
from challenge.strict_json import StrictJSONError, loads_strict


ROOT = Path(__file__).resolve().parents[1]


class BreakTheGeometryTests(unittest.TestCase):
    def load_fixture(self, name: str):
        return loads_strict((ROOT / "fixtures" / name).read_text(encoding="utf-8"))

    def test_control_equivalent(self):
        result = verify_pair(self.load_fixture("control_equivalent.json"))
        self.assertEqual(result["decision"], "EQUIVALENT")
        self.assertTrue(result["public_observation_equal"])

    def test_path_memory_attack_is_blocked(self):
        value = self.load_fixture("path_memory_attack.json")
        result = verify_pair(value)
        check = check_break(value)
        self.assertEqual(result["decision"], "DISTINCT")
        self.assertEqual(check["status"], "NO_BREAK")
        self.assertTrue(check["oracle_public_observation_equal"])
        self.assertFalse(check["oracle_target_equivalent"])

    def test_typed_residue_attack_is_blocked_even_when_aggregate_matches(self):
        value = self.load_fixture("typed_residue_attack.json")
        result = verify_pair(value)
        self.assertEqual(result["left"]["endpoint"], result["right"]["endpoint"])
        self.assertEqual(result["left"]["cocycle_memory"], result["right"]["cocycle_memory"])
        self.assertEqual(result["left"]["aggregate_curvature"], result["right"]["aggregate_curvature"])
        self.assertNotEqual(
            result["left"]["typed_curvature_ledger"],
            result["right"]["typed_curvature_ledger"],
        )
        self.assertEqual(result["decision"], "DISTINCT")
        self.assertEqual(check_break(value)["status"], "NO_BREAK")

    def test_subject_matches_independent_oracle_on_small_campaign(self):
        atoms = [Step(0, 1), Step(1, 0), Step(1, 1), Step(2, 1)]
        for length in (1, 2, 3):
            for path in itertools.product(atoms, repeat=length):
                subject = analyze_history(tuple(path))
                oracle = analyze_history_oracle(tuple(path))
                self.assertEqual(subject.endpoint, oracle.endpoint)
                self.assertEqual(subject.cocycle_memory, oracle.cocycle_memory)
                self.assertEqual(subject.typed_curvature_ledger, oracle.typed_curvature_ledger)
                self.assertEqual(subject.aggregate_curvature, oracle.aggregate_curvature)
                self.assertEqual(subject.spectral_shadow, oracle.spectral_shadow)

    def test_duplicate_json_key_is_invalid(self):
        raw = '{"protocol":"break-the-geometry-v1","protocol":"evil","track":"path_memory","left":[],"right":[]}'
        with self.assertRaises(StrictJSONError):
            loads_strict(raw)

    def test_boolean_is_not_an_integer_coordinate(self):
        value = {
            "protocol": "break-the-geometry-v1",
            "track": "path_memory",
            "left": [{"x": True, "y": 0}],
            "right": [{"x": 1, "y": 0}],
        }
        with self.assertRaises(ChallengeInputError):
            verify_pair(value)


if __name__ == "__main__":
    unittest.main()
