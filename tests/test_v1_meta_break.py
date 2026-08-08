import unittest

from challenge.break_checker import check_break
from challenge.core import Step, analyze_history
from challenge.oracle import analyze_history_oracle


class V1MetaBreakTests(unittest.TestCase):
    def test_subject_and_oracle_targets_are_same_computation(self):
        paths = [
            (Step(1, 0), Step(0, 1)),
            (Step(0, 1), Step(1, 0)),
            (Step(2, 3), Step(5, 7), Step(11, 13)),
            (Step(100, 100), Step(100, 0), Step(0, 100), Step(1, 1)),
        ]
        for path in paths:
            subject = analyze_history(path)
            oracle = analyze_history_oracle(path)
            self.assertEqual(subject.endpoint, oracle.endpoint)
            self.assertEqual(subject.cocycle_memory, oracle.cocycle_memory)
            self.assertEqual(subject.typed_curvature_ledger, oracle.typed_curvature_ledger)
            self.assertEqual(subject.aggregate_curvature, oracle.aggregate_curvature)
            self.assertEqual(subject.spectral_shadow, oracle.spectral_shadow)

    def test_break_checker_cannot_accept_when_oracle_target_is_distinct(self):
        candidates = [
            {
                "protocol": "break-the-geometry-v1",
                "track": "path_memory",
                "left": [{"x": 1, "y": 0}, {"x": 0, "y": 1}],
                "right": [{"x": 0, "y": 1}, {"x": 1, "y": 0}],
            },
            {
                "protocol": "break-the-geometry-v1",
                "track": "typed_residue",
                "left": [{"x": 1, "y": 0}, {"x": 0, "y": 1}, {"x": 100, "y": 0}],
                "right": [{"x": 100, "y": 0}, {"x": 0, "y": 1}, {"x": 1, "y": 0}],
            },
        ]
        for candidate in candidates:
            result = check_break(candidate)
            if not result["oracle_target_equivalent"]:
                self.assertEqual(result["subject_decision"], "DISTINCT")
                self.assertEqual(result["status"], "NO_BREAK")


if __name__ == "__main__":
    unittest.main()
