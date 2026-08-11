import { subjectTarget } from "./subject.mjs";
import { oracleTarget } from "./oracle.mjs";
import { referenceTarget } from "./reference.mjs";
import { observerHorner, observerMatrix, reconstructTarget } from "./observer.mjs";

function arrayEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function stateEqual(left, right) {
  return arrayEqual(left.endpoint, right.endpoint) &&
    arrayEqual(left.integerEndpoint, right.integerEndpoint) &&
    arrayEqual(left.target, right.target);
}

export function verifyRouteFaithfulness(route, stage, genesis) {
  const subject = subjectTarget(route);
  const oracle = oracleTarget(route);
  const reference = referenceTarget(route);
  const implementationsAgree = stateEqual(subject, oracle) && stateEqual(subject, reference);
  const points = (stage === "A" ? genesis.stage_a.observer_points : genesis.stage_b.observer_points).map(BigInt);

  let observerAgreement = false;
  let observerCode = [];
  let reconstructedTarget = null;
  let reconstructionCloses = stage === "A";

  if (implementationsAgree) {
    const horner = observerHorner(subject.target, points);
    const matrix = observerMatrix(subject.target, points);
    observerAgreement = arrayEqual(horner, matrix);
    observerCode = horner;
    if (stage === "B" && observerAgreement) {
      reconstructedTarget = reconstructTarget(observerCode, points);
      reconstructionCloses = arrayEqual(reconstructedTarget, subject.target);
    }
  }

  return Object.freeze({
    closed: implementationsAgree && observerAgreement && reconstructionCloses,
    implementationsAgree,
    observerAgreement,
    reconstructionCloses,
    endpoint: subject.endpoint,
    integerEndpoint: subject.integerEndpoint,
    target: subject.target,
    observerCode: Object.freeze(observerCode),
    reconstructedTarget: reconstructedTarget ? Object.freeze(reconstructedTarget) : null,
  });
}
