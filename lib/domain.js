const claimLinks = {
  bank: "https://www.rbi.org.in/commonman/English/Scripts/FAQs.aspx?Id=2749",
  insurance: "https://irdai.gov.in/",
  loan: "https://sachet.rbi.org.in/",
  subscription: "https://www.npci.org.in/what-we-do/upi/product-overview",
};

const checklistMap = {
  insurance: {
    title: "Claim insurance within 30 days",
    priority: "Critical",
    note: "Gather policy documents, nominee identity proof, and death or disability certificate.",
  },
  loan: {
    title: "Stop EMI auto-debit",
    priority: "Critical",
    note: "Inform the lender immediately, freeze auto-debit risk, and request a hardship review.",
  },
  bank: {
    title: "Start nominee settlement for bank accounts",
    priority: "High",
    note: "Prevent misuse risk and begin survivor or nominee settlement with the bank.",
  },
  subscription: {
    title: "Cancel subscriptions",
    priority: "Medium",
    note: "Stop recurring UPI mandates and subscriptions before they keep draining the account.",
  },
};

const recoveryLanguages = new Set(["en", "ta", "hi"]);

const deadlineDaysByType = {
  insurance: 30,
  bank: 15,
  loan: 2,
  subscription: 1,
  default: 7,
};

const recoveryText = {
  en: {
    assistantTitle: "AI Recovery Assistant",
    summaryPrefix: "Action plan generated for",
    immediateHeader: "Immediate actions",
    claimLabel: "Claim",
    cancelLabel: "Cancel",
    settleLabel: "Settle",
    deadlinePrefix: "Target date",
    recipientLine: "To",
    subjectPrefix: "Subject",
    intro:
      "I am writing as the family nominee to request settlement support after a verified emergency event.",
    proofLine:
      "I am attaching certificate details, nominee identity proof, and account or policy references for verification.",
    requestClaim: "Please start the claim process and share the required final steps.",
    requestCancel: "Please cancel all active mandates and confirm that no further auto-debits will happen.",
    requestSettle:
      "Please share the exact settlement dues and the closure process so the family can complete it quickly.",
    closing: "Thank you for your support during this difficult time.",
  },
  ta: {
    assistantTitle: "AI Recovery Assistant",
    summaryPrefix: "செயல் திட்டம் உருவாக்கப்பட்டது",
    immediateHeader: "உடனடி நடவடிக்கைகள்",
    claimLabel: "கோரிக்கை",
    cancelLabel: "ரத்து",
    settleLabel: "தீர்வு",
    deadlinePrefix: "இலக்கு தேதி",
    recipientLine: "பெறுநர்",
    subjectPrefix: "தலைப்பு",
    intro:
      "சரிபார்க்கப்பட்ட அவசர நிகழ்வுக்குப் பிறகு குடும்ப நியமனராக நான் தீர்வு உதவி கோருகிறேன்.",
    proofLine:
      "சான்று விவரங்கள், நியமன அடையாள ஆவணம், மற்றும் கணக்கு அல்லது பாலிசி தகவல்களை இணைத்துள்ளேன்.",
    requestClaim: "தயவு செய்து கோரிக்கை செயல்முறையை தொடங்கி இறுதி படிகளை தெரிவிக்கவும்.",
    requestCancel: "தயவு செய்து அனைத்து செயலில் உள்ள மண்டேட்களை ரத்து செய்து இனி ஆட்டோ டெபிட் இல்லையென உறுதிசெய்யவும்.",
    requestSettle: "குடும்பம் விரைவாக முடிக்க சரியான நிலுவை தொகை மற்றும் முடிப்பு நடைமுறையை பகிரவும்.",
    closing: "இந்த கடின நேரத்தில் அளிக்கும் உதவிக்கு நன்றி.",
  },
  hi: {
    assistantTitle: "AI Recovery Assistant",
    summaryPrefix: "यह कार्य योजना बनाई गई",
    immediateHeader: "तुरंत करने वाले काम",
    claimLabel: "क्लेम",
    cancelLabel: "रद्द",
    settleLabel: "निपटान",
    deadlinePrefix: "लक्ष्य तिथि",
    recipientLine: "प्राप्तकर्ता",
    subjectPrefix: "विषय",
    intro:
      "सत्यापित आपात स्थिति के बाद, परिवार के नामांकित सदस्य के रूप में मैं निपटान सहायता का अनुरोध कर रहा हूं।",
    proofLine:
      "मैं प्रमाणपत्र विवरण, नामांकित सदस्य की पहचान और खाता या पॉलिसी संदर्भ संलग्न कर रहा हूं।",
    requestClaim: "कृपया क्लेम प्रक्रिया शुरू करें और अंतिम चरण बताएं।",
    requestCancel: "कृपया सभी सक्रिय मंडेट रद्द करें और आगे कोई ऑटो डेबिट न हो इसकी पुष्टि करें।",
    requestSettle: "कृपया सही बकाया राशि और समापन प्रक्रिया साझा करें ताकि परिवार जल्दी पूरा कर सके।",
    closing: "इस कठिन समय में सहयोग के लिए धन्यवाद।",
  },
};

function sanitizeType(type) {
  return checklistMap[type] ? type : "";
}

function maskId(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  const suffix = trimmed.slice(-4);
  return `XXXX${suffix}`;
}

function countVerifiedNominees(nominees) {
  return nominees.filter((nominee) => nominee.verificationStatus === "verified").length;
}

function calculateReadiness(assets, nominees) {
  if (!assets.length) {
    return 15;
  }

  const mappedAssets = assets.filter((asset) => asset.discoveryStatus === "mapped").length;
  const linkedAssets = assets.filter((asset) => asset.nomineeId).length;
  const verifiedNominees = countVerifiedNominees(nominees);
  const releaseReadyAssets = assets.filter((asset) => asset.accessLevel === "protected").length;

  const mappingScore = Math.round((mappedAssets / assets.length) * 30);
  const nomineeScore = nominees.length
    ? Math.round((verifiedNominees / nominees.length) * 30)
    : 0;
  const coverageScore = Math.round((linkedAssets / assets.length) * 25);
  const releaseScore = Math.round((releaseReadyAssets / assets.length) * 15);

  return Math.min(100, mappingScore + nomineeScore + coverageScore + releaseScore);
}

function buildInsights(assets, nominees) {
  const unlinkedAssets = assets.filter((asset) => !asset.nomineeId).length;
  const pendingNominees = nominees.filter(
    (nominee) => nominee.verificationStatus !== "verified"
  ).length;
  const activeAutoDebits = assets.filter((asset) => asset.autoDebit).length;

  return [
    {
      label: "Shock Protection Score",
      value: `${calculateReadiness(assets, nominees)}%`,
      tone: "primary",
    },
    {
      label: "Assets Without Nominee",
      value: String(unlinkedAssets),
      tone: unlinkedAssets ? "warning" : "success",
    },
    {
      label: "Pending Verifications",
      value: String(pendingNominees),
      tone: pendingNominees ? "warning" : "success",
    },
    {
      label: "Live Auto-Debits",
      value: String(activeAutoDebits),
      tone: activeAutoDebits ? "warning" : "success",
    },
  ];
}

function buildChecklist({ triggerType, assets, nominees, createId, claimLinks, checklistMap }) {
  const seenTypes = new Set();
  const checklist = [];

  assets.forEach((asset) => {
    if (!seenTypes.has(asset.type) && checklistMap[asset.type]) {
      seenTypes.add(asset.type);
      checklist.push({
        id: createId(),
        category: asset.type,
        title: checklistMap[asset.type].title,
        priority: checklistMap[asset.type].priority,
        note: checklistMap[asset.type].note,
        institution: asset.provider,
        link: claimLinks[asset.type],
        actionLabel:
          asset.type === "subscription"
            ? "Open cancellation guidance"
            : "Open claim guidance",
      });
    }

    if (!asset.nomineeId) {
      checklist.push({
        id: createId(),
        category: asset.type,
        title: `Assign or confirm nominee for ${asset.name || asset.provider || asset.type}`,
        priority: "High",
        note: "This asset has no nominee mapping, which can delay access for the family during a shock event.",
        institution: asset.provider,
        link: claimLinks[asset.type],
        actionLabel: "View institution guidance",
      });
    }

    if (asset.autoDebit) {
      checklist.push({
        id: createId(),
        category: asset.type,
        title: `Review auto-debit on ${asset.provider}`,
        priority: asset.type === "loan" ? "Critical" : "High",
        note: "This payment can continue even after death or disability if the family does not act.",
        institution: asset.provider,
        link: claimLinks[asset.type],
        actionLabel: "Open payment guidance",
      });
    }
  });

  nominees
    .filter((nominee) => nominee.verificationStatus !== "verified")
    .forEach((nominee) => {
      checklist.push({
        id: createId(),
        category: "verification",
        title: `Verify nominee identity for ${nominee.name}`,
        priority: "High",
        note: "Protected access should not release until nominee verification is completed.",
        institution: "DAAYAM Vault",
        link: "",
        actionLabel: "Complete verification",
      });
    });

  if (!nominees.length) {
    checklist.push({
      id: createId(),
      category: "nominee",
      title: "Add at least one verified nominee",
      priority: "Critical",
      note: "No family member is currently verified to receive emergency access.",
      institution: "DAAYAM Vault",
      link: "",
      actionLabel: "Add family member",
    });
  }

  checklist.unshift({
    id: createId(),
    category: "nominee",
    title:
      triggerType === "disability"
        ? "Start disability support release"
        : "Start family access release",
    priority: "Critical",
    note:
      triggerType === "disability"
        ? "Protected vault access is being prepared for a verified disability event."
        : "Protected vault access is being prepared for a verified death event.",
    institution: "DAAYAM Vault",
    link: "",
    actionLabel: "Review release summary",
  });

  return checklist;
}

function buildFamilyAccessState({ triggerType, isReleased, verifiedNomineeCount }) {
  return {
    triggerType,
    vaultStatus: isReleased ? "released" : "protected",
    releaseSummary: isReleased
      ? `Access released to ${verifiedNomineeCount} verified family member${
          verifiedNomineeCount === 1 ? "" : "s"
        }.`
      : "Vault remains protected until death or disability is verified.",
    releaseRequirements: [
      "Verified nominee identity",
      "Death or disability confirmation",
      "Asset to nominee mapping",
    ],
  };
}

function normalizeLanguage(language) {
  const candidate = String(language || "").toLowerCase();
  return recoveryLanguages.has(candidate) ? candidate : "en";
}

function getDeadlineDate(baseDate, daysToAdd) {
  const date = new Date(baseDate || Date.now());
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

function dedupeBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getActionForAssetType(assetType, text) {
  if (assetType === "loan") {
    return { code: "settle", label: text.settleLabel, requestText: text.requestSettle };
  }

  if (assetType === "subscription") {
    return { code: "cancel", label: text.cancelLabel, requestText: text.requestCancel };
  }

  return { code: "claim", label: text.claimLabel, requestText: text.requestClaim };
}

function buildRecoveryAssistant({
  triggerType,
  assets,
  nominees,
  emergencyVerification,
  claimantName,
  claimantRelation,
  language,
}) {
  const selectedLanguage = normalizeLanguage(language);
  const text = recoveryText[selectedLanguage];
  const eventDate = emergencyVerification?.verifiedAt || new Date().toISOString();
  const primaryNominee = nominees.find((nominee) => nominee.verificationStatus === "verified") || nominees[0];
  const resolvedClaimantName = String(claimantName || primaryNominee?.name || "Family nominee").trim();
  const resolvedRelation = String(claimantRelation || primaryNominee?.relation || "Nominee").trim();

  const immediateActions = [
    {
      id: "documents",
      title:
        selectedLanguage === "ta"
          ? "சான்றிதழ் மற்றும் அடையாள ஆவணங்களை தயார் செய்யவும்"
          : selectedLanguage === "hi"
            ? "प्रमाणपत्र और पहचान दस्तावेज तैयार रखें"
            : "Keep certificate and identity documents ready",
      deadlineDays: 1,
      deadlineDate: getDeadlineDate(eventDate, 1).toISOString(),
      priority: "Critical",
    },
  ];

  const assetTasks = assets.map((asset, index) => {
    const deadlineDays = deadlineDaysByType[asset.type] || deadlineDaysByType.default;
    const action = getActionForAssetType(asset.type, text);
    const subjectName = asset.name || asset.provider || asset.type;

    return {
      id: `asset-${index + 1}`,
      category: asset.type,
      action: action.code,
      actionLabel: action.label,
      title: `${action.label}: ${subjectName}`,
      institution: asset.provider || "Institution",
      deadlineDays,
      deadlineDate: getDeadlineDate(eventDate, deadlineDays).toISOString(),
      priority: deadlineDays <= 2 ? "Critical" : deadlineDays <= 15 ? "High" : "Medium",
      note:
        selectedLanguage === "ta"
          ? `இது ${deadlineDays} நாட்களுக்குள் முடிக்கப்பட வேண்டும்.`
          : selectedLanguage === "hi"
            ? `इसे ${deadlineDays} दिनों के भीतर पूरा करना चाहिए।`
            : `Complete this within ${deadlineDays} days to avoid delays or losses.`,
    };
  });

  const tasks = immediateActions.concat(assetTasks);

  const letters = dedupeBy(assets, (asset) => `${asset.type}:${asset.provider || ""}`).map(
    (asset, index) => {
      const action = getActionForAssetType(asset.type, text);
      const subjectEntity = asset.name || asset.type;
      const provider = asset.provider || "Institution";
      const subject = `${action.label} request for ${subjectEntity}`;

      return {
        id: `letter-${index + 1}`,
        language: selectedLanguage,
        institution: provider,
        assetType: asset.type,
        subject,
        body: [
          `${text.recipientLine}: ${provider}`,
          `${text.subjectPrefix}: ${subject}`,
          "",
          text.intro,
          `${text.proofLine}`,
          action.requestText,
          "",
          `${triggerType === "disability" ? "Event" : "Event"}: ${triggerType}`,
          `Certificate: ${emergencyVerification?.certificateType || ""} ${emergencyVerification?.certificateNumber || ""}`,
          `Claimant: ${resolvedClaimantName} (${resolvedRelation})`,
          "",
          text.closing,
        ].join("\n"),
      };
    }
  );

  return {
    language: selectedLanguage,
    title: text.assistantTitle,
    summary: `${text.summaryPrefix}: ${resolvedClaimantName}`,
    sectionLabel: text.immediateHeader,
    deadlinePrefix: text.deadlinePrefix,
    claimant: {
      name: resolvedClaimantName,
      relation: resolvedRelation,
    },
    tasks,
    letters,
  };
}

module.exports = {
  claimLinks,
  checklistMap,
  recoveryLanguages,
  sanitizeType,
  maskId,
  countVerifiedNominees,
  calculateReadiness,
  buildInsights,
  buildChecklist,
  buildFamilyAccessState,
  buildRecoveryAssistant,
};
