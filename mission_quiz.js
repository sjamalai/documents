/* ============================================================
   URBAN FLOOD RESPONSE — Quiz Engine
   Activates when startQuiz() is called (bound to "Begin mission" button).
   
   Structure:
     1. QUESTIONS  — pure data, no DOM references
     2. STATE      — all mutable quiz state in one object
     3. ENGINE     — init, render, submit, next, results, restart
     4. DRAG & DROP — handlers for priority questions
   ============================================================ */


/* ── 1. QUESTIONS ─────────────────────────────────────────── */

const QUESTIONS = [
  {
    id: 1,
    type: "priority",
    typeLabel: "Drag & drop prioritization",
    badgeClass: "badge-priority",
    text: "You have 60 days and 5 proposed interventions. Drag them into priority order — highest impact first — given your deadline and budget constraints.",
    context: "Budget: €2.4M total. Storm season begins in 60 days. The Canal District has the highest population density. Upstream reforestation takes 3–5 years to show effect.",
    items: [
      "Emergency pump installation at Canal District (€380k, 3 weeks)",
      "Wetland buffer restoration upstream (€1.1M, 18 months)",
      "Public early warning SMS system (€45k, 2 weeks)",
      "Stormwater channel widening on Verea South (€760k, 8 weeks)",
      "Community sandbag depot network (€28k, 1 week)"
    ],
    correctOrder: [2, 4, 0, 3, 1],
    feedback: {
      correct: "Well prioritised. Quick wins (SMS, sandbags) first, then pump infrastructure, then channel work. Wetland restoration is valuable long-term but cannot be delivered before storm season — it should not consume scarce budget now.",
      wrong: "Reconsider the timeline. Wetland restoration takes 18 months — it has zero impact this storm season. Lead with actions deliverable in under 60 days: warning systems and sandbag depots buy time while the pump and channel work protect the Canal District."
    }
  },
  {
    id: 2,
    type: "uncertainty",
    typeLabel: "Decision under uncertainty",
    badgeClass: "badge-uncertainty",
    text: "Dr. Yıldız presents two flood models with conflicting predictions. The conservative model predicts a 0.8m flood peak; the aggressive model predicts 1.4m. Pump infrastructure is certified for 1.0m. What do you do?",
    context: "Upgrading pump specs costs an additional €220k and adds 3 weeks. Your budget has €180k unallocated. The aggressive model was built on older data from a wetter decade.",
    options: [
      "Install standard pumps (certified to 1.0m) — the 0.8m scenario is more likely given newer data",
      "Pause installation until a third independent model is commissioned — takes 6 weeks",
      "Upgrade pump specs using contingency budget and accept the 3-week delay",
      "Install standard pumps but build temporary barriers at 1.2m alongside them"
    ],
    correct: 3,
    feedback: {
      correct: "Sound decision. You acted within budget using a hybrid approach — standard pumps handle the likely scenario, temporary barriers cover the tail risk. You did not overcommit to either model or fatally delay the project.",
      wrong: "Think about asymmetric risk. If the 1.4m scenario occurs and you're underequipped, the consequences far outweigh the cost of modest hedging. Pausing for a third model wastes 6 of your 60 days and still leaves you with uncertainty. A hybrid solution is almost always better than betting on one forecast."
    }
  },
  {
    id: 3,
    type: "messy",
    typeLabel: "Interpreting messy information",
    badgeClass: "badge-messy",
    text: "Marcus has collected resident feedback from 3 community meetings. Identify which finding is most actionable for your flood strategy.",
    context: null,
    table: [
      ["Source", "Reported concern", "Sample size", "Note"],
      ["Canal South meeting", "\"The drains were blocked last October\"", "34 residents", "Informal notes, no survey"],
      ["Market District petition", "\"Council failed us in 2019 floods\"", "312 signatures", "References previous project, not current risk"],
      ["Engineer site visit", "Drain outlet at Verea/Canal junction visually obstructed with debris", "—", "Direct observation, documented"],
      ["Social media scrape", "\"Flooding always hits us hardest\"", "~1,200 posts", "Unverified, many from outside Marea"]
    ],
    options: [
      "The petition — 312 signatures shows strong political pressure to act",
      "The site visit — direct physical evidence of a specific, fixable problem",
      "Social media posts — largest signal volume indicates community-wide concern",
      "Resident meeting notes — most recent local testimony from the affected area"
    ],
    correct: 1,
    feedback: {
      correct: "Correct. The engineer's direct observation of a specific, documented obstruction is the most actionable finding — it names a location, a problem, and is independently verifiable. Petition numbers reflect sentiment, not infrastructure faults.",
      wrong: "Volume of signal is not the same as quality of signal. The petition reflects a historical trust deficit, not a current technical problem. Social media is unverified and geographically diffuse. Meeting notes are anecdotal. Only the site visit gives you a specific, fixable fault at a known location."
    }
  },
  {
    id: 4,
    type: "tradeoff",
    typeLabel: "Balancing trade-offs",
    badgeClass: "badge-tradeoff",
    text: "The channel widening project requires demolishing a 40m section of the historic market wall — a listed structure with community significance. Omitting this section reduces flood protection by ~22% in the market zone. What do you recommend?",
    context: null,
    options: [
      "Proceed with demolition — flood risk to 47,000 people outweighs heritage value",
      "Abandon channel widening entirely — community opposition will stall the project",
      "Widen the channel up to the wall and add a temporary deployable flood barrier at that section instead",
      "Commission a heritage impact assessment — this delays work by 4 weeks but protects against legal challenge"
    ],
    correct: 2,
    feedback: {
      correct: "Good call. A deployable barrier at the wall section is a practical hybrid — it preserves the channel project, respects the heritage concern, and closes the 22% protection gap without the political cost of demolition or the time cost of a formal assessment.",
      wrong: "Binary choices (demolish vs. abandon) ignore the design space between them. A heritage impact assessment may be legally safer but costs 4 weeks you cannot afford. The trade-off here is between legal risk and flood risk — a temporary barrier threads that needle."
    }
  },
  {
    id: 5,
    type: "stakeholder",
    typeLabel: "Stakeholder effectiveness",
    badgeClass: "badge-stakeholder",
    text: "The Mayor calls and requests that pump installation begin in the Northern Business District first — not the Canal District — citing election optics. Your model shows the Canal District has 3× higher flood risk. How do you respond?",
    context: null,
    options: [
      "Agree — the Mayor is your political superior and controls your budget",
      "Refuse entirely — your mandate is evidence-based, not political",
      "Present the risk data clearly, propose a sequencing that starts with Canal District, and offer to co-communicate the rationale with the Mayor's office",
      "Escalate to the city council to override the Mayor's request"
    ],
    correct: 2,
    feedback: {
      correct: "Exactly right. You maintained your evidence-based position while giving the Mayor a face-saving co-authorship of the decision. Stakeholder effectiveness is not about winning arguments — it's about aligning decision-makers without burning the relationship or abandoning the mission.",
      wrong: "Blind compliance risks the mission; outright refusal creates an enemy you need on your side. Escalating to council is a nuclear option that destroys trust. The right move is transparent data sharing paired with a collaborative reframe."
    }
  },
  {
    id: 6,
    type: "priority",
    typeLabel: "Drag & drop prioritization",
    badgeClass: "badge-priority",
    text: "Ana presents the budget breakdown. Rank these five cost items in order of which to protect first if a budget cut of €400k is imposed.",
    context: "A national infrastructure grant has been delayed. You must find €400k in cuts. Items ranked lowest will be cut first.",
    items: [
      "Early warning SMS system (€45k)",
      "Community sandbag depots (€28k)",
      "Emergency pump — Canal District (€380k)",
      "Temporary barriers at heritage wall (€95k)",
      "Community engagement workshops (€52k)"
    ],
    correctOrder: [2, 3, 0, 4, 1],
    feedback: {
      correct: "Well reasoned. The pump is the core life-safety intervention — protect it first. Barriers close the remaining vulnerability gap. SMS warns residents when everything else fails. Workshops are valuable but cuttable. Sandbag depots are cheapest and most dispensable.",
      wrong: "Prioritise by consequence of failure. Cutting the pump and having a flood is catastrophic. Cutting workshops loses goodwill — serious, but recoverable. Work backwards from worst-case outcomes, not from cost alone."
    }
  },
  {
    id: 7,
    type: "uncertainty",
    typeLabel: "Decision under uncertainty",
    badgeClass: "badge-uncertainty",
    text: "With 30 days remaining, a new meteorological report revises storm probability upward from 73% to 91%. Your pump contractor says they can rush-deliver for a 15% surcharge (€57k extra). Do you authorise the surcharge?",
    context: "Remaining contingency: €180k. Rush delivery completes 10 days early. Standard delivery still finishes 5 days before storm season begins.",
    options: [
      "No — standard delivery still arrives in time, and €57k is better held as emergency reserve",
      "Yes — 91% probability justifies eliminating the 5-day margin risk entirely",
      "Negotiate: offer an 8% surcharge to split the difference",
      "Delay the decision until 14 days remaining when you have better weather data"
    ],
    correct: 0,
    feedback: {
      correct: "Good judgment. Standard delivery completes 5 days before the season — that's a reasonable buffer. Spending €57k to gain 10 extra days when you already have 5 is poor resource allocation. Hold contingency for real surprises.",
      wrong: "Reframe the decision: you're not buying certainty, you're buying 10 extra days when you already have a 5-day buffer. The marginal value is low. €57k from a €180k contingency fund is a 32% spend for a non-critical time gain. Reserve it."
    }
  },
  {
    id: 8,
    type: "messy",
    typeLabel: "Interpreting messy information",
    badgeClass: "badge-messy",
    text: "Your team receives three conflicting estimates for how many residents in Zone 4 have received evacuation information. Which number should you use for planning?",
    context: null,
    table: [
      ["Source", "Estimate", "Method", "Date"],
      ["Marcus (community team)", "62% of Zone 4 households", "Door-to-door surveys, 3 streets sampled", "8 days ago"],
      ["City comms department", "88% reached", "SMS delivery receipts", "Yesterday"],
      ["NGO partner", "41% meaningfully informed", "Comprehension quiz at community centre", "3 days ago"],
      ["Council database", "94% of registered addresses notified", "Mailing list coverage", "2 weeks ago"]
    ],
    options: [
      "88% — most recent data from the largest distribution channel",
      "41% — a comprehension test measures actual understanding, not just receipt",
      "62% — door-to-door is most representative of real household reach",
      "Average all four estimates: ~71%"
    ],
    correct: 1,
    feedback: {
      correct: "Correct. Delivery receipts and mailing lists measure distribution, not comprehension. For evacuation planning, what matters is whether people understand what to do — the NGO's comprehension test is the only measure of that. 41% is the number that saves lives.",
      wrong: "There is a critical difference between information delivered and information understood. SMS receipts tell you a message arrived; they say nothing about whether the recipient read, understood, or will act on it. For emergency planning, always plan for the comprehension figure."
    }
  },
  {
    id: 9,
    type: "tradeoff",
    typeLabel: "Balancing trade-offs",
    badgeClass: "badge-tradeoff",
    text: "Wetland restoration upstream would provide long-term flood resilience AND protect 12 species of nesting birds. It costs €1.1M and takes 18 months — beyond this season. A donor offers to fund 60% if you commit €440k of your emergency budget now. Do you accept?",
    context: null,
    options: [
      "Yes — the ecological co-benefit justifies the long-term investment even in crisis mode",
      "No — committing €440k now depletes emergency capacity for the current threat season",
      "Accept only if you can negotiate the commitment down to €150k with phased payments",
      "Decline the full offer but propose a memorandum of intent to fund post-season"
    ],
    correct: 3,
    feedback: {
      correct: "Smart move. A memorandum of intent signals genuine commitment to the wetland project without raiding your emergency fund. You preserve financial flexibility for the current season while keeping the donor relationship and ecological benefit alive for immediate post-season activation.",
      wrong: "The ecological benefit is real but the timing is wrong. Committing €440k during a 60-day emergency reduces your ability to respond to surprises. The long-term benefit does not change the short-term math. Lock in the donor relationship without the financial commitment now."
    }
  },
  {
    id: 10,
    type: "stakeholder",
    typeLabel: "Stakeholder effectiveness",
    badgeClass: "badge-stakeholder",
    text: "Two days before pump installation begins, a residents' group announces a protest, claiming construction will damage their street's tree canopy. Your contractor says a 1-week delay risks missing the deadline. What do you do first?",
    context: null,
    options: [
      "Proceed on schedule — legal permits are in place and the flood risk is too high to delay",
      "Immediately meet with the residents' group leaders to understand the specific concern before committing to any action",
      "Request police presence to ensure contractor access",
      "Offer the residents a financial settlement for tree damage as a goodwill gesture"
    ],
    correct: 1,
    feedback: {
      correct: "Right first move. Meeting with residents does not concede the schedule — it buys information. You may discover the concern is resolvable in hours (a specific tree, a modified access route) without any delay. Never deploy authority or money before you know what the actual ask is.",
      wrong: "Proceeding without dialogue turns a manageable conflict into an escalating one. Police presence will inflame the situation permanently. A financial offer before dialogue looks like a bribe and may raise the stakes. Information always comes first."
    }
  },
  {
    id: 11,
    type: "priority",
    typeLabel: "Drag & drop prioritization",
    badgeClass: "badge-priority",
    text: "Storm season is 10 days away. All infrastructure is complete. Rank these final-week tasks by urgency for your team.",
    context: "Everything that could be built is built. This is the final operational preparation phase.",
    items: [
      "Run full pump system test and document results",
      "Confirm evacuation route signage is installed in all 4 zones",
      "Send final press release about completed flood works",
      "Conduct tabletop exercise with emergency services on storm day protocol",
      "Verify sandbag depots are staffed and accessible 24/7"
    ],
    correctOrder: [3, 0, 4, 1, 2],
    feedback: {
      correct: "Good sequencing. The tabletop exercise ensures the human system works before the storm — this is where most real-world responses fail. System testing confirms the infrastructure. Sandbag staffing is the last physical safety net. Signage is confirmatory. Press releases are last.",
      wrong: "Infrastructure without rehearsal fails when the real event is chaotic and unfamiliar. The tabletop exercise is the most undervalued item — it stress-tests human coordination, which is where real flood responses break down. Always put coordination rehearsal first."
    }
  },
  {
    id: 12,
    type: "uncertainty",
    typeLabel: "Decision under uncertainty",
    badgeClass: "badge-uncertainty",
    text: "It's 3 days before storm season. Weather services now show only a 35% chance of a major flood (a significant downgrade). A neighbouring district requests to borrow your mobile pump unit for their lower-income area that has no protection at all. Do you lend it?",
    context: "Your Canal District is now protected by the fixed pump installation. The mobile unit was your backup. The neighbouring district has 8,000 residents with zero flood infrastructure.",
    options: [
      "No — you were assigned this equipment for Marea; once lent, recall may be impossible mid-storm",
      "Yes — 35% probability is low, your main pump is installed, and their need is acute",
      "Lend it with a formal written agreement that it returns within 24 hours if conditions change",
      "Escalate to the Metropolitan Authority to make the call — this is above your mandate"
    ],
    correct: 2,
    feedback: {
      correct: "Well-balanced. Lending with a formal recall agreement is the right humanitarian call. You have redundancy you didn't have before the installation; they have nothing. A written agreement makes the recall enforceable, not just a goodwill request.",
      wrong: "At 35% probability with a fixed pump installed, you have meaningful redundancy. Refusing to lend when you have surplus protection and another community has zero is indefensible. Escalating wastes 24 hours for a decision clearly within your mandate."
    }
  },
  {
    id: 13,
    type: "tradeoff",
    typeLabel: "Balancing trade-offs",
    badgeClass: "badge-tradeoff",
    text: "Storm season passed with only minor flooding — your interventions worked. You have €95k of unspent budget. The city finance office wants it returned. Your team proposes three uses. Which do you advocate for?",
    context: "Finance rule: unspent emergency funds must be returned unless a written case is made within 5 working days.",
    options: [
      "Return it — you delivered the mission; spending the surplus is scope creep",
      "Fund a community debriefing and lessons-learned report to improve future responses",
      "Begin the wetland restoration deposit to activate the donor match secured earlier",
      "Purchase a permanent mobile pump unit for the city's long-term emergency stockpile"
    ],
    correct: 2,
    feedback: {
      correct: "Best long-term leverage. The deposit activates the donor's €266k match (60% of €440k total), giving the city €361k of wetland restoration value for €95k spent. It also fulfils the ecological commitment made during the crisis. Maximum impact per euro.",
      wrong: "A lessons-learned report is valuable but not a financial multiplier. A permanent pump costs more than €95k. Returning the money is safe but destroys the opportunity you created when you negotiated the memorandum of intent. Activate that agreement."
    }
  }
];


/* ── 2. STATE ──────────────────────────────────────────────── */

const State = {
  currentQ:      0,
  score:         0,
  answered:      false,
  selectedOption: null,
  dragSrcIndex:  null,
  categoryScores: {
    priority:    { correct: 0, total: 0 },
    uncertainty: { correct: 0, total: 0 },
    messy:       { correct: 0, total: 0 },
    tradeoff:    { correct: 0, total: 0 },
    stakeholder: { correct: 0, total: 0 }
  }
};

function resetState() {
  State.currentQ       = 0;
  State.score          = 0;
  State.answered       = false;
  State.selectedOption = null;
  State.dragSrcIndex   = null;
  State.categoryScores = {
    priority:    { correct: 0, total: 0 },
    uncertainty: { correct: 0, total: 0 },
    messy:       { correct: 0, total: 0 },
    tradeoff:    { correct: 0, total: 0 },
    stakeholder: { correct: 0, total: 0 }
  };
}


/* ── 3. ENGINE ─────────────────────────────────────────────── */

/** Entry point — bound to "Begin mission" button */
function startQuiz() {
  document.getElementById("overview-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display    = "block";
  renderQuestion();
}

function renderQuestion() {
  State.answered       = false;
  State.selectedOption = null;

  const q       = QUESTIONS[State.currentQ];
  const btnSub  = document.getElementById("btn-submit");
  const btnNext = document.getElementById("btn-next");

  btnSub.style.display  = "block";
  btnSub.disabled       = (q.type === "priority") ? false : true;
  btnNext.style.display = "none";

  /* progress bar */
  document.getElementById("q-counter").textContent    = `Question ${State.currentQ + 1} of ${QUESTIONS.length}`;
  document.getElementById("q-score-live").textContent = `Score: ${State.score}`;
  document.getElementById("progress-fill").style.width = `${(State.currentQ / QUESTIONS.length) * 100}%`;

  /* build HTML */
  let html = `<span class="q-type-badge ${q.badgeClass}">${q.typeLabel}</span>`;
  html += `<div class="q-text">${q.text}</div>`;

  if (q.context) {
    html += `<div class="q-context">${q.context}</div>`;
  }

  if (q.type === "priority") {
    html += buildDragList(q.items);
  } else if (q.table) {
    html += buildTable(q.table);
    html += buildOptions(q.options);
  } else {
    html += buildOptions(q.options);
  }

  html += `<div class="feedback-box" id="feedback-box"></div>`;
  document.getElementById("question-container").innerHTML = html;
}

function buildDragList(items) {
  let html = `<div class="drag-list" id="drag-list">`;
  items.forEach((item, i) => {
    html += `
      <div class="drag-item"
           draggable="true"
           data-index="${i}"
           ondragstart="onDragStart(event)"
           ondragover="onDragOver(event)"
           ondrop="onDrop(event)"
           ondragleave="onDragLeave(event)">
        <div class="drag-rank">${i + 1}</div>
        <div class="drag-handle">⠿</div>
        <span>${item}</span>
      </div>`;
  });
  html += `</div>`;
  return html;
}

function buildTable(rows) {
  let html = `<table class="data-table"><thead><tr>`;
  rows[0].forEach(h => { html += `<th>${h}</th>`; });
  html += `</tr></thead><tbody>`;
  for (let r = 1; r < rows.length; r++) {
    html += `<tr>`;
    rows[r].forEach(cell => { html += `<td>${cell}</td>`; });
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function buildOptions(options) {
  let html = `<div class="options-list">`;
  options.forEach((opt, i) => {
    html += `<button class="option-btn" onclick="selectOption(this, ${i})">${opt}</button>`;
  });
  html += `</div>`;
  return html;
}

/** Called when user taps an option button */
function selectOption(el, idx) {
  if (State.answered) return;
  State.selectedOption = idx;
  document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
  el.classList.add("selected");
  document.getElementById("btn-submit").disabled = false;
}

/** Called when user taps "Submit answer" */
function submitAnswer() {
  if (State.answered) return;
  State.answered = true;

  const q       = QUESTIONS[State.currentQ];
  const fb      = document.getElementById("feedback-box");
  const btnSub  = document.getElementById("btn-submit");
  const btnNext = document.getElementById("btn-next");

  btnSub.disabled       = true;
  btnNext.style.display = "block";

  let isCorrect = false;

  if (q.type === "priority") {
    isCorrect = gradeDragQuestion(q);
  } else {
    if (State.selectedOption === null) return;
    isCorrect = gradeOptionQuestion(q);
  }

  /* update scores */
  if (isCorrect) {
    State.score++;
    State.categoryScores[q.type].correct++;
  }
  State.categoryScores[q.type].total++;
  document.getElementById("q-score-live").textContent = `Score: ${State.score}`;

  /* show feedback */
  const feedbackType = q.type === "priority"
    ? (isCorrect ? "feedback-correct" : "feedback-partial")
    : (isCorrect ? "feedback-correct" : "feedback-wrong");

  fb.textContent = isCorrect ? q.feedback.correct : q.feedback.wrong;
  fb.className   = `feedback-box show ${feedbackType}`;
}

function gradeDragQuestion(q) {
  const userOrder = [...document.querySelectorAll(".drag-item")]
    .map(el => parseInt(el.dataset.index));

  const matchCount = userOrder.filter((v, i) => q.correctOrder[i] === v).length;
  const isCorrect  = matchCount >= 3;

  /* colour items */
  document.querySelectorAll(".drag-item").forEach((el, i) => {
    const val = parseInt(el.dataset.index);
    if (q.correctOrder[i] === val) {
      el.style.borderColor = "var(--teal)";
      el.style.background  = "var(--teal-light)";
    } else {
      el.style.borderColor = "var(--amber-mid)";
      el.style.background  = "var(--amber-light)";
    }
  });

  return isCorrect;
}

function gradeOptionQuestion(q) {
  const isCorrect = State.selectedOption === q.correct;

  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct)                            btn.classList.add("correct");
    else if (i === State.selectedOption && !isCorrect) btn.classList.add("wrong");
  });

  return isCorrect;
}

/** Called when user taps "Next →" */
function nextQuestion() {
  State.currentQ++;
  if (State.currentQ >= QUESTIONS.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

/** Final results screen */
function showResults() {
  document.getElementById("quiz-screen").style.display   = "none";
  document.getElementById("results-screen").style.display = "block";

  const pct = Math.round((State.score / QUESTIONS.length) * 100);
  document.getElementById("final-score").textContent = `${State.score}/${QUESTIONS.length}`;

  const titles = [
    "Mission failed — review and retry",
    "Partial success — strong areas, clear gaps",
    "Mission accomplished — solid performance",
    "Outstanding — expert-level thinking"
  ];
  const titleIdx = pct < 50 ? 0 : pct < 70 ? 1 : pct < 90 ? 2 : 3;
  document.getElementById("results-title").textContent = titles[titleIdx];

  /* category breakdown */
  const CATS = [
    { key: "priority",    label: "Prioritization"     },
    { key: "uncertainty", label: "Under uncertainty"  },
    { key: "messy",       label: "Messy information"  },
    { key: "tradeoff",    label: "Trade-offs"          },
    { key: "stakeholder", label: "Stakeholder"         }
  ];

  const grid = CATS.map(c => {
    const cs = State.categoryScores[c.key];
    return `
      <div class="breakdown-tile">
        <div class="bt-label">${c.label}</div>
        <div class="bt-score">${cs.correct}/${cs.total}</div>
      </div>`;
  }).join("");

  document.getElementById("breakdown-grid").innerHTML = grid;
}

/** Restart from results screen */
function restartQuiz() {
  resetState();
  document.getElementById("results-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display    = "block";
  renderQuestion();
}


/* ── 4. DRAG AND DROP ──────────────────────────────────────── */

function onDragStart(e) {
  State.dragSrcIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
  e.dataTransfer.dropEffect = "move";
}

function onDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  const targetIdx = parseInt(e.currentTarget.dataset.index);
  if (State.dragSrcIndex === targetIdx) return;

  const list    = document.getElementById("drag-list");
  const allItems = [...list.querySelectorAll(".drag-item")];
  const srcEl   = allItems.find(el => parseInt(el.dataset.index) === State.dragSrcIndex);
  const tgtEl   = e.currentTarget;

  const srcPos = [...list.children].indexOf(srcEl);
  const tgtPos = [...list.children].indexOf(tgtEl);

  if (srcPos < tgtPos) list.insertBefore(srcEl, tgtEl.nextSibling);
  else                  list.insertBefore(srcEl, tgtEl);

  /* re-number rank badges */
  [...list.querySelectorAll(".drag-item")].forEach((el, i) => {
    el.querySelector(".drag-rank").textContent = i + 1;
    el.classList.remove("dragging");
  });
}
