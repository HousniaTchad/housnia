/* Housnia v2 – contenus (français).
   PROTOTYPE : tous ces contenus sont un brouillon à valider par le comité médical
   (sages-femmes, gynécologue, pédiatre) et à aligner sur les protocoles nationaux du Tchad. */
"use strict";

/* ---------- Niveaux d'orientation ---------- */
const LEVELS = {
  0: { name: "Habituel", short: "Habituel", color: "#2E7D6B", bg: "#E3F4F1",
       msg: "C'est souvent normal. Continue à surveiller et note-le dans ton journal." },
  3: { name: "Consultation programmée", short: "À programmer", color: "#2E7D32", bg: "#E6F4E7",
       msg: "Parles-en à ta sage-femme à ton prochain rendez-vous, ou dans les prochains jours." },
  2: { name: "Consultation aujourd'hui", short: "Aujourd'hui", color: "#B85C00", bg: "#FFF1E0",
       msg: "Va au centre de santé AUJOURD'HUI." },
  1: { name: "Urgence immédiate", short: "Urgence", color: "#C62828", bg: "#FDECEC",
       msg: "Va TOUT DE SUITE au centre de santé ou à l'hôpital. Appelle les secours ou une personne de confiance." }
};
const ORDER = [1, 2, 3, 0];

/* ---------- Symptômes du journal ----------
   lv : niveau selon le contexte ("cycle" = hors grossesse, "preg" = enceinte, "post" = après l'accouchement)
   lv peut être une fonction (ctx, info) -> niveau.  info : { weeks, babyDays } */
const SYMPTOMS = {
  cycle: [
    { cat: "Flux", items: [
      { id: "f_spot", t: "Petites taches (spotting)", lv: 0 },
      { id: "f_light", t: "Léger", lv: 0 },
      { id: "f_mid", t: "Moyen", lv: 0 },
      { id: "f_heavy", t: "Abondant", lv: 0 },
      { id: "f_vheavy", t: "Très abondant (serviette pleine chaque heure)", lv: 2, why: "Des règles très abondantes peuvent fatiguer et causer une anémie." },
      { id: "f_dizzy", t: "Vertiges ou malaise pendant les règles", lv: 2, why: "Un malaise avec des règles abondantes doit être vérifié aujourd'hui." }
    ]},
    { cat: "Douleurs", items: [
      { id: "p_cramps", t: "Crampes", lv: 0 },
      { id: "p_belly", t: "Douleur au ventre", lv: 0 },
      { id: "p_back", t: "Douleur bas du dos", lv: 0 },
      { id: "p_pelvic", t: "Douleur pelvienne", lv: 0 },
      { id: "p_strong", t: "Douleur forte qui empêche de marcher ou d'aller à l'école", lv: 3, why: "Des douleurs fortes ne sont pas « normales » : une sage-femme peut t'aider." },
      { id: "p_sudden", t: "Douleur forte et soudaine d'un seul côté", lv: 1, why: "Avec un retard de règles, cela peut être une grossesse extra-utérine." }
    ]},
    { cat: "Corps", items: [
      { id: "b_tired", t: "Fatigue", lv: 0 }, { id: "b_head", t: "Maux de tête", lv: 0 },
      { id: "b_naus", t: "Nausées", lv: 0 }, { id: "b_bloat", t: "Ballonnements", lv: 0 },
      { id: "b_breast", t: "Seins sensibles", lv: 0 }, { id: "b_acne", t: "Acné", lv: 0 },
      { id: "b_transit", t: "Diarrhée ou constipation", lv: 0 },
      { id: "b_fever", t: "Fièvre", lv: 2, why: "La fièvre doit être vérifiée, surtout avec une douleur au bas-ventre." }
    ]},
    { cat: "Humeur", items: [
      { id: "m_calm", t: "Calme", lv: 0 }, { id: "m_irrit", t: "Irritable", lv: 0 },
      { id: "m_anx", t: "Anxieuse", lv: 0 }, { id: "m_sad", t: "Triste", lv: 0 },
      { id: "m_swing", t: "Sautes d'humeur", lv: 0 },
      { id: "m_harm", t: "Envie de me faire du mal", lv: 1, harm: true }
    ]},
    { cat: "Pertes vaginales", items: [
      { id: "d_white", t: "Blanches, sans odeur", lv: 0, why: "Pertes normales : elles changent au cours du cycle." },
      { id: "d_clear", t: "Transparentes et élastiques", lv: 0, why: "Souvent un signe d'ovulation." },
      { id: "d_creamy", t: "Crémeuses", lv: 0 },
      { id: "d_brown", t: "Brunes, juste avant ou après les règles", lv: 0, why: "Souvent du vieux sang. Consulte si cela dure." },
      { id: "d_pink", t: "Rosées", lv: 0 },
      { id: "d_clumpy", t: "Blanches en grumeaux avec démangeaisons", lv: 3, why: "Peut être une mycose : un traitement existe." },
      { id: "d_grey", t: "Grises ou odeur de poisson", lv: 3, why: "Peut être une infection." },
      { id: "d_yellow", t: "Jaunes ou vertes, odeur forte", lv: 2, why: "Peut être une infection à traiter rapidement." },
      { id: "d_burn", t: "Brûlures ou démangeaisons", lv: 3 },
      { id: "d_fever", t: "Pertes avec fièvre ou douleur au bas-ventre", lv: 2, why: "Peut être une infection de l'utérus ou des trompes." }
    ]},
    { cat: "Autres", items: [
      { id: "o_bleed", t: "Saignement en dehors des règles", lv: 3, why: "Un saignement en dehors des règles doit être vérifié." },
      { id: "o_ovul", t: "Signes d'ovulation", lv: 0 },
      { id: "o_test_pos", t: "Test de grossesse positif", lv: 3, why: "Va au centre de santé pour ta première consultation prénatale, idéalement avant 12 semaines." }
    ]}
  ],
  preg: [
    { cat: "Signes fréquents", items: [
      { id: "g_naus", t: "Nausées ou vomissements", lv: 0 },
      { id: "g_vomit_all", t: "Vomit tout, ne garde rien", lv: 2, why: "Risque de déshydratation." },
      { id: "g_tired", t: "Fatigue", lv: 0 }, { id: "g_heart", t: "Brûlures d'estomac", lv: 0 },
      { id: "g_legs", t: "Jambes lourdes", lv: 0 }, { id: "g_back", t: "Mal au dos", lv: 0 },
      { id: "g_const", t: "Constipation", lv: 0 }, { id: "g_pee", t: "Envies fréquentes d'uriner", lv: 0 },
      { id: "g_disch", t: "Pertes blanches plus abondantes", lv: 0 },
      { id: "g_irreg", t: "Contractions irrégulières sans douleur", lv: 0, why: "Fréquentes en fin de grossesse. Consulte si elles deviennent régulières." }
    ]},
    { cat: "Pertes et urines", items: [
      { id: "g_yellow", t: "Pertes jaunes ou vertes, odeur forte", lv: 2 },
      { id: "g_burnpee", t: "Brûlures en urinant", lv: 2, why: "Une infection urinaire doit être traitée pendant la grossesse." }
    ]},
    { cat: "Humeur", items: [
      { id: "g_anx", t: "Anxieuse", lv: 0 }, { id: "g_sad", t: "Triste depuis plusieurs jours", lv: 3 },
      { id: "g_harm", t: "Envie de me faire du mal", lv: 1, harm: true }
    ]},
    { cat: "Signes de danger", danger: true, items: [
      { id: "g_bleed", t: "Saignement par le vagin", lv: 1, why: "Tout saignement pendant la grossesse est un signe de danger." },
      { id: "g_belly", t: "Douleur forte au ventre", lv: 1 },
      { id: "g_headache", t: "Maux de tête très forts", lv: 1, why: "Peut être une prééclampsie (tension trop haute)." },
      { id: "g_vision", t: "Vue trouble ou points lumineux", lv: 1, why: "Peut être une prééclampsie." },
      { id: "g_swell", t: "Gonflement soudain du visage ou des mains", lv: 1, why: "Peut être une prééclampsie." },
      { id: "g_fever", t: "Fièvre", lv: 2, why: "Peut être un paludisme ou une infection : à traiter vite." },
      { id: "g_water", t: "Liquide qui coule par le vagin", lv: 1, why: "La poche des eaux peut être rompue." },
      { id: "g_contr", t: "Contractions régulières", lv: (c, i) => (i.weeks !== null && i.weeks < 37 ? 1 : 2), why: "Avant 37 semaines : risque d'accouchement prématuré." },
      { id: "g_move", t: "Le bébé bouge moins ou ne bouge plus", lv: (c, i) => (i.weeks !== null && i.weeks < 20 ? 3 : 1), why: "Après 5 mois, le bébé doit bouger tous les jours." },
      { id: "g_breath", t: "Difficulté à respirer ou douleur dans la poitrine", lv: 1 },
      { id: "g_conv", t: "Convulsions ou évanouissement", lv: 1 }
    ]}
  ],
  post: [
    { cat: "Saignements", items: [
      { id: "q_lochia", t: "Saignement léger ou moyen", lv: 0, why: "Normal pendant 4 à 6 semaines : rouge, puis rosé, puis brun." },
      { id: "q_soak", t: "Serviette trempée en moins d'une heure", lv: 1, why: "Possible hémorragie." },
      { id: "q_clots", t: "Gros caillots", lv: 1 },
      { id: "q_smell", t: "Pertes qui sentent mauvais", lv: 2, why: "Possible infection de l'utérus." }
    ]},
    { cat: "Corps", items: [
      { id: "q_cramps", t: "Crampes pendant les tétées", lv: 0 },
      { id: "q_perineum", t: "Douleur du périnée ou de la cicatrice", lv: 0 },
      { id: "q_wound", t: "Cicatrice rouge, avec pus ou qui s'ouvre", lv: 2 },
      { id: "q_engorged", t: "Seins tendus (montée de lait)", lv: 0 },
      { id: "q_cracks", t: "Crevasses aux mamelons", lv: 3 },
      { id: "q_mastitis", t: "Sein rouge, chaud et douloureux", lv: 2, why: "Possible mastite : continue d'allaiter et consulte." },
      { id: "q_fever", t: "Fièvre", lv: 2 },
      { id: "q_leak", t: "Fuites d'urine", lv: 3 }, { id: "q_const", t: "Constipation ou hémorroïdes", lv: 0 },
      { id: "q_tired", t: "Fatigue", lv: 0 }
    ]},
    { cat: "Moral", items: [
      { id: "q_blues", t: "Pleurs, tristesse (premiers jours)", lv: 0, why: "Le baby blues est fréquent les 2 premières semaines." },
      { id: "q_anx", t: "Anxiété forte", lv: 3 },
      { id: "q_sad2w", t: "Triste depuis plus de 2 semaines", lv: 2, why: "Peut être une dépression post-partum : elle se soigne." },
      { id: "q_harm", t: "Envie de me faire du mal ou de faire du mal au bébé", lv: 1, harm: true }
    ]},
    { cat: "Signes de danger", danger: true, items: [
      { id: "q_belly", t: "Douleur forte au ventre", lv: 1 },
      { id: "q_head", t: "Maux de tête très forts ou vue trouble", lv: 1, why: "La prééclampsie peut aussi arriver après l'accouchement." },
      { id: "q_breath", t: "Essoufflement ou douleur dans la poitrine", lv: 1 },
      { id: "q_leg", t: "Jambe douloureuse ou gonflée", lv: 1, why: "Possible caillot dans une veine." },
      { id: "q_conv", t: "Convulsions ou évanouissement", lv: 1 }
    ]}
  ],
  baby: [
    { cat: "Alimentation", items: [
      { id: "k_feedok", t: "Tète bien", lv: 0 },
      { id: "k_nofeed", t: "Tète mal ou refuse le sein", lv: (c, i) => (i.babyDays !== null && i.babyDays < 60 ? 1 : 2) },
      { id: "k_vomitall", t: "Vomit tout", lv: 2 },
      { id: "k_spit", t: "Régurgitations après les tétées", lv: 0, why: "Fréquent si le bébé prend du poids et va bien." }
    ]},
    { cat: "Couches", items: [
      { id: "k_wet", t: "Couches bien mouillées", lv: 0 },
      { id: "k_dry", t: "Pas de couche mouillée depuis 6 heures, bouche sèche", lv: 1, why: "Signe de déshydratation." },
      { id: "k_diar", t: "Diarrhée", lv: (c, i) => (i.babyDays !== null && i.babyDays < 90 ? 2 : 3) },
      { id: "k_const", t: "Selles dures", lv: 3 },
      { id: "k_rash", t: "Fesses rouges", lv: 0, why: "Change souvent la couche et laisse les fesses à l'air." }
    ]},
    { cat: "Santé", items: [
      { id: "k_colic", t: "Pleure longtemps le soir (coliques)", lv: 0 },
      { id: "k_fever", t: "Fièvre (corps chaud)", lv: (c, i) => (i.babyDays !== null && i.babyDays < 90 ? 1 : 2), why: "Avant 3 mois, toute fièvre est une urgence." },
      { id: "k_cold", t: "Corps froid", lv: 1 },
      { id: "k_cough", t: "Toux ou nez bouché", lv: 3 },
      { id: "k_jaundice", t: "Peau ou yeux jaunes", lv: (c, i) => (i.babyDays !== null && i.babyDays < 2 ? 1 : 2), why: "Une jaunisse le premier jour est une urgence." },
      { id: "k_jaundice2", t: "Jaunisse jusqu'aux mains et aux pieds", lv: 1 },
      { id: "k_cord", t: "Cordon rouge, qui sent mauvais ou avec pus", lv: 2 }
    ]},
    { cat: "Signes de danger", danger: true, items: [
      { id: "k_breath", t: "Respire vite ou avec difficulté", lv: 1 },
      { id: "k_sleepy", t: "Difficile à réveiller, très mou", lv: 1 },
      { id: "k_conv", t: "Convulsions", lv: 1 },
      { id: "k_blue", t: "Peau bleutée ou très pâle", lv: 1 }
    ]}
  ]
};

const HARM_MSG = "Tu n'es pas seule et ce que tu ressens peut se soigner. Ne reste pas seule maintenant : appelle une personne de confiance et va au centre de santé tout de suite. Une sage-femme ou un médecin peut t'aider.";

/* ---------- Gestes en attendant les soins ---------- */
const WAIT = {
  bleed: "Allonge-toi, garde une serviette pour voir la quantité de sang, ne mets rien dans le vagin, et fais-toi accompagner tout de suite.",
  general: "Ne reste pas seule. Prends ton carnet de santé et fais-toi accompagner au centre de santé.",
  breath: "Assieds-toi en position droite, desserre tes vêtements, et fais-toi accompagner tout de suite.",
  conv: "Allonge la personne sur le côté, éloigne les objets dangereux, ne mets rien dans sa bouche, et appelle les secours.",
  baby: "Garde le bébé au chaud contre toi (peau à peau), continue de lui proposer le sein s'il peut téter, et pars tout de suite au centre de santé.",
  water: "Mets une serviette propre, ne prends pas de bain, note l'heure et la couleur du liquide, et va au centre de santé.",
  harm: HARM_MSG
};

/* ---------- Urgences : 4 catégories, 6 champs ---------- */
const EMERGENCIES = [
  { id: "gyn", t: "Urgences gynécologiques", items: [
    { t: "Douleur pelvienne forte ou soudaine", s: "Douleur très forte au bas-ventre, qui arrive d'un coup, parfois d'un seul côté.", r: "Grossesse extra-utérine, kyste qui se tord, infection grave.", lv: 1, w: WAIT.general, call: "Si tu as aussi un malaise, des vertiges ou un saignement." },
    { t: "Saignement abondant ou inhabituel", s: "Serviette pleine en moins d'une heure, gros caillots, saignement en dehors des règles.", r: "Perte de sang importante, anémie, malaise.", lv: 1, w: WAIT.bleed, call: "Si tu es pâle, essoufflée, ou si tu te sens partir." },
    { t: "Suspicion de grossesse extra-utérine", s: "Retard de règles avec douleur d'un côté, petit saignement, douleur à l'épaule, malaise.", r: "Saignement interne grave qui met la vie en danger.", lv: 1, w: WAIT.general, call: "Tout de suite si la douleur est forte ou s'il y a un malaise." },
    { t: "Fièvre avec douleur au bas-ventre", s: "Fièvre, douleur du bas-ventre, parfois pertes anormales.", r: "Infection de l'utérus ou des trompes, qui peut rendre stérile.", lv: 2, w: WAIT.general, call: "Si la fièvre est très forte ou s'il y a des frissons et une confusion." },
    { t: "Pertes anormales avec douleur ou fièvre", s: "Pertes jaunes, vertes ou malodorantes, avec douleur ou fièvre.", r: "Infection qui peut s'étendre.", lv: 2, w: WAIT.general, call: "Si la douleur devient très forte." },
    { t: "Malaise ou perte de connaissance", s: "Vertiges, vue qui se trouble, chute, perte de connaissance.", r: "Saignement interne, anémie grave, autre urgence.", lv: 1, w: "Allonge la personne, jambes surélevées, sur le côté si elle ne répond pas. Appelle les secours.", call: "Toujours, si elle a perdu connaissance." }
  ]},
  { id: "preg", t: "Pendant la grossesse", items: [
    { t: "Saignement", s: "Tout saignement par le vagin, même petit.", r: "Fausse couche, grossesse extra-utérine, problème du placenta.", lv: 1, w: WAIT.bleed, call: "Si le saignement est abondant ou avec douleur." },
    { t: "Douleur forte au ventre", s: "Douleur intense, ventre dur, douleur qui ne passe pas.", r: "Décollement du placenta, accouchement prématuré, autre urgence.", lv: 1, w: WAIT.general, call: "Si le ventre est dur et douloureux en permanence." },
    { t: "Maux de tête violents ou troubles de la vue", s: "Mal de tête très fort, vue trouble, points lumineux, douleur en haut du ventre.", r: "Prééclampsie, qui peut mener à des convulsions (éclampsie).", lv: 1, w: WAIT.general, call: "Tout de suite." },
    { t: "Gonflement soudain du visage ou des mains", s: "Visage, mains ou pieds qui gonflent d'un coup.", r: "Prééclampsie.", lv: 1, w: WAIT.general, call: "Surtout avec maux de tête ou troubles de la vue." },
    { t: "Difficulté à respirer", s: "Essoufflement au repos, respiration rapide.", r: "Problème du cœur ou des poumons, caillot, anémie grave.", lv: 1, w: WAIT.breath, call: "Tout de suite." },
    { t: "Douleur dans la poitrine", s: "Douleur ou serrement dans la poitrine.", r: "Caillot dans le poumon, problème du cœur.", lv: 1, w: WAIT.breath, call: "Tout de suite." },
    { t: "Perte de liquide", s: "Liquide qui coule par le vagin, sans pouvoir l'arrêter.", r: "Infection, accouchement prématuré.", lv: 1, w: WAIT.water, call: "Si le liquide est vert, brun ou sent mauvais, ou avec fièvre." },
    { t: "Contractions régulières avant 37 semaines", s: "Ventre qui durcit régulièrement, de plus en plus souvent, avant le 9e mois.", r: "Accouchement prématuré.", lv: 1, w: WAIT.general, call: "Si les contractions arrivent toutes les 10 minutes ou moins." },
    { t: "Le bébé bouge moins ou ne bouge plus", s: "Moins de mouvements que d'habitude, ou plus aucun.", r: "Le bébé peut être en souffrance.", lv: 1, w: "Allonge-toi sur le côté gauche pendant 30 minutes en comptant les mouvements, puis va au centre de santé même s'il bouge.", call: "Tout de suite s'il ne bouge plus du tout." },
    { t: "Convulsions ou perte de connaissance", s: "Corps qui se raidit, secousses, ne répond plus.", r: "Éclampsie : danger pour la mère et le bébé.", lv: 1, w: WAIT.conv, call: "Toujours." }
  ]},
  { id: "post", t: "Après l'accouchement", items: [
    { t: "Hémorragie", s: "Serviette trempée en moins d'une heure, gros caillots, vertiges.", r: "Perte de sang grave : première cause de décès maternel.", lv: 1, w: WAIT.bleed + " Masse ton ventre au-dessus du nombril pour aider l'utérus à se contracter.", call: "Toujours." },
    { t: "Fièvre forte", s: "Fièvre, frissons, pertes qui sentent mauvais.", r: "Infection de l'utérus (septicémie).", lv: 1, w: WAIT.general, call: "Si confusion, frissons forts ou malaise." },
    { t: "Douleur forte au ventre", s: "Douleur intense qui ne passe pas.", r: "Infection, saignement interne.", lv: 1, w: WAIT.general, call: "Tout de suite." },
    { t: "Maux de tête violents ou troubles de la vue", s: "Mal de tête très fort, vue trouble, points lumineux.", r: "Prééclampsie après l'accouchement, convulsions.", lv: 1, w: WAIT.general, call: "Tout de suite." },
    { t: "Douleur dans la poitrine ou essoufflement", s: "Respiration difficile, douleur dans la poitrine.", r: "Caillot dans le poumon.", lv: 1, w: WAIT.breath, call: "Toujours." },
    { t: "Jambe douloureuse ou gonflée", s: "Une jambe rouge, chaude, gonflée ou douloureuse.", r: "Caillot dans une veine, qui peut aller au poumon.", lv: 1, w: "Ne masse pas la jambe. Fais-toi accompagner au centre de santé.", call: "Si tu as aussi du mal à respirer." },
    { t: "Signes d'infection", s: "Cicatrice rouge ou avec pus, sein rouge et chaud, pertes malodorantes, fièvre.", r: "Infection qui peut s'aggraver.", lv: 2, w: WAIT.general, call: "Si la fièvre est forte ou s'il y a un malaise." },
    { t: "Dépression sévère ou pensées suicidaires", s: "Tristesse profonde, plus envie de rien, envie de se faire du mal ou de faire du mal au bébé.", r: "Danger pour la mère et le bébé. Cela se soigne.", lv: 1, w: WAIT.harm, call: "Tout de suite : ne reste pas seule." }
  ]},
  { id: "baby", t: "Chez le nouveau-né", items: [
    { t: "Difficulté à respirer", s: "Respire très vite, ventre qui se creuse sous les côtes, bruit en respirant, pauses.", r: "Infection grave des poumons.", lv: 1, w: WAIT.baby, call: "Toujours." },
    { t: "Fièvre avant 3 mois", s: "Corps chaud (38 °C ou plus), ou au contraire corps froid.", r: "Infection grave du sang ou des méninges.", lv: 1, w: WAIT.baby, call: "Toujours avant 3 mois." },
    { t: "Refuse de téter", s: "Ne tète plus, ou tète très peu.", r: "Infection, déshydratation, hypoglycémie.", lv: 1, w: WAIT.baby, call: "S'il est aussi mou ou difficile à réveiller." },
    { t: "Difficile à réveiller", s: "Très endormi, mou, ne réagit presque pas.", r: "Infection grave.", lv: 1, w: WAIT.baby, call: "Toujours." },
    { t: "Déshydratation", s: "Bouche sèche, pas de couche mouillée depuis 6 heures, fontanelle creuse, pleure sans larmes.", r: "Danger rapide chez le bébé.", lv: 1, w: WAIT.baby, call: "Toujours, surtout avec diarrhée ou vomissements." },
    { t: "Convulsions", s: "Secousses, raideur, regard fixe.", r: "Infection grave, fièvre, autre urgence.", lv: 1, w: "Pose le bébé sur le côté, ne mets rien dans sa bouche, ne le secoue pas, et pars tout de suite.", call: "Toujours." },
    { t: "Peau bleutée ou très pâle", s: "Lèvres ou peau bleues, bébé très pâle.", r: "Manque d'oxygène, problème du cœur.", lv: 1, w: WAIT.baby, call: "Toujours." },
    { t: "Jaunisse importante", s: "Peau jaune dès le premier jour, ou jaune jusqu'aux mains et aux pieds.", r: "Atteinte du cerveau si elle n'est pas traitée.", lv: 1, w: WAIT.baby, call: "Toujours si la jaunisse s'étend ou si le bébé tète mal." }
  ]}
];

/* ---------- Grossesse : premiers signes ---------- */
const EARLY_SIGNS = ["Retard de règles", "Nausées et vomissements", "Fatigue inhabituelle", "Seins sensibles ou douloureux",
  "Envies fréquentes d'uriner", "Tiraillements dans le bas-ventre", "Ballonnements", "Pertes plus abondantes",
  "Sensibilité aux odeurs", "Changements d'appétit"];
const EARLY_NOTE = "Ces signes rendent une grossesse POSSIBLE, mais ne la prouvent pas : ils peuvent avoir d'autres causes. Seuls un test de grossesse, l'examen de la sage-femme ou une échographie la CONFIRMENT.";
const EARLY_ALERT = "Petit saignement, douleur d'un seul côté ou vertiges en début de grossesse : va au centre de santé (aujourd'hui, ou tout de suite si la douleur est forte).";

/* ---------- Grossesse : mois par mois ---------- */
const MONTHS = [
  { m: 1, w: "Semaines 1 à 4", baby: "L'œuf se fixe dans l'utérus.", mom: "Retard de règles, parfois aucun signe.", exam: "Test de grossesse.", tip: "Commence l'acide folique dès que tu sais que tu es enceinte, selon la sage-femme.", warn: "Douleur d'un seul côté ou saignement." },
  { m: 2, w: "Semaines 5 à 8", baby: "Le cœur commence à battre. Il mesure environ 1,5 cm.", mom: "Nausées, fatigue, seins sensibles, envies d'uriner.", exam: "Premier contact prénatal le plus tôt possible, avant 12 semaines.", tip: "Mange de petits repas souvent et bois beaucoup d'eau.", warn: "Saignement, douleur forte, vomit tout." },
  { m: 3, w: "Semaines 9 à 13", baby: "Tous les organes se forment. Il mesure environ 6 cm.", mom: "Les nausées diminuent souvent.", exam: "Prise de sang, dépistages (VIH, syphilis, anémie), fer et acide folique, vaccin antitétanique.", tip: "Dors sous une moustiquaire imprégnée chaque nuit.", warn: "Saignement, fièvre, brûlures en urinant." },
  { m: 4, w: "Semaines 14 à 17", baby: "Il mesure environ 12 cm. Il bouge, mais tu ne le sens pas encore.", mom: "Plus d'énergie, le ventre s'arrondit.", exam: "Échographie recommandée avant 24 semaines. Traitement préventif du paludisme selon la sage-femme.", tip: "Mange des aliments riches en fer : haricots, feuilles vertes, viande, poisson.", warn: "Saignement, fièvre." },
  { m: 5, w: "Semaines 18 à 22", baby: "Il mesure environ 25 cm. Tu sens ses premiers mouvements.", mom: "Mal au dos possible.", exam: "Contact prénatal vers 20 semaines.", tip: "Repose-toi sur le côté gauche quand tu peux.", warn: "Saignement, liquide qui coule, maux de tête violents." },
  { m: 6, w: "Semaines 23 à 27", baby: "Il entend les sons. Il pèse environ 800 g.", mom: "Jambes lourdes, brûlures d'estomac.", exam: "Contact vers 26 semaines. Dépistage du diabète si nécessaire.", tip: "Parle à ton bébé : il entend ta voix.", warn: "Bébé qui bouge moins, gonflement du visage, contractions régulières." },
  { m: 7, w: "Semaines 28 à 31", baby: "Il ouvre les yeux. Il pèse environ 1,3 kg.", mom: "Essoufflement, sommeil plus difficile.", exam: "Contact vers 30 semaines. La tension est surveillée.", tip: "Compte chaque jour les mouvements du bébé.", warn: "Bébé qui bouge moins, maux de tête, vue trouble, contractions régulières." },
  { m: 8, w: "Semaines 32 à 35", baby: "Il pèse environ 2,2 kg et se met souvent tête en bas.", mom: "Contractions irrégulières sans douleur possibles.", exam: "Contact vers 34 semaines.", tip: "Prépare ton sac et ton transport pour accoucher au centre de santé.", warn: "Contractions régulières, liquide qui coule, saignement." },
  { m: 9, w: "Semaines 36 à 40", baby: "À terme dès 37 semaines. Il pèse environ 3 kg.", mom: "Le ventre descend, les contractions se rapprochent.", exam: "Contacts à 36, 38 et 40 semaines. Accouche au centre de santé.", tip: "Va au centre de santé quand les contractions sont régulières et rapprochées, ou si tu perds les eaux.", warn: "Saignement, bébé qui ne bouge plus, toujours pas accouché à 41 semaines." }
];

/* ---------- Grossesse : complications ---------- */
const COMPLICATIONS = [
  { t: "Fausse couche", s: "Saignement, crampes, perte de tissus, en début de grossesse.", r: "Saignement important, infection.", lv: 2, lvNote: "Urgence immédiate si le saignement est abondant." },
  { t: "Grossesse extra-utérine", s: "Douleur forte d'un côté, saignement, malaise, douleur à l'épaule.", r: "Saignement interne qui peut être mortel.", lv: 1 },
  { t: "Prééclampsie", s: "Maux de tête violents, vue trouble, gonflement soudain du visage ou des mains, douleur en haut du ventre.", r: "Convulsions (éclampsie), danger pour la mère et le bébé.", lv: 1 },
  { t: "Diabète gestationnel", s: "Souvent aucun signe. Parfois soif et urines fréquentes.", r: "Bébé très gros, accouchement difficile.", lv: 3, lvNote: "Fais le dépistage proposé au centre de santé." },
  { t: "Infections (urinaire, paludisme, autres)", s: "Fièvre, frissons, brûlures en urinant, pertes anormales.", r: "Anémie, accouchement prématuré, infection du bébé.", lv: 2, lvNote: "Urgence immédiate si fièvre très forte ou confusion." },
  { t: "Saignement pendant la grossesse", s: "Tout saignement par le vagin.", r: "Fausse couche, problème du placenta.", lv: 1 },
  { t: "Perte de liquide amniotique", s: "Liquide qui coule par le vagin sans contrôle.", r: "Infection, accouchement prématuré.", lv: 1 },
  { t: "Contractions prématurées", s: "Contractions régulières avant 37 semaines.", r: "Bébé né trop tôt.", lv: 1 },
  { t: "Retard de croissance du bébé", s: "Ventre qui grossit peu, bébé qui bouge moins.", r: "Bébé trop petit, fragile.", lv: 2, lvNote: "Urgence immédiate si le bébé ne bouge plus." },
  { t: "Complications du placenta", s: "Saignement, douleur au ventre, ventre dur.", r: "Hémorragie, souffrance du bébé.", lv: 1 },
  { t: "Accouchement prématuré", s: "Contractions régulières, liquide, pression dans le bas-ventre avant 37 semaines.", r: "Bébé fragile qui a besoin de soins.", lv: 1 },
  { t: "Dépassement du terme", s: "Toujours pas d'accouchement à 41 semaines.", r: "Le placenta fonctionne moins bien, risque pour le bébé.", lv: 2 }
];

/* ---------- Après bébé : la mère ---------- */
const MOTHER = [
  { t: "Saignements (lochies)", ok: "Rouges, puis rosés, puis bruns, pendant 4 à 6 semaines.", go: "Serviette trempée en moins d'une heure ou gros caillots.", lv: 1 },
  { t: "Contractions de l'utérus", ok: "Crampes surtout pendant les tétées, les premiers jours.", go: "Douleur très forte au ventre.", lv: 1 },
  { t: "Périnée, épisiotomie, césarienne", ok: "Douleur qui diminue jour après jour.", go: "Rougeur, pus, mauvaise odeur, cicatrice qui s'ouvre.", lv: 2 },
  { t: "Fatigue et sommeil", ok: "Grande fatigue les premières semaines. Dors quand le bébé dort.", go: "Fatigue qui ne s'améliore pas, essoufflement.", lv: 3 },
  { t: "Seins : engorgement et crevasses", ok: "Seins tendus à la montée de lait, mamelons sensibles au début.", go: "Sein rouge, chaud, douloureux, avec fièvre.", lv: 2 },
  { t: "Fièvre et infection", ok: "Pas de fièvre attendue.", go: "Toute fièvre ; urgence si frissons forts ou confusion.", lv: 2 },
  { t: "Urines, transit, hémorroïdes", ok: "Gênes fréquentes les premiers jours. Bois beaucoup, mange des fruits et légumes.", go: "Fuites ou douleurs qui durent.", lv: 3 },
  { t: "Changements hormonaux", ok: "Transpiration, cheveux qui tombent, émotions fortes : fréquents.", go: "Si cela t'inquiète, parles-en à la sage-femme.", lv: 3 },
  { t: "Baby blues", ok: "Pleurs et tristesse les 2 premières semaines, qui passent seuls.", go: "Tristesse qui dure plus de 2 semaines.", lv: 3 },
  { t: "Dépression et anxiété post-partum", ok: "Pas attendu. Cela se soigne.", go: "Tristesse profonde, plus envie de rien, peur permanente. Urgence si envie de se faire du mal.", lv: 2 },
  { t: "Jambe douloureuse ou gonflée", ok: "Pas attendu.", go: "Toujours : risque de caillot.", lv: 1 }
];

/* ---------- Allaitement ---------- */
const BREASTFEEDING = [
  { t: "Combien de tétées ?", b: "Le nouveau-né tète souvent : environ 8 à 12 fois par 24 heures, jour et nuit. Donne le sein à la demande, dès qu'il montre qu'il a faim." },
  { t: "Combien de temps ?", b: "Laisse-le téter tant qu'il veut sur le premier sein, puis propose le deuxième. Une tétée dure souvent 10 à 40 minutes." },
  { t: "Signes de faim et de satiété", b: "Faim : il tourne la tête, ouvre la bouche, suce ses mains. Les pleurs sont un signe tardif. Satiété : il lâche le sein, ses mains s'ouvrent, il s'endort calme." },
  { t: "Boit-il assez ?", b: "Oui si, après le 5e jour, il mouille au moins 6 couches par jour, fait des selles régulières, est éveillé et prend du poids à la pesée." },
  { t: "La montée de lait", b: "Elle arrive souvent 2 à 4 jours après la naissance. Le premier lait (colostrum), jaune et épais, est très précieux : donne-le au bébé." },
  { t: "La bonne position", b: "Ventre du bébé contre ton ventre, sa tête et son corps bien alignés. Sa bouche grande ouverte prend une grande partie de l'aréole, pas seulement le mamelon." },
  { t: "Éviter crevasses et engorgement", b: "Vérifie la bonne prise du sein, donne souvent le sein, varie les positions. Un peu de ton lait sur le mamelon après la tétée aide à cicatriser." },
  { t: "Allaitement mixte et biberon", b: "L'OMS recommande l'allaitement au sein uniquement pendant 6 mois. Si tu utilises un biberon, utilise de l'eau bouillie et refroidie, et lave bien le biberon à chaque fois." },
  { t: "Quand demander de l'aide ?", b: "Douleur forte, crevasses qui saignent, bébé qui ne prend pas le sein, peu de couches mouillées, bébé qui perd du poids : va voir une sage-femme." }
];

/* ---------- Bébé : situations ---------- */
const BABY = [
  { t: "Coliques", ok: "Pleurs longs souvent le soir, poings serrés, jambes repliées, chez un bébé qui tète bien et grossit. Cela passe souvent vers 3 à 4 mois.", tips: "Porte-le contre toi, berce-le, masse doucement son ventre.", go: "Pleurs inhabituels avec fièvre, vomissements ou refus de téter." },
  { t: "Reflux et régurgitations", ok: "Petites remontées de lait après les tétées, chez un bébé qui grossit bien.", tips: "Tiens-le droit après la tétée.", go: "Vomit tout, vomissements verts, ne prend pas de poids." },
  { t: "Constipation", ok: "Un bébé allaité peut rester plusieurs jours sans selles si elles sont molles.", tips: "Continue l'allaitement à la demande.", go: "Selles dures avec douleur, ventre gonflé, vomissements." },
  { t: "Diarrhée", ok: "Les selles d'un bébé allaité sont souvent molles et jaunes : c'est normal.", tips: "Continue l'allaitement plus souvent.", go: "Selles très liquides et fréquentes, sang dans les selles, signes de déshydratation." },
  { t: "Érythème fessier", ok: "Fesses rouges, fréquentes.", tips: "Change souvent la couche, lave à l'eau propre, laisse les fesses à l'air.", go: "Boutons avec pus, plaies, fièvre." },
  { t: "Jaunisse du nouveau-né", ok: "Une légère couleur jaune après le 2e jour est fréquente et disparaît en 1 à 2 semaines.", tips: "Allaite souvent.", go: "Jaunisse le premier jour, qui s'étend aux mains et aux pieds, ou bébé qui tète mal : urgence." },
  { t: "Fièvre et infections", ok: "Pas de fièvre attendue.", tips: "Ne couvre pas trop le bébé.", go: "Avant 3 mois, toute fièvre est une urgence. Après 3 mois, consulte le jour même." },
  { t: "Respiration", ok: "Le nouveau-né respire parfois de façon irrégulière, et éternue souvent.", tips: "Nettoie doucement son nez avec du sérum physiologique.", go: "Respire très vite, ventre qui se creuse, bruit en respirant, lèvres bleues : urgence." },
  { t: "Refus de s'alimenter", ok: "Un bébé peut téter moins une fois, puis plus la fois suivante.", tips: "Propose le sein souvent, au calme.", go: "Ne tète plus du tout, ou tète mal et semble mou : urgence." },
  { t: "Déshydratation", ok: "Couches bien mouillées, bouche humide.", tips: "Allaite plus souvent quand il fait chaud.", go: "Bouche sèche, pas de couche mouillée depuis 6 heures, fontanelle creuse : urgence." },
  { t: "Sommeil", ok: "Le nouveau-né dort beaucoup, environ 14 à 17 heures par jour, par petites périodes.", tips: "Couche-le sur le dos, sous une moustiquaire, sans coussin.", go: "Très difficile à réveiller, très mou : urgence." },
  { t: "Développement", ok: "Vers 6 semaines il sourit, vers 3 mois il tient sa tête, vers 6 mois il s'assoit avec aide.", tips: "Parle-lui, joue avec lui, regarde-le dans les yeux.", go: "Si tu t'inquiètes de son développement, parles-en au centre de santé." }
];

/* ---------- Apprendre : 12 thèmes ---------- */
const LEARN = [
  { id: "cycle", t: "Comprendre son cycle", arts: [
    { t: "Qu'est-ce que le cycle ?", b: "Le cycle commence le premier jour des règles et finit la veille des règles suivantes. Il dure le plus souvent entre 21 et 35 jours. Les règles durent 3 à 7 jours. Au début, chez les jeunes filles, les cycles sont souvent irréguliers : c'est normal.", k: "Note le premier jour de tes règles chaque mois.", h: "tu n'as pas de règles depuis 3 mois sans être enceinte, ou si tes règles durent plus de 7 jours." },
    { t: "Les douleurs de règles", b: "Des crampes au ventre ou au bas du dos sont fréquentes au début des règles. Une bouillotte chaude sur le ventre, le repos et la marche peuvent soulager.", k: "Des douleurs qui t'empêchent de marcher ou d'aller à l'école ne sont pas normales.", h: "la douleur est très forte, ou soudaine et d'un seul côté." },
    { t: "L'hygiène pendant les règles", b: "Change ta serviette au moins 3 fois par jour. Lave les serviettes lavables à l'eau et au savon et fais-les sécher au soleil. Lave-toi à l'eau propre, sans produit à l'intérieur du vagin.", k: "Les règles ne sont ni une maladie ni une honte.", h: "tu as des démangeaisons, des brûlures ou des pertes qui sentent mauvais." }
  ]},
  { id: "pertes", t: "Les pertes vaginales", arts: [
    { t: "Les pertes normales", b: "Des pertes blanches ou transparentes, sans odeur forte, sont normales. Elles nettoient le vagin. Elles changent au cours du cycle : plus abondantes et élastiques vers l'ovulation, plus épaisses ensuite.", k: "Des pertes sans odeur, sans démangeaisons et sans douleur sont normales.", h: "elles changent de couleur (jaunes, vertes, grises), sentent fort, ou donnent des démangeaisons." },
    { t: "Les pertes à surveiller", b: "Blanches en grumeaux avec démangeaisons : souvent une mycose. Grises avec odeur de poisson : souvent une infection. Jaunes ou vertes avec odeur forte : infection à traiter vite. Avec fièvre ou douleur au ventre : consulte le jour même.", k: "Ne mets aucun produit dans le vagin sans avis médical.", h: "tes pertes sont accompagnées de fièvre ou de douleur au bas-ventre." }
  ]},
  { id: "ovul", t: "Ovulation et fertilité", arts: [
    { t: "L'ovulation", b: "L'ovulation a lieu environ 14 jours avant les règles suivantes. Signes possibles : pertes transparentes et élastiques, petite douleur d'un côté du ventre. La période fertile dure environ 6 jours autour de l'ovulation.", k: "Le calendrier de l'application est une estimation : ce n'est pas une méthode de contraception fiable.", h: "tu veux espacer tes grossesses : la sage-femme peut te conseiller une méthode de planning familial." }
  ]},
  { id: "early", t: "Premiers signes de grossesse", ref: "early" },
  { id: "months", t: "Les 9 mois de grossesse", ref: "months" },
  { id: "compl", t: "Risques et complications", ref: "compl" },
  { id: "birth", t: "L'accouchement", arts: [
    { t: "Quand partir au centre de santé ?", b: "Pars quand les contractions sont régulières et rapprochées (toutes les 5 minutes environ), si tu perds les eaux, si tu saignes, ou si le bébé bouge moins. Prépare à l'avance ton sac, ton transport et la personne qui t'accompagne.", k: "Accoucher au centre de santé avec une sage-femme protège ta vie et celle de ton bébé.", h: "tu saignes, tu perds les eaux, ou tu as des maux de tête violents." },
    { t: "Les étapes de l'accouchement", b: "1. Le travail : les contractions ouvrent le col de l'utérus. 2. L'expulsion : le bébé naît. 3. La délivrance : le placenta sort. La sage-femme surveille ensuite tes saignements pendant au moins 24 heures.", k: "Mets le bébé peau à peau contre toi et donne le sein dans la première heure.", h: "après l'accouchement, tu saignes beaucoup ou tu as de la fièvre." }
  ]},
  { id: "post", t: "Après l'accouchement", ref: "mother" },
  { id: "bf", t: "Les bases de l'allaitement", ref: "bf" },
  { id: "newborn", t: "Les besoins du nouveau-né", arts: [
    { t: "Les premiers jours", b: "Garde le bébé au chaud, peau à peau. Allaite-le dès la première heure. Garde le cordon propre et sec, sans rien mettre dessus. Fais-le peser et vacciner au centre de santé.", k: "Le lait maternel suffit : pas d'eau ni d'autre aliment avant 6 mois.", h: "le bébé a de la fièvre, respire mal, ne tète pas ou devient jaune le premier jour." },
    { t: "Le sommeil sûr", b: "Couche le bébé sur le dos, sur une surface ferme, sous une moustiquaire imprégnée, sans coussin ni couverture sur le visage.", k: "Sur le dos pour dormir, toujours.", h: "le bébé est très difficile à réveiller." }
  ]},
  { id: "babysick", t: "Maladies fréquentes du nourrisson", ref: "baby" },
  { id: "urg", t: "Reconnaître les signes d'urgence", ref: "urg" }
];

/* ---------- Calendrier médical ---------- */
const ANC_WEEKS = [12, 20, 26, 30, 34, 36, 38, 40];
const PNC_DAYS = [{ d: 1, t: "Consultation post-natale (premières 24 heures)" }, { d: 3, t: "Consultation post-natale (3e jour)" }, { d: 10, t: "Consultation post-natale (entre 7 et 14 jours)" }, { d: 42, t: "Consultation post-natale (6 semaines)" }];
const VACC = [{ d: 0, t: "Vaccins de la naissance (dont BCG et polio)" }, { d: 42, t: "Vaccins de 6 semaines" }, { d: 70, t: "Vaccins de 10 semaines" }, { d: 98, t: "Vaccins de 14 semaines" }, { d: 274, t: "Vaccins de 9 mois (dont rougeole)" }];
const VACC_NOTE = "Calendrier indicatif : suis toujours le carnet de vaccination de ton bébé et le Programme élargi de vaccination du Tchad.";
