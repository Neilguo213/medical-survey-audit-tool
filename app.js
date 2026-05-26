const templates = {
  blood: {
    name: "血液肿瘤",
    sample: `1 首次就诊时间: 2026-03-24
2 患者姓名首字母缩写: luhg
3 年龄: 57
4 性别: 男
5 患者身高(cm): 173
6 患者体重(kg): 65
7 体表面积(m²): 2
8 病例来源: 血液科
9 主诉症状: 骨痛, 体重下降
15 疾病类型: 多发性骨髓瘤（MM）
16 病理亚型/分型: 多发性骨髓瘤 ISS I期 R-ISS III期
17 细胞遗传学/分子生物学异常: 其它 1q21
20 ISS分期: Ⅲ期
21 评估日期: 2026-03-24
22 ECOG评分: 0
23 Hb: 134
24 WBC: 5
25 PLT: 98
26 ANC: 3
27 骨髓检查原始细胞比例: 0
29 流式免疫分型: CD38, CD19
32 PET-CT SUVmax: 2
34 LVEF: 76
35 eGFR: 76
36 治疗类型: 造血干细胞移植
37 移植类型: 自体移植
38 预处理方案: 大剂量马法兰
39 治疗开始日期: 2025-10-24
40 是否联合用药: 是 KRD
41 疗效评估日期: 2026-03-24
44 骨髓瘤疗效: 严格意义的完全缓解（sCR）
45 MRD状态: 阴性（灵敏度）
47 生活质量总分: 1
48 是否按时服药: 否
49 是否自行调整剂量: 否
50 是否因副作用停药: 是
51 服药困难程度: 无困难
52 注射/输注治疗是否按时: 是
53 是否出现不良反应: 无
54 随访日期: 2026-05-23
55 生存状态: 存活
56 复发情况: 无复发`,
    fields: [
      field("1", "首次就诊时间", "date", "完整日期；应不晚于评估、治疗和随访日期"),
      field("2", "患者姓名首字母缩写", "text", "4位拼音缩写，避免真实姓名"),
      field("3", "年龄", "number", "0-120岁", 0, 120),
      field("4", "性别", "choice", "男/女"),
      field("5", "患者身高(cm)", "number", "成人常见120-220cm", 120, 220),
      field("6", "患者体重(kg)", "number", "成人常见30-150kg", 30, 150),
      field("7", "体表面积(m²)", "number", "成人常见1.2-2.4m²，应由身高体重计算", 1.2, 2.4),
      field("8", "病例来源", "choice", "血液科/肿瘤科/移植科/其他"),
      field("9", "主诉症状", "multi", "发热、乏力、出血倾向、骨痛、淋巴结肿大、肝脾肿大、体重下降等"),
      field("10", "吸烟史", "choice", "是/否；是需补年限和支数"),
      field("11", "饮酒史", "choice", "是/否；是需补每日ml和每周次数"),
      field("12", "家族史", "choice", "血液肿瘤/其他恶性肿瘤/遗传性疾病/无"),
      field("13", "既往病史", "choice", "自身免疫病/感染性疾病/移植史/其他/无"),
      field("14", "过敏史", "choice", "无/有；有需写明过敏原和反应"),
      field("15", "疾病类型", "choice", "AML/ALL/CML/CLL/NHL/HL/MM/MDS/其他"),
      field("16", "病理亚型/分型", "text", "填写具体亚型、ISS/R-ISS、轻链类型等"),
      field("17", "细胞遗传学/分子生物学异常", "multi", "填写具体异常；其他项需补检测结果"),
      field("18", "分期", "choice", "I-IV期，需明确分期体系"),
      field("19", "IPI/R-IPI评分", "text", "淋巴瘤IPI 0-5；非淋巴瘤填不适用"),
      field("20", "ISS分期", "choice", "骨髓瘤I/II/III期；需β2-MG和白蛋白依据"),
      field("21", "治疗前评估日期", "date", "应在治疗开始前", undefined, undefined, ["治疗前评估评估日期", "治疗前评估日期"]),
      field("22", "ECOG评分", "number", "0-4分", 0, 4),
      field("23", "Hb", "number", "g/L；成人常见60-180", 60, 180),
      field("24", "WBC", "number", "×10^9/L；成人常见3.5-9.5", 0, 300),
      field("25", "PLT", "number", "×10^9/L；常见100-300", 0, 1000),
      field("26", "ANC", "number", "×10^9/L；常见1.8-6.3", 0, 100),
      field("27", "骨髓检查原始细胞比例", "number", "%；白血病适用，MM需补浆细胞比例", 0, 100),
      field("28", "骨髓增生程度", "choice", "活跃/减低/重度减低"),
      field("29", "流式免疫分型", "text", "MM建议含CD38、CD138、轻链限制等"),
      field("30", "CT/MRI淋巴结最大径", "number", "cm；注明部位", 0, 20),
      field("31", "肝/脾大小", "text", "正常或具体长径/肋下cm"),
      field("32", "PET-CT SUVmax", "number", "常见0-50+，需注明病灶", 0, 80),
      field("33", "Deauville评分", "number", "1-5分，主要用于淋巴瘤", 1, 5),
      field("34", "LVEF", "number", "%；正常多≥50-55", 20, 90),
      field("35", "eGFR", "number", "mL/min/1.73m²；≥90正常，60-89轻度下降", 0, 200),
      field("36", "治疗类型", "choice", "化疗/靶向/免疫/CAR-T/移植/放疗/支持治疗"),
      field("37", "移植类型", "choice", "自体移植/异体移植"),
      field("38", "预处理方案", "text", "需写方案和剂量，如马法兰200mg/m²或减量依据"),
      field("39", "治疗开始日期", "date", "应晚于治疗前评估"),
      field("40", "是否联合用药", "choice", "是/否；是需写药物、剂量、周期"),
      field("41", "疗效评估日期", "date", "应晚于治疗开始", undefined, undefined, ["疗效评价评估日期", "疗效评估评估日期", "疗效评价日期"]),
      field("42", "白血病疗效", "choice", "CR/CRi/PR/SD/复发进展，仅白血病适用"),
      field("43", "淋巴瘤疗效", "choice", "CR/PR/SD/PD，仅淋巴瘤适用"),
      field("44", "骨髓瘤疗效", "choice", "sCR/CR/VGPR/PR，按IMWG标准"),
      field("45", "MRD状态", "choice", "阳性/阴性；阴性需注明灵敏度，如10^-5或10^-6"),
      field("46", "影像学复查淋巴结变化", "choice", "消失/缩小/无变化/增大新发"),
      field("47", "生活质量总分", "number", "EORTC QLQ-C30转换分通常0-100", 0, 100),
      field("48", "是否按时服药", "choice", "是/否；否需说明原因"),
      field("49", "是否自行调整剂量", "choice", "是/否；是需说明原因和幅度"),
      field("50", "是否因副作用停药", "choice", "是/否；是需补不良反应"),
      field("51", "服药困难程度", "choice", "无困难/轻度/中度/重度"),
      field("52", "注射/输注治疗是否按时", "choice", "是/否"),
      field("53", "是否出现不良反应", "choice", "无/有；有需补类型、日期、CTCAE、处理"),
      field("54", "随访日期", "date", "应晚于治疗和疗效评估"),
      field("55", "生存状态", "choice", "存活/死亡；死亡需补日期和原因"),
      field("56", "复发情况", "choice", "无复发/复发；复发需补日期和部位")
    ],
    checks: [checkBsa, checkBloodTimeline, checkBloodStaging, checkMyelomaEvidence, checkAdverseEventConflict]
  },
  breast: {
    name: "乳腺癌",
    sample: `1 首次就诊时间: 2026-02-21
3 年龄: 46
4 性别: 女
5 身高: 153
6 体重: 51
7 BMI: 33.3
15 病理类型: 浸润性导管癌
16 分子分型: HR+/HER2+
17 TNM分期: T1N0M0
18 临床分期: I期
24 淋巴结状态: 阳性 数量1
30 治疗开始时间: 2026-03-01
32 评估日期: 2026-07-01
33 RECIST: 完全缓解
39 是否因副作用停药: 是
41 是否出现不良反应: 无`,
    fields: [
      field("1", "首次就诊时间", "date", "完整日期"),
      field("3", "年龄", "number", "0-120岁", 0, 120),
      field("4", "性别", "choice", "男/女"),
      field("5", "身高", "number", "cm；成人常见120-220", 120, 220),
      field("6", "体重", "number", "kg；成人常见30-150", 30, 150),
      field("7", "BMI", "number", "kg/m²；成人常见15-45，应由身高体重计算", 10, 60),
      field("15", "病理类型", "choice", "浸润性导管癌/小叶癌/原位癌等"),
      field("16", "分子分型", "choice", "HR+/HER2-、HR+/HER2+、HR-/HER2+、三阴性"),
      field("17", "TNM分期", "text", "按AJCC第8版"),
      field("18", "临床分期", "choice", "I-IV期"),
      field("24", "淋巴结状态", "choice", "阴性/阳性，阳性需数量"),
      field("30", "治疗开始时间", "date", "应晚于治疗前评估"),
      field("32", "疗效评估日期", "date", "应晚于治疗开始", undefined, undefined, ["疗效评价评估日期", "疗效评价日期", "评估日期"]),
      field("33", "RECIST", "choice", "CR/PR/SD/PD"),
      field("39", "是否因副作用停药", "choice", "是/否"),
      field("41", "是否出现不良反应", "choice", "无/有")
    ],
    checks: [checkBmi, checkBreastTimeline, checkBreastNodeStage, checkAdverseEventConflict]
  }
};

function field(id, label, type, range, min, max, aliases = []) {
  return { id, label, type, range, min, max, aliases };
}

function parseCase(input, template) {
  const rows = input.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const answers = {};
  const claimedRows = new Set();

  const parsedRows = rows.map((row, index) => {
    const split = splitQuestionAnswer(row);
    return {
      index,
      raw: row,
      question: normalizeQuestion(split.question),
      value: normalizeValue(split.value)
    };
  }).filter(row => row.value);

  for (const item of template.fields) {
    const match = findBestQuestionMatch(item, parsedRows, claimedRows);
    if (match) {
      answers[item.id] = match.value;
      claimedRows.add(match.index);
    }
  }

  return answers;
}

function splitQuestionAnswer(row) {
  const match = row.match(/^(.*?)[：:]\s*(.+)$/);
  if (!match) return { question: row, value: "" };
  return {
    question: match[1].replace(/^\d+\s*[、.．]?\s*/, "").trim(),
    value: match[2]
  };
}

function findBestQuestionMatch(item, rows, claimedRows) {
  const tokens = getQuestionTokens(item);
  let best = null;
  for (const row of rows) {
    if (claimedRows.has(row.index)) continue;
    const score = scoreQuestionMatch(tokens, row.question);
    if (score > 0 && (!best || score > best.score)) best = { ...row, score };
  }
  return best && best.score >= 2 ? best : null;
}

function getQuestionTokens(item) {
  const base = [item.label, ...(item.aliases || [])];
  return base.map(normalizeQuestion).filter(Boolean);
}

function scoreQuestionMatch(tokens, question) {
  let score = 0;
  for (const token of tokens) {
    if (!token) continue;
    if (question === token) score = Math.max(score, 10);
    else if (question.includes(token)) score = Math.max(score, Math.min(9, token.length));
    else if (token.includes(question) && question.length >= 4) score = Math.max(score, 3);
  }
  return score;
}

function normalizeQuestion(value) {
  return String(value ?? "")
    .replace(/^\d+\s*[、.．]?\s*/, "")
    .replace(/[\s\-—_：:，,。；;（）()\[\]【】]/g, "")
    .replace(/请填写|请选择|患者|您的|您所在的/g, "")
    .trim();
}

function normalizeValue(value) {
  return String(value)
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value) {
  const matched = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return matched ? Number(matched[0]) : NaN;
}

function toDate(value) {
  const matched = String(value ?? "").match(/\d{4}[-/年.]\d{1,2}[-/月.]\d{1,2}/);
  if (!matched) return null;
  const normalized = matched[0].replace(/[年月/.]/g, "-").replace(/日/g, "");
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function includesAny(value, terms) {
  const text = String(value ?? "");
  return terms.some(term => text.includes(term));
}

function baseFieldChecks(answers, template) {
  const issues = [];
  for (const item of template.fields) {
    const value = answers[item.id];
    if (!value) {
      issues.push(issue("low", item, "未识别到填写值。", `填写要求：${item.range}`));
      continue;
    }
    if (item.type === "number") {
      const n = toNumber(value);
      if (Number.isNaN(n)) {
        issues.push(issue("medium", item, "应填写数值，当前无法识别为数字。", `填写范围：${item.range}`));
      } else if (item.min !== undefined && (n < item.min || n > item.max)) {
        issues.push(issue("high", item, `数值 ${n} 超出建议范围。`, `填写范围：${item.range}`));
      }
    }
    if (item.type === "date" && !toDate(value)) {
      issues.push(issue("medium", item, "日期格式无法识别。", "建议使用 YYYY-MM-DD。"));
    }
  }
  return issues;
}

function issue(level, item, message, relation, value = "") {
  return {
    level,
    id: item.id,
    label: item.label,
    value,
    message,
    relation
  };
}

function checkBsa(answers, template) {
  const h = toNumber(answers["5"]);
  const w = toNumber(answers["6"]);
  const bsa = toNumber(answers["7"]);
  if ([h, w, bsa].some(Number.isNaN)) return [];
  const expected = Math.sqrt((h * w) / 3600);
  if (Math.abs(expected - bsa) > 0.12) {
    return [issue("high", template.fields.find(f => f.id === "7"), `体表面积与身高体重不一致，按公式约为 ${expected.toFixed(2)} m²。`, "Q7 应由 Q5 身高和 Q6 体重计算；会影响马法兰、化疗等剂量。", answers["7"])];
  }
  return [];
}

function checkBmi(answers, template) {
  const h = toNumber(answers["5"]);
  const w = toNumber(answers["6"]);
  const bmi = toNumber(answers["7"]);
  if ([h, w, bmi].some(Number.isNaN)) return [];
  const expected = w / Math.pow(h / 100, 2);
  if (Math.abs(expected - bmi) > 0.5) {
    return [issue("high", template.fields.find(f => f.id === "7"), `BMI 与身高体重不一致，按公式约为 ${expected.toFixed(1)} kg/m²。`, "Q7 应由 Q5 身高和 Q6 体重计算。", answers["7"])];
  }
  return [];
}

function checkBloodTimeline(answers, template) {
  const first = toDate(answers["1"]);
  const baseline = toDate(answers["21"]);
  const start = toDate(answers["39"]);
  const response = toDate(answers["41"]);
  const follow = toDate(answers["54"]);
  const item = template.fields.find(f => f.id === "39");
  const issues = [];
  if (first && start && start < first) {
    issues.push(issue("high", item, "治疗开始日期早于首次就诊时间。", "Q39 应晚于或等于 Q1；若为院外既往治疗需说明。", answers["39"]));
  }
  if (baseline && start && start < baseline) {
    issues.push(issue("high", item, "治疗开始日期早于治疗前评估日期。", "Q39 应晚于 Q21。", answers["39"]));
  }
  if (start && response && response < start) {
    issues.push(issue("high", template.fields.find(f => f.id === "41"), "疗效评估早于治疗开始。", "Q41 应晚于 Q39。", answers["41"]));
  }
  if (response && follow && follow < response) {
    issues.push(issue("medium", template.fields.find(f => f.id === "54"), "随访日期早于疗效评估日期。", "Q54 通常应晚于 Q41。", answers["54"]));
  }
  return issues;
}

function checkBreastTimeline(answers, template) {
  const first = toDate(answers["1"]);
  const start = toDate(answers["30"]);
  const response = toDate(answers["32"]);
  const issues = [];
  if (first && start && start < first) {
    issues.push(issue("high", template.fields.find(f => f.id === "30"), "治疗开始时间早于首次就诊时间。", "Q30 应晚于 Q1。", answers["30"]));
  }
  if (start && response && response < start) {
    issues.push(issue("high", template.fields.find(f => f.id === "32"), "疗效评估早于治疗开始。", "Q32 应晚于 Q30。", answers["32"]));
  }
  return issues;
}

function checkBloodStaging(answers, template) {
  const issues = [];
  if (includesAny(answers["15"], ["骨髓瘤", "MM"]) && answers["16"] && answers["20"]) {
    const q16 = answers["16"];
    const q20 = answers["20"];
    if ((q16.includes("ISS I") || q16.includes("ISS Ⅰ")) && includesAny(q20, ["III", "Ⅲ", "3"])) {
      issues.push(issue("high", template.fields.find(f => f.id === "20"), "ISS 分期与病理/分型描述冲突。", "Q20 应与 Q16 中记录的 ISS 分期一致，并有 β2微球蛋白、白蛋白依据。", answers["20"]));
    }
  }
  if (includesAny(answers["15"], ["骨髓瘤", "MM"]) && answers["33"]) {
    issues.push(issue("low", template.fields.find(f => f.id === "33"), "Deauville 评分主要用于淋巴瘤，骨髓瘤使用时需说明依据。", "Q33 与 Q15 疾病类型存在适用性检查。", answers["33"]));
  }
  return issues;
}

function checkMyelomaEvidence(answers, template) {
  const issues = [];
  if (!includesAny(answers["15"], ["骨髓瘤", "MM"])) return issues;
  if (answers["27"] && toNumber(answers["27"]) === 0) {
    issues.push(issue("medium", template.fields.find(f => f.id === "27"), "骨髓瘤病例应记录骨髓浆细胞比例，原始细胞比例 0% 不能支持 MM 诊断或 sCR。", "Q27 与 Q15、Q44、Q45 强关联。", answers["27"]));
  }
  if (answers["44"] && includesAny(answers["44"], ["sCR", "严格"])) {
    issues.push(issue("medium", template.fields.find(f => f.id === "44"), "sCR 需补免疫固定阴性、FLC比值正常、骨髓浆细胞<5%、无浆细胞瘤等证据。", "Q44 应由 Q27、Q29、Q45、影像和实验室结果支持。", answers["44"]));
  }
  if (answers["45"] && includesAny(answers["45"], ["阴性"]) && !/10\^-?\d|10-\d|灵敏度\s*\d/i.test(answers["45"])) {
    issues.push(issue("medium", template.fields.find(f => f.id === "45"), "MRD 阴性需注明检测方法和灵敏度。", "Q45 与 Q44 深度缓解、Q56 复发风险相关。", answers["45"]));
  }
  return issues;
}

function checkBreastNodeStage(answers, template) {
  if (includesAny(answers["17"], ["N0"]) && includesAny(answers["24"], ["阳性"])) {
    return [issue("high", template.fields.find(f => f.id === "17"), "TNM N0 与淋巴结阳性冲突。", "Q17、Q18、Q24 必须一致。", answers["17"])];
  }
  return [];
}

function checkAdverseEventConflict(answers, template) {
  const stopId = template.name === "血液肿瘤" ? "50" : "39";
  const aeId = template.name === "血液肿瘤" ? "53" : "41";
  if (includesAny(answers[stopId], ["是"]) && includesAny(answers[aeId], ["无", "否"])) {
    return [issue("high", template.fields.find(f => f.id === aeId), "因副作用停药=是，但不良反应填写为无。", `${stopId} 与 ${aeId} 存在直接逻辑冲突，应补不良反应类型、日期、CTCAE分级和处理措施。`, answers[aeId])];
  }
  return [];
}

function runAudit() {
  const template = templates[templateSelect.value];
  const answers = parseCase(caseInput.value, template);
  const issues = [
    ...baseFieldChecks(answers, template),
    ...template.checks.flatMap(check => check(answers, template))
  ];
  renderRecognized(answers, template);
  renderResults(issues);
}

async function extractFromUrl() {
  const url = surveyUrlInput.value.trim();
  if (!url) {
    linkStatus.textContent = "请先粘贴问卷链接。";
    return;
  }
  linkStatus.textContent = "正在读取链接...";
  extractUrlBtn.disabled = true;
  try {
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || "读取失败");
    if (data.suggestedTemplate && templates[data.suggestedTemplate]) {
      templateSelect.value = data.suggestedTemplate;
      renderRules();
    }
    caseInput.value = data.text;
    linkStatus.textContent = `已读取：${data.title || "问卷"}，${data.answers.length} 个答案。`;
    runAudit();
  } catch (error) {
    linkStatus.textContent = `读取失败：${error.message}`;
  } finally {
    extractUrlBtn.disabled = false;
  }
}

function renderRecognized(answers, template) {
  const entries = Object.entries(answers);
  recognizedCount.textContent = `${entries.length} 项`;
  recognizedList.innerHTML = entries.length
    ? entries.map(([id, value]) => {
      const item = template.fields.find(field => field.id === id);
      return `<div class="recognized-item"><strong>${id}. ${item?.label ?? "未知题干"}</strong><span>${escapeHtml(value)}</span></div>`;
    }).join("")
    : `<div class="empty">尚未识别到题目。</div>`;
}

function renderResults(issues) {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const item of issues) counts[item.level] += 1;
  highCount.textContent = counts.high;
  mediumCount.textContent = counts.medium;
  lowCount.textContent = counts.low;
  auditStatus.textContent = counts.high ? "建议退回" : counts.medium ? "需补充" : "可通过";
  resultBody.innerHTML = issues.length
    ? issues.map(item => `<tr>
        <td><span class="badge ${item.level}">${levelName(item.level)}</span></td>
        <td>${item.id}. ${escapeHtml(item.label)}</td>
        <td>${escapeHtml(item.value || "")}</td>
        <td>${escapeHtml(item.message)}</td>
        <td>${escapeHtml(item.relation)}</td>
      </tr>`).join("")
    : `<tr><td colspan="5" class="empty">未发现明显规则问题。</td></tr>`;
}

function renderRules() {
  const template = templates[templateSelect.value];
  ruleCount.textContent = `${template.fields.length} 条规则`;
  rulesList.innerHTML = template.fields.map(item => (
    `<div class="rule-item"><strong>${item.id}. ${item.label}</strong><span>${escapeHtml(item.range)}</span></div>`
  )).join("");
}

function levelName(level) {
  return { high: "高风险", medium: "需复核", low: "提示" }[level] ?? level;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function buildReport() {
  const rows = [...resultBody.querySelectorAll("tr")];
  return rows.map(row => [...row.children].map(cell => cell.innerText.trim()).join(" | ")).join("\n");
}

const templateSelect = document.querySelector("#templateSelect");
const strictnessSelect = document.querySelector("#strictnessSelect");
const caseInput = document.querySelector("#caseInput");
const surveyUrlInput = document.querySelector("#surveyUrlInput");
const extractUrlBtn = document.querySelector("#extractUrlBtn");
const linkStatus = document.querySelector("#linkStatus");
const auditBtn = document.querySelector("#auditBtn");
const loadSampleBtn = document.querySelector("#loadSampleBtn");
const clearBtn = document.querySelector("#clearBtn");
const copyReportBtn = document.querySelector("#copyReportBtn");
const recognizedCount = document.querySelector("#recognizedCount");
const recognizedList = document.querySelector("#recognizedList");
const highCount = document.querySelector("#highCount");
const mediumCount = document.querySelector("#mediumCount");
const lowCount = document.querySelector("#lowCount");
const auditStatus = document.querySelector("#auditStatus");
const resultBody = document.querySelector("#resultBody");
const ruleCount = document.querySelector("#ruleCount");
const rulesList = document.querySelector("#rulesList");

templateSelect.addEventListener("change", renderRules);
strictnessSelect.addEventListener("change", runAudit);
extractUrlBtn.addEventListener("click", extractFromUrl);
caseInput.addEventListener("input", () => {
  const template = templates[templateSelect.value];
  renderRecognized(parseCase(caseInput.value, template), template);
});
auditBtn.addEventListener("click", runAudit);
loadSampleBtn.addEventListener("click", () => {
  caseInput.value = templates[templateSelect.value].sample;
  runAudit();
});
clearBtn.addEventListener("click", () => {
  caseInput.value = "";
  runAudit();
});
copyReportBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(buildReport());
  copyReportBtn.textContent = "已复制";
  setTimeout(() => copyReportBtn.textContent = "复制报告", 1200);
});

renderRules();
runAudit();
