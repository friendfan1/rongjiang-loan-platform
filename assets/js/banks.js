/**
 * 银行机构配置
 * Logo 文件放在 assets/images/banks/{id}.png
 */
window.BANK_REGISTRY = [
  {
    id: "icb",
    match: ["工商银行"],
    shortName: "工商银行",
    color: "#C8102E",
    logo: "assets/images/banks/icb",
  },
  {
    id: "abc",
    match: ["农业银行"],
    shortName: "农业银行",
    color: "#009174",
    logo: "assets/images/banks/abc",
  },
  {
    id: "ccb",
    match: ["建设银行"],
    shortName: "建设银行",
    color: "#003A8F",
    logo: "assets/images/banks/ccb",
  },
  {
    id: "psbc",
    match: ["邮政储蓄"],
    shortName: "邮储银行",
    color: "#007A53",
    logo: "assets/images/banks/psbc",
  },
  {
    id: "adbc",
    match: ["农业发展银行"],
    shortName: "农发行",
    color: "#B8952B",
    logo: "assets/images/banks/adbc",
  },
  {
    id: "guizhou",
    match: ["贵州银行"],
    shortName: "贵州银行",
    color: "#E60012",
    logo: "assets/images/banks/guizhou",
  },
  {
    id: "guiyang",
    match: ["贵阳银行"],
    shortName: "贵阳银行",
    color: "#E60012",
    logo: "assets/images/banks/guiyang",
  },
  {
    id: "rrcu",
    match: ["农村信用", "农信"],
    shortName: "榕江农信",
    color: "#00A04A",
    logo: "assets/images/banks/rrcu",
  },
];

window.resolveBank = function resolveBank(bankName) {
  if (!bankName) return null;
  for (var i = 0; i < BANK_REGISTRY.length; i++) {
    var bank = BANK_REGISTRY[i];
    for (var j = 0; j < bank.match.length; j++) {
      if (bankName.indexOf(bank.match[j]) !== -1) return bank;
    }
  }
  return null;
};

window.getBankLogoSrc = function getBankLogoSrc(bank) {
  if (!bank) return "";
  return bank.logo + ".png";
};

window.renderBankLogo = function renderBankLogo(bankName, className, alt) {
  var bank = resolveBank(bankName);
  if (!bank) {
    return (
      '<span class="bank-logo-fallback ' +
      (className || "") +
      '" aria-hidden="true">银</span>'
    );
  }
  var cls = "bank-logo-img " + (className || "");
  var png = bank.logo + ".png";
  var svg = bank.logo + ".svg";
  return (
    '<img class="' +
    cls +
    '" src="' +
    png +
    '" alt="' +
    (alt || bank.shortName) +
    '" data-bank-id="' +
    bank.id +
    '" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'' +
    svg +
    "';}else{this.style.display='none';}\">"
  );
};
