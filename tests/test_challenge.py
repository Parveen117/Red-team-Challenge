from __future__ import annotations
import unittest

from challenge.constants import P, STAGES
from challenge.genesis import assert_frozen_genesis
from challenge.model import ChallengeInputError, Step, validate_submission
from challenge.oracle import analyze_oracle
from challenge.subject import analyze_subject
from challenge.break_checker import check_break
from challenge.strict_json import StrictJSONError, loads_strict

class ChallengeTests(unittest.TestCase):
    def test_genesis_is_frozen(self):
        self.assertEqual(assert_frozen_genesis(), "62b2768695c23e3935f1b54a02d74ed8bf8d3bc1420a755c85235f7f176050b1")

    def test_stage_a_has_known_abstract_blind_direction(self):
        delta = (95, 11, 95, 1)
        code = []
        for a in STAGES["stage_a_blind_observer"]:
            code.append(sum(pow(a, k, P) * delta[k] for k in range(4)) % P)
        self.assertEqual(tuple(code), (0, 0, 0))

    def test_stage_b_repairs_that_direction(self):
        delta = (95, 11, 95, 1)
        code = []
        for a in STAGES["stage_b_minimal_repair"]:
            code.append(sum(pow(a, k, P) * delta[k] for k in range(4)) % P)
        self.assertEqual(code[:3], [0, 0, 0])
        self.assertNotEqual(code[3], 0)

    def test_stage_b_vandermonde_determinant_nonzero(self):
        alphas = STAGES["stage_b_minimal_repair"]
        det = 1
        for i in range(len(alphas)):
            for j in range(i + 1, len(alphas)):
                det = det * (alphas[j] - alphas[i]) % P
        self.assertEqual(det, 12)
        self.assertNotEqual(det, 0)

    def test_subject_oracle_agree_before_compression(self):
        path = (
            Step(3, 7), Step(11, 5), Step(19, 2),
            Step(23, 29), Step(41, 13),
        )
        oracle = analyze_oracle(path)
        for stage in STAGES:
            subject = analyze_subject(path, stage)
            self.assertEqual(subject.endpoint, oracle.endpoint)
            self.assertEqual(subject.memory, oracle.memory)

    def test_equivalent_control_is_not_break(self):
        value = {
            "protocol": "break-recognition-v1",
            "stage": "stage_b_minimal_repair",
            "left": [{"x":1,"y":0},{"x":0,"y":1}],
            "right": [{"x":1,"y":0},{"x":0,"y":1}],
        }
        self.assertEqual(check_break(value)["status"], "NO_BREAK")

    def test_bool_is_not_integer_coordinate(self):
        value = {
            "protocol": "break-recognition-v1",
            "stage": "stage_a_blind_observer",
            "left": [{"x": True, "y":0},{"x":0,"y":1}],
            "right": [{"x":1,"y":0},{"x":0,"y":1}],
        }
        with self.assertRaises(ChallengeInputError):
            validate_submission(value)

    def test_duplicate_json_key_rejected(self):
        with self.assertRaises(StrictJSONError):
            loads_strict('{"a":1,"a":2}')

if __name__ == "__main__":
    unittest.main()
