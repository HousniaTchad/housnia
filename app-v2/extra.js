/* Housnia v2 – contenus supplémentaires ajoutés dans les pages de la v1.
   Utilise les données de content.js et les fonctions de index.html (S, esc, t, lang, render…).
   PROTOTYPE : contenus à valider par le comité médical. */
"use strict";

const X_DAYMS = 864e5;
const xIso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const xAdd = (d, n) => new Date(d.getTime() + n * X_DAYMS);
const xDiff = (a, b) => Math.round((a - b) / X_DAYMS);
const xFmt = d => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const xFmtS = d => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

/* Contenu détaillé en français : affiché de gauche à droite même si l'interface est en arabe */
function frWrap(html) {
  if (lang === "fr") return html;
  return `<div dir="ltr" lang="fr"><p class="muted small">Contenu détaillé en français pour l'instant · المحتوى المفصّل بالفرنسية حاليًا</p>${html}</div>`;
}
const xBadge = lv => `<span class="badge" style="background:${LEVELS[lv].bg};color:${LEVELS[lv].color};border:1px solid ${LEVELS[lv].color}">${LEVELS[lv].short}</span>`;
const xListen = txt => `<button class="listen" data-say="${esc(txt)}">${I.spk}<span> Écouter</span></button>`;

/* ---------- Contexte ---------- */
function xInfo() {
  const l = parse(S.get("lmp", "")), b = parse(S.get("birth", ""));
  return { weeks: l ? Math.floor(xDiff(today(), l) / 7) : null, babyDays: b ? xDiff(today(), b) : null };
}
const xSym = (ctx, id) => SYMPTOMS[ctx].flatMap(c => c.items).find(s => s.id === id);
const xLv = (s, ctx) => (typeof s.lv === "function" ? s.lv(ctx, xInfo()) : s.lv);
function xWorst(levels) { for (const l of ORDER) if (levels.includes(l)) return l; return 0; }
const CTX_NAME = { cycle: "Règles", preg: "Grossesse", post: "Après l'accouchement", baby: "Bébé" };

/* ---------- Journal ---------- */
function xLogs() { return S.get("logs", {}); }
function xItems(day) {
  const e = xLogs()[day] || {}, out = [];
  for (const ctx of ["cycle", "preg", "post", "baby"]) (e[ctx] || []).forEach(id => { const s = xSym(ctx, id); if (s) out.push({ s, ctx, lv: xLv(s, ctx) }); });
  return out;
}
function levelCard(lv, reasons, harm) {
  const L = LEVELS[lv];
  let h = `<div class="level" style="background:${L.bg};border-color:${L.color}"><div class="lt" style="color:${L.color}">${lv === 1 ? "⚠ " : ""}${L.name}</div><p style="font-weight:600">${harm ? HARM_MSG : L.msg}</p>`;
  if (reasons && reasons.length) h += `<ul style="margin:6px 0 0;padding-inline-start:20px">${reasons.map(r => `<li>${r}</li>`).join("")}</ul>`;
  if (lv === 1) h += callButtons();
  return h + `</div>`;
}
function journalCard(ctx, title) {
  const sel = new Set((xLogs()[xIso(today())] || {})[ctx] || []);
  return `<div class="card"><h3>${title}</h3><p class="muted small">Touche ce que tu remarques aujourd'hui, puis « Enregistrer ». Les signes en rouge sont des signes de danger.</p>
  ${SYMPTOMS[ctx].map(c => `<h4>${c.cat}</h4><div class="chips">${c.items.map(s => `<button class="chip ${c.danger || xLv(s, ctx) === 1 ? "dg" : ""} ${sel.has(s.id) ? "on" : ""}" data-sym="${s.id}" data-ctx="${ctx}">${s.t}</button>`).join("")}</div>`).join("")}
  <button class="btn" data-act="savelog" data-ctx="${ctx}">Enregistrer</button><div id="jres-${ctx}">${resultHtml(ctx)}</div></div>`;
}
function resultHtml(ctx) {
  const it = xItems(xIso(today())).filter(x => x.ctx === ctx);
  if (!it.length) return "";
  const w = xWorst(it.map(x => x.lv));
  const reasons = it.filter(x => x.lv === w && w !== 0).map(x => `<b>${x.s.t}</b>${x.s.why ? " – " + x.s.why : ""}`);
  const infos = it.filter(x => x.lv === 0 && x.s.why).map(x => `${x.s.t} : ${x.s.why}`);
  return levelCard(w, reasons, it.some(x => x.s.harm)) +
    (infos.length ? `<div class="keep"><b>Bon à savoir</b><ul style="margin:4px 0 0;padding-inline-start:20px">${infos.map(i => `<li>${i}</li>`).join("")}</ul></div>` : "") +
    `<p class="muted small">En cas de doute, va toujours au centre de santé.</p>`;
}
function historyDetails(ctxs, title) {
  const logs = xLogs(), from = xIso(xAdd(today(), -60)), days = Object.keys(logs).filter(d => d >= from).sort().reverse();
  const rows = days.map(d => { const it = xItems(d).filter(x => ctxs.includes(x.ctx)); if (!it.length) return ""; const w = xWorst(it.map(x => x.lv));
    return `<div class="hist" style="border-color:${LEVELS[w].color}"><div class="row"><b style="flex:1">${xFmt(parse(d))}</b>${xBadge(w)}</div><p class="small" style="margin:4px 0 0">${it.map(x => (x.ctx === "baby" && ctxs.length > 1 ? "Bébé : " : "") + x.s.t).join(" · ")}</p></div>`; }).join("");
  const count = {}; days.filter(d => d >= xIso(xAdd(today(), -30))).forEach(d => xItems(d).filter(x => ctxs.includes(x.ctx)).forEach(x => { const k = (x.ctx === "baby" ? "Bébé : " : "") + x.s.t; count[k] = (count[k] || 0) + 1; }));
  const sum = Object.keys(count).length ? `<h4>Résumé pour la sage-femme (30 derniers jours)</h4><table class="m"><tr><th>Symptôme</th><th>Jours</th></tr>${Object.entries(count).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join("")}</table>` : "";
  return `<details><summary>${title}</summary><div class="in">${rows || `<p class="muted">Rien d'enregistré pour l'instant.</p>`}${sum}</div></details>`;
}

/* ---------- Numéros et appels ---------- */
function callButtons() {
  const n = S.get("nums", {}), list = [["centre", "Centre de santé"], ["trust", "Personne de confiance"], ["amb", "Secours"]].filter(([k]) => n[k]);
  if (!list.length) return `<p class="small" style="margin-top:8px"><b>Enregistre tes numéros d'urgence</b> dans l'onglet Urgence pour pouvoir appeler en un geste.</p>`;
  return list.map(([k, l]) => `<a class="btn red" href="tel:${esc(n[k].replace(/\s/g, ""))}">📞 Appeler : ${l} (${esc(n[k])})</a>`).join("");
}
function numsCard() {
  const n = S.get("nums", {});
  return `<div class="card"><h3>Mes numéros d'urgence</h3><p class="muted small">Ils restent sur ton téléphone. Les numéros officiels de chaque province seront ajoutés après vérification auprès du Ministère de la Santé.</p>
  <label for="nc">Mon centre de santé</label><input type="tel" id="nc" value="${esc(n.centre || "")}">
  <label for="nt">Personne de confiance</label><input type="tel" id="nt" value="${esc(n.trust || "")}">
  <label for="na">Secours / ambulance de ma ville</label><input type="tel" id="na" value="${esc(n.amb || "")}">
  <button class="btn" data-act="savenums">Enregistrer</button>${callButtons()}</div>`;
}

/* ---------- Calendrier médical ---------- */
function xEvents(kind) {
  const ev = [], l = parse(S.get("lmp", "")), b = parse(S.get("birth", ""));
  if (kind === "preg" && l) { ANC_WEEKS.forEach(w => ev.push({ d: xAdd(l, w * 7), t: `Consultation prénatale (vers ${w} semaines)` })); ev.push({ d: xAdd(l, 143), t: "Échographie (avant 24 semaines)" }); ev.push({ d: xAdd(l, 280), t: "Date prévue d'accouchement" }); }
  if (kind === "post" && b) { PNC_DAYS.forEach(x => ev.push({ d: xAdd(b, x.d), t: x.t })); VACC.forEach(x => ev.push({ d: xAdd(b, x.d), t: "Bébé : " + x.t })); }
  S.get("appts", []).forEach((a, i) => { if (a.kind === kind) ev.push({ d: parse(a.date), t: a.type + (a.note ? " – " + a.note : ""), i }); });
  return ev.filter(e => e.d).sort((a, b) => a.d - b.d);
}
function agendaCard(kind, title) {
  const ev = xEvents(kind), td = today(), up = ev.filter(e => e.d >= td), past = ev.filter(e => e.d < td);
  const row = e => `<div class="hist" style="border-color:${e.i !== undefined ? "var(--pink)" : "var(--teal)"}"><div class="row"><b style="flex:1">${xFmt(e.d)}</b>${e.i !== undefined ? `<button class="mini" data-act="delappt" data-i="${e.i}">Supprimer</button>` : `<span class="muted small">${xDiff(e.d, td) === 0 ? "aujourd'hui" : xDiff(e.d, td) > 0 ? "dans " + xDiff(e.d, td) + " j" : ""}</span>`}</div><p class="small" style="margin:2px 0 0">${esc(e.t)}</p></div>`;
  const types = kind === "preg" ? ["Consultation prénatale", "Échographie", "Analyses", "Autre"] : kind === "post" ? ["Consultation post-natale", "Vaccin du bébé", "Pesée du bébé", "Autre"] : ["Consultation gynécologique", "Autre"];
  return `<details><summary>${title}</summary><div class="in">${up.length ? up.map(row).join("") : `<p class="muted">Aucun rendez-vous à venir.${kind !== "cycle" ? " Entre la date ci-dessus pour voir les rendez-vous proposés." : ""}</p>`}
  ${kind === "post" ? `<p class="muted small">${VACC_NOTE}</p>` : ""}
  <h4>Ajouter un rendez-vous</h4><label for="ad-${kind}">Date</label><input type="date" id="ad-${kind}" value="${xIso(td)}"><label for="at-${kind}">Type</label><select id="at-${kind}">${types.map(x => `<option>${x}</option>`).join("")}</select><label for="an-${kind}">Note</label><input type="text" id="an-${kind}">
  <button class="btn" data-act="addappt" data-kind="${kind}">Ajouter</button>
  ${past.length ? `<p class="muted small">Rendez-vous passés : ${past.length}</p>` : ""}<p class="muted small">Dans l'application finale, chaque rendez-vous enverra un rappel sur le téléphone.</p></div></details>`;
}

/* ---------- Blocs de contenu ---------- */
const monthCard = (m, open) => `<details ${open ? "open" : ""}><summary>Mois ${m.m} <span class="muted small">· ${m.w}</span>${open ? ' <span class="badge" style="background:var(--powder);color:var(--plum)">Maintenant</span>' : ""}</summary><div class="in"><dl><dt>Le bébé</dt><dd>${m.baby}</dd><dt>Ton corps</dt><dd>${m.mom}</dd><dt>Examens et rendez-vous</dt><dd>${m.exam}</dd><dt>Conseil</dt><dd>${m.tip}</dd></dl><div class="alert" style="margin-top:10px">Va au centre de santé si : ${m.warn}</div>${xListen(`Mois ${m.m}. Le bébé : ${m.baby} Ton corps : ${m.mom} Examens : ${m.exam} ${m.tip} Va au centre de santé si : ${m.warn}`)}</div></details>`;
const complCard = c => `<details><summary>${c.t}</summary><div class="in"><dl><dt>Signes à reconnaître</dt><dd>${c.s}</dd><dt>Risques</dt><dd>${c.r}</dd><dt>Niveau d'urgence</dt><dd>${xBadge(c.lv)} ${LEVELS[c.lv].msg}${c.lvNote ? " " + c.lvNote : ""}</dd></dl></div></details>`;
const motherCard = x => `<details><summary>${x.t}</summary><div class="in"><dl><dt>Ce qui est habituel</dt><dd>${x.ok}</dd><dt>Consulter si</dt><dd>${x.go}</dd><dt>Niveau dans ce cas</dt><dd>${xBadge(x.lv)} ${LEVELS[x.lv].msg}</dd></dl></div></details>`;
const bfCard = x => `<details><summary>${x.t}</summary><div class="in"><p>${x.b}</p>${xListen(x.t + ". " + x.b)}</div></details>`;
const babyCard = x => `<details><summary>${x.t}</summary><div class="in"><dl><dt>Ce qui est habituel</dt><dd>${x.ok}</dd><dt>Ce que tu peux faire</dt><dd>${x.tips}</dd></dl><div class="alert" style="margin-top:8px">Consulter si : ${x.go}</div></div></details>`;
const artCard = a => `<details><summary>${a.t}</summary><div class="in"><p>${a.b}</p>${xListen(a.t + ". " + a.b + " À retenir : " + a.k)}<div class="keep"><b>À retenir :</b> ${a.k}</div><div class="alert">Va au centre de santé si ${a.h}</div></div></details>`;
const earlyBlock = () => `<ul style="margin:0 0 8px;padding-inline-start:20px">${EARLY_SIGNS.map(s => `<li>${s}</li>`).join("")}</ul><div class="keep">${EARLY_NOTE}</div><div class="alert">${EARLY_ALERT}</div>`;
function emergencyCard(x) {
  return `<details><summary>${x.t} ${xBadge(x.lv)}</summary><div class="in"><dl><dt>1. Signes à reconnaître</dt><dd>${x.s}</dd><dt>2. Risques</dt><dd>${x.r}</dd><dt>3. Niveau d'urgence</dt><dd>${xBadge(x.lv)} ${LEVELS[x.lv].msg}</dd><dt>4. En attendant les soins</dt><dd>${x.w}</dd><dt>5. Appeler les secours immédiatement</dt><dd>${x.call}</dd></dl>${xListen(x.t + ". Signes : " + x.s + " En attendant : " + x.w)}<h4>6. Appeler</h4>${callButtons()}</div></details>`;
}

/* ---------- Ajouts par page ---------- */
function homeExtras() {
  const out = [], d0 = xIso(today()), d1 = xIso(xAdd(today(), -1));
  const l = parse(S.get("last", "")), c = Number(S.get("cycle", 28)) || 28;
  if (l && profile !== "preg" && profile !== "baby") { const late = xDiff(today(), l) - c; if (late > 7) out.push(levelCard(3, [`Tes règles sont en retard d'environ ${late} jours. Fais un test de grossesse et parles-en à une sage-femme.`])); }
  for (const d of [d0, d1]) { const it = xItems(d), w = xWorst(it.map(x => x.lv)); if (w) out.push(levelCard(w, [`Journal ${d === d0 ? "d'aujourd'hui" : "d'hier"} : ${it.filter(x => x.lv === w).map(x => (x.ctx === "baby" ? "bébé – " : "") + x.s.t).join(", ")}`], it.some(x => x.s.harm))); }
  const kind = profile === "preg" ? "preg" : profile === "baby" ? "post" : "cycle", nx = xEvents(kind).find(e => e.d >= today());
  if (nx) out.push(`<div class="card"><h3>Prochain rendez-vous</h3><p><b>${xFmt(nx.d)}</b> · ${esc(nx.t)}</p></div>`);
  return out.length ? frWrap(out.join("")) : "";
}
function periodExtras() {
  return frWrap(`${journalCard("cycle", "Mon journal du jour")}
  ${historyDetails(["cycle"], "Mon historique et résumé pour la sage-femme")}
  ${agendaCard("cycle", "Mes rendez-vous gynécologiques")}
  <h3 style="margin-top:16px">Pour mieux comprendre</h3>
  ${LEARN.find(x => x.id === "cycle").arts.slice(1).map(artCard).join("")}
  ${LEARN.find(x => x.id === "pertes").arts.map(artCard).join("")}
  ${LEARN.find(x => x.id === "ovul").arts.map(artCard).join("")}
  <details><summary>Premiers signes de grossesse</summary><div class="in">${earlyBlock()}</div></details>`);
}
function pregExtras() {
  const w = xInfo().weeks, mon = w !== null && w >= 0 ? Math.min(9, Math.floor(w / 4.4) + 1) : null;
  return frWrap(`${w !== null && w >= 41 ? levelCard(2, ["Tu as dépassé 41 semaines de grossesse."]) : ""}
  ${journalCard("preg", "Mon journal du jour")}
  ${historyDetails(["preg"], "Mon historique et résumé pour la sage-femme")}
  ${agendaCard("preg", "Mes consultations et échographies")}
  <h3 style="margin-top:16px">Mois par mois</h3>${MONTHS.map(m => monthCard(m, m.m === mon)).join("")}
  <h3 style="margin-top:16px">Début de grossesse</h3><details><summary>Les premiers signes</summary><div class="in">${earlyBlock()}</div></details>
  <h3 style="margin-top:16px">Risques et complications</h3>${COMPLICATIONS.map(complCard).join("")}
  <h3 style="margin-top:16px">L'accouchement</h3>${LEARN.find(x => x.id === "birth").arts.map(artCard).join("")}`);
}
function babyExtras() {
  const meas = S.get("meas", []);
  return frWrap(`<h3 style="margin-top:16px">Ma santé après l'accouchement</h3>
  ${journalCard("post", "Mon journal du jour (moi)")}
  ${MOTHER.map(motherCard).join("")}
  <h3 style="margin-top:16px">Allaitement</h3>${BREASTFEEDING.map(bfCard).join("")}
  <h3 style="margin-top:16px">Mon bébé</h3>
  <div class="card"><h3>Carnet du bébé</h3><div class="grid2"><div><label for="mw">Poids (kg)</label><input type="number" step="0.01" min="0" id="mw" inputmode="decimal"></div><div><label for="mh">Taille (cm)</label><input type="number" step="0.1" min="0" id="mh" inputmode="decimal"></div></div><label for="mhc">Périmètre crânien (cm)</label><input type="number" step="0.1" min="0" id="mhc" inputmode="decimal">
  <button class="btn teal" data-act="savemeas">Ajouter la pesée du jour</button>
  ${meas.length ? `<table class="m"><tr><th>Date</th><th>Poids (kg)</th><th>Taille (cm)</th><th>PC (cm)</th></tr>${meas.slice().reverse().map(m => `<tr><td>${xFmtS(parse(m.date))}</td><td>${m.w || "–"}</td><td>${m.h || "–"}</td><td>${m.hc || "–"}</td></tr>`).join("")}</table>` : `<p class="muted small">Note ici chaque pesée faite au centre de santé.</p>`}</div>
  ${journalCard("baby", "Journal du bébé (tétées, couches, santé)")}
  ${BABY.map(babyCard).join("")}
  ${historyDetails(["post", "baby"], "Mon historique et résumé pour la sage-femme")}
  ${agendaCard("post", "Rendez-vous et vaccins")}`);
}
function learnExtras() {
  const ref = { early: () => `<div class="in">${earlyBlock()}</div>`, months: () => MONTHS.map(m => monthCard(m, false)).join(""), compl: () => COMPLICATIONS.map(complCard).join(""), mother: () => MOTHER.map(motherCard).join(""), bf: () => BREASTFEEDING.map(bfCard).join(""), baby: () => BABY.map(babyCard).join(""), urg: () => `<p>Tous les signes d'urgence sont dans l'onglet rouge « Urgence », accessible depuis chaque écran.</p>` };
  return frWrap(`<h3 style="margin-top:16px">Les 12 thèmes</h3>${LEARN.map((th, i) => `<details><summary><span class="badge" style="background:var(--powder);color:var(--plum)">${i + 1}</span> ${th.t}</summary><div class="in">${th.arts ? th.arts.map(artCard).join("") : ref[th.ref]()}</div></details>`).join("")}
  <div class="card"><h3>Bientôt (phase 2)</h3><p class="muted">Cancers féminins : sein et col de l'utérus.</p></div>`);
}
function sosExtras() {
  return frWrap(`${numsCard()}
  <div class="card"><h3>Les 3 niveaux d'urgence</h3>${[1, 2, 3].map(l => `<p>${xBadge(l)} ${LEVELS[l].msg}</p>`).join("")}</div>
  ${EMERGENCIES.map(c => `<h3 style="margin-top:16px">${c.t}</h3>${c.items.map(emergencyCard).join("")}`).join("")}`);
}

/* ---------- Actions ---------- */
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
  if (d.sym) { b.classList.toggle("on"); return; }
  const a = d.act; if (!a) return;
  if (a === "savelog") {
    const ctx = d.ctx, day = xIso(today()), logs = xLogs(), entry = logs[day] || {};
    entry[ctx] = [...document.querySelectorAll(`.chip.on[data-ctx="${ctx}"]`)].map(x => x.dataset.sym);
    if (["cycle", "preg", "post", "baby"].every(k => !(entry[k] || []).length)) delete logs[day]; else logs[day] = entry;
    S.set("logs", logs); const box = document.getElementById("jres-" + ctx); box.innerHTML = resultHtml(ctx) || `<p class="muted small">Rien de noté aujourd'hui.</p>`; box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else if (a === "savenums") { S.set("nums", { centre: $("#nc").value.trim(), trust: $("#nt").value.trim(), amb: $("#na").value.trim() }); rerender(); }
  else if (a === "savemeas") { const m = { date: xIso(today()), w: $("#mw").value, h: $("#mh").value, hc: $("#mhc").value }; if (m.w || m.h || m.hc) { const l = S.get("meas", []); l.push(m); S.set("meas", l); rerender(); } }
  else if (a === "addappt") { const k = d.kind, l = S.get("appts", []); l.push({ kind: k, date: $("#ad-" + k).value, type: $("#at-" + k).value, note: $("#an-" + k).value.trim() }); S.set("appts", l); rerender(); }
  else if (a === "delappt") { const l = S.get("appts", []); l.splice(+d.i, 1); S.set("appts", l); rerender(); }
});
