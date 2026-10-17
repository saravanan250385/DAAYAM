const test = require("node:test");
const assert = require("node:assert/strict");
const {
  claimLinks,
  checklistMap,
  sanitizeType,
  maskId,
  calculateReadiness,
  buildChecklist,
  buildFamilyAccessState,
  buildRecoveryAssistant,
} = require("../lib/domain");

test("sanitizeType accepts known types only", () => {
  assert.equal(sanitizeType("bank"), "bank");
  assert.equal(sanitizeType("loan"), "loan");
  assert.equal(sanitizeType("unknown"), "");
});

test("maskId keeps only last 4 chars", () => {
  assert.equal(maskId("ABCDE1234F"), "XXXX234F");
  assert.equal(maskId(" 1234 "), "XXXX1234");
  assert.equal(maskId(""), "");
});

test("calculateReadiness returns baseline when no assets", () => {
  assert.equal(calculateReadiness([], []), 15);
});

test("calculateReadiness computes weighted score", () => {
  const assets = [
    { discoveryStatus: "mapped", nomineeId: "n1", accessLevel: "protected" },
    { discoveryStatus: "mapped", nomineeId: "", accessLevel: "protected" },
  ];
  const nominees = [{ verificationStatus: "verified" }, { verificationStatus: "pending" }];

  assert.equal(calculateReadiness(assets, nominees), 73);
});

test("buildChecklist includes release action and nominee warnings", () => {
  const createId = (() => {
    let i = 0;
    return () => `id-${++i}`;
  })();

  const assets = [
    {
      type: "bank",
      provider: "Demo Bank",
      name: "Savings",
      nomineeId: "",
      autoDebit: true,
    },
  ];
  const nominees = [{ name: "Asha", verificationStatus: "pending" }];

  const checklist = buildChecklist({
    triggerType: "death",
    assets,
    nominees,
    createId,
    claimLinks,
    checklistMap,
  });

  assert.equal(checklist[0].title, "Start family access release");
  assert.ok(checklist.some((item) => item.title.includes("Assign or confirm nominee")));
  assert.ok(checklist.some((item) => item.title.includes("Review auto-debit")));
  assert.ok(checklist.some((item) => item.title.includes("Verify nominee identity")));
});

test("buildFamilyAccessState uses pluralization correctly", () => {
  const single = buildFamilyAccessState({
    triggerType: "death",
    isReleased: true,
    verifiedNomineeCount: 1,
  });
  const plural = buildFamilyAccessState({
    triggerType: "death",
    isReleased: true,
    verifiedNomineeCount: 2,
  });

  assert.match(single.releaseSummary, /1 verified family member\.$/);
  assert.match(plural.releaseSummary, /2 verified family members\.$/);
});

test("buildRecoveryAssistant builds tasks and letters in selected language", () => {
  const data = buildRecoveryAssistant({
    triggerType: "death",
    assets: [
      { type: "insurance", provider: "LIC", name: "Term Cover" },
      { type: "subscription", provider: "Google Pay", name: "UPI Mandates" },
    ],
    nominees: [{ name: "Meera", relation: "Spouse", verificationStatus: "verified" }],
    emergencyVerification: {
      verifiedAt: "2026-04-10T10:00:00.000Z",
      certificateType: "Death Certificate",
      certificateNumber: "ABCD-1001",
    },
    claimantName: "Meera",
    claimantRelation: "Spouse",
    language: "hi",
  });

  assert.equal(data.language, "hi");
  assert.equal(data.claimant.name, "Meera");
  assert.ok(data.tasks.length >= 3);
  assert.equal(data.letters.length, 2);
  assert.match(data.letters[0].body, /प्राप्तकर्ता/);
});

test("buildRecoveryAssistant falls back to english for unknown language", () => {
  const data = buildRecoveryAssistant({
    triggerType: "disability",
    assets: [{ type: "loan", provider: "SBI" }],
    nominees: [],
    emergencyVerification: {
      verifiedAt: "2026-04-10T10:00:00.000Z",
      certificateType: "Disability Certificate",
      certificateNumber: "CERT-99",
    },
    language: "xx",
  });

  assert.equal(data.language, "en");
  assert.match(data.summary, /Action plan generated/);
});
