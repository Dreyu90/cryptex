export const meta = {
  name: 'biblioteca-50-per-materia',
  description: 'Per le classi indicate: porta ogni materia ad almeno 50 missioni, poi un revisore le controlla e corregge',
  phases: [
    { title: 'Scrittura', detail: 'completa ogni coppia classe/materia fino ad almeno 50 missioni' },
    { title: 'Revisione', detail: 'controllo dei fatti, delle risposte e dei doppioni, con correzioni' },
  ],
}

// args: { classi: ['1-elementare', ...] } chooses which classes this run covers (several runs can go in parallel).
const ROOT = 'C:\\Users\\andre\\Documents\\GitHub\\cryptex'
const TARGET = 50

const CLASSES = [
  { classe: '1ª elementare', slug: '1-elementare', age: '6-7 anni',
    note: 'Children are just learning to read: very short sentences (max ~12 words), very simple words, concrete examples. Italiano: letters, syllables, first words, double consonants, simple sentences, reading comprehension of tiny texts. Matematica: numbers to 20, comparing, addition/subtraction within 20, shapes, measures by comparison. Storia = concepts of time (prima/dopo, ieri/oggi/domani, giorni, mesi, la giornata, la storia personale). Geografia = space and orientation (sopra/sotto, davanti/dietro, destra/sinistra, ambienti della casa e della scuola, percorsi). Scienze: five senses, living/non-living, plants, animals, materials, seasons. Inglese: greetings, colours, numbers 1-10, school objects, toys, animals, family, body. The final "aperta" question must be answerable in one short sentence.' },
  { classe: '2ª elementare', slug: '2-elementare', age: '7-8 anni',
    note: 'Short simple sentences. Italiano: digrammi e trigrammi, accento, apostrofo, nomi/articoli, frasi, comprensione. Matematica: numbers to 100, place value, addition/subtraction with carrying, all times tables, simple problems, money, time, shapes. Storia: tempo, fonti, linea del tempo, storia personale e familiare, cicli temporali. Geografia: spazi vissuti, punti di riferimento, mappe semplici, paesaggi. Scienze: animals and plants, life cycles, materials, states of water. Inglese: classroom language, colours, numbers to 20, food, clothes, weather, house, animals, days.' },
  { classe: '3ª elementare', slug: '3-elementare', age: '8-9 anni',
    note: 'Italiano: grammar (nomi, articoli, aggettivi, verbi, ortografia), text types (narrativo, descrittivo, regolativo, poesia), comprehension. Matematica: numbers to 1000+, four operations, times tables, problems, fractions intro, measures, geometry (linee, angoli, poligoni). Storia: origin of the Universe and Earth, life on Earth, dinosaurs, fossils, Paleolithic/Neolithic (split into narrow topics), historian\'s sources, timeline. Geografia: paesaggi (montagna, collina, pianura, mare, fiumi, laghi), orientamento, carte. Scienze: metodo scientifico, materia e stati, acqua, aria, suolo, piante, animali, ecosistemi, catene alimentari. Inglese: family, house, body, food, animals, sports, time, routines, prepositions, can/have got.' },
  { classe: '4ª elementare', slug: '4-elementare', age: '9-10 anni',
    note: 'Italiano: parti del discorso, verbi (modi e tempi), analisi grammaticale, frase (soggetto/predicato), testi, poesia, comprensione. Matematica: numeri grandi, quattro operazioni, frazioni, decimali, misure, problemi, geometria (poligoni, perimetro, angoli). Storia: civiltà dei fiumi e del mare (Sumeri, Babilonesi, Assiri, Hittiti, Egizi, Indi, Cinesi, Ebrei, Fenici, Cretesi, Micenei). Geografia: clima e regioni climatiche, Italia fisica (Alpi, Appennini, pianure, fiumi, laghi, coste, isole), settori economici. Scienze: materia, calore, acqua, aria, suolo, regni dei viventi, piante, animali, ecosistemi. Inglese: daily routine, time, jobs, shops, clothes, present simple, present continuous, likes and dislikes.' },
  { classe: '5ª elementare', slug: '5-elementare', age: '10-11 anni',
    note: 'Italiano: analisi grammaticale e logica di base, verbi, pronomi, congiunzioni, testi (argomentativo, informativo), poesia, comprensione. Matematica: numeri grandi e decimali, frazioni, percentuali, potenze, problemi, aree e perimetri, solidi, statistica. Storia: Greci, Persiani, Alessandro Magno, popoli italici, Etruschi, Roma (monarchia, repubblica, impero, cristianesimo, caduta). Geografia: Italia politica, le 20 regioni, Costituzione e ordinamento dello Stato, Unione europea. Scienze: corpo umano (apparati), energia, luce, suono, sistema solare. Inglese: past simple of to be, comparatives, countries and nationalities, hobbies, directions, describing people.' },
  { classe: '1ª media', slug: '1-media', age: '11-12 anni',
    note: 'Italiano: fonologia, ortografia, parti del discorso, il testo narrativo, favola, fiaba, mito, epica (Iliade, Odissea, Eneide). Matematica: insiemi, numeri naturali, potenze, divisibilità, MCD e mcm, frazioni, geometria di base (enti, angoli, triangoli, poligoni). Storia: dalla crisi dell\'Impero romano ai Comuni (barbari, Bizantini, Longobardi, Islam, Carlo Magno, feudalesimo, Comuni, Crociate, Chiesa e Impero). Geografia: strumenti della geografia, Italia ed Europa fisica, climi, popolazione, città, settori economici. Scienze: metodo scientifico, materia, calore e temperatura, acqua, aria, suolo, cellula, classificazione dei viventi, piante, animali. Inglese: to be, have got, present simple, can, possessives, there is/are, daily routine, family, school.' },
  { classe: '2ª media', slug: '2-media', age: '12-13 anni',
    note: 'Italiano: analisi logica, testo descrittivo/espositivo/regolativo, letteratura (Dante, Petrarca, Boccaccio, Ariosto, Tasso, Goldoni, Parini), poesia. Matematica: numeri decimali e frazioni, radice quadrata, rapporti e proporzioni, percentuali, proporzionalità, aree dei poligoni, teorema di Pitagora intro only if standard for 2ª. Storia: Umanesimo e Rinascimento, esplorazioni, Riforma e Controriforma, Seicento, Rivoluzione scientifica, Illuminismo, Rivoluzione americana e francese, Napoleone, Rivoluzione industriale, Restaurazione. Geografia: Europa e i suoi Stati, regioni europee, Unione europea. Scienze: chimica di base, corpo umano (apparati), alimentazione, forze e moto. Inglese: past simple, past continuous, comparatives and superlatives, future (going to, will), countable/uncountable.' },
  { classe: '3ª media', slug: '3-media', age: '13-14 anni',
    note: 'Italiano: analisi del periodo, testo argomentativo, letteratura dell\'Ottocento e Novecento (Foscolo, Leopardi, Manzoni, Verga, Pascoli, D\'Annunzio, Ungaretti, Montale, Saba, Quasimodo, Primo Levi). Matematica: numeri relativi, calcolo letterale, equazioni di primo grado, piano cartesiano, funzioni, circonferenza e cerchio, solidi, probabilità e statistica. Storia: Risorgimento e Unità d\'Italia, Italia post-unitaria, seconda rivoluzione industriale, imperialismo, Grande guerra, totalitarismi, Seconda guerra mondiale, la Repubblica e la Costituzione, guerra fredda, decolonizzazione, Unione europea (war topics factual and age-appropriate: causes, phases, consequences, no graphic detail). Geografia: continenti extraeuropei, globalizzazione, sviluppo sostenibile, popolazione mondiale. Scienze: Terra (minerali, rocce, vulcani, terremoti, tettonica), universo, genetica ed ereditarietà, evoluzione, sistema nervoso, riproduzione (scientific, age-appropriate), elettricità e magnetismo. Inglese: present perfect, past simple vs present perfect, first conditional, modals, passive basics, relative pronouns.' },
]
const SUBJECTS = [
  { nome: 'Italiano', slug: 'italiano' }, { nome: 'Matematica', slug: 'matematica' }, { nome: 'Storia', slug: 'storia' },
  { nome: 'Geografia', slug: 'geografia' }, { nome: 'Scienze', slug: 'scienze' }, { nome: 'Inglese', slug: 'inglese' },
]

const SPEC = `MISSION FORMAT (UTF-8 JSON). A file is: { "classe": "<classe>", "materia": "<materia>", "missioni": [ MISSIONS ] } with 2-space indent.
MISSION (exactly these keys):
{ "id": "lib-<class slug>-<subject slug>-<short topic slug>"  (lowercase a-z0-9 and dashes, max 80 chars, UNIQUE among all missions of this class+subject),
  "classe": "<classe>", "titolo": "catchy, max 6 words, unique", "materia": "<materia>",
  "parola": "secret word, 4-7 letters, ONLY A-Z uppercase, no accents/spaces, linked to the topic",
  "parola_spiegazione": "one curious sentence linking the word to the topic",
  "creata": "2026-11-05T12:00:00.000Z",
  "concetti": [ {"id": "c1", "nome": "2-5 parole", "sintesi": "1-2 frasi chiare da scheda di ripasso"} ]  (3-5 concepts, every concept used by at least one question),
  "domande": [ exactly 8 QUESTIONS ] }
QUESTION (all keys always present): {"tipo", "concetto", "testo", "opzioni", "corretta", "indizio", "spiegazione", "risposta_modello"}
- "scelta": exactly 4 different options, one right; "corretta" = its index 0-3 (vary the index).
- "vero_falso": a statement; "opzioni": ["Vero","Falso"]; "corretta": 0 if true, 1 if false.
- "completa": sentence with "___" where the key word goes; 3-4 different words; "corretta" = index of the right one.
- "ordina": instruction in "testo"; "opzioni" = 3-6 items IN THE CORRECT ORDER (the game shuffles); "corretta": -1. Only for real sequences.
- "aperta": answer in own words (1-3 sentences); "risposta_modello" = expected key points; "opzioni": []; "corretta": -1.
Mix per mission: about 4 "scelta", 1-2 "vero_falso", 1 "completa", 1 "ordina" if there is a real sequence (else another "scelta"); the LAST question is the ONLY "aperta". "risposta_modello" is "" except for "aperta". Questions go from easiest to hardest and cover all concepts.
QUALITY: only well-established facts a school textbook states; every correct answer, date, calculation and spelling double-checked (compute maths with Python); exactly one right answer and distractors that are clearly wrong yet plausible (typical mistakes); no trick questions, no ambiguity, never "tutte/nessuna delle precedenti"; options of similar length. Smart questions, not only memory: perché, cosa succederebbe se, everyday examples, cause and effect, links between concepts; in Matematica concrete computations with new numbers. Warm, clear Italian for the age, use "tu". "indizio" helps reasoning without giving the answer. "spiegazione": 1-2 sentences explaining the right answer, never starting with "Esatto"/"Sbagliato". Inglese: questions in Italian about English, English words in options where natural. Write everything in your own words.
VALIDATOR: from ${ROOT} run   set PYTHONIOENCODING=utf-8 && python strumenti/unisci_biblioteca.py --file <path>   It must report 0 con problemi.`

const fill = (text, c, s) => text.replace(/<classe>/g, c.classe).replace(/<materia>/g, s.nome).replace(/<class slug>/g, c.slug).replace(/<subject slug>/g, s.slug)

function writerPrompt(c, s) {
  const pub = `${ROOT}\\missioni\\${c.slug}\\${s.slug}.json`
  const prefix = `${ROOT}\\missioni\\bozze\\${c.slug}-${s.slug}`
  return `You write quiz missions for an Italian children's study game ("Cryptex Studio"), repository ${ROOT}. All content in ITALIAN.
CLASS "${c.classe}" (${c.age}), SUBJECT "${s.nome}" (subject slug "${s.slug}", class slug "${c.slug}").
Curriculum notes for this class: ${c.note}

GOAL: this class+subject must reach AT LEAST ${TARGET} valid missions in total, all on different topics. Earlier runs may already have done part (or all) of the work.
1. Find every existing file for this class+subject: ${pub} (may not exist) and ALL files matching ${prefix}.json and ${prefix}-NN.json (two-digit NN). Run the validator on each draft file. If a draft file has problems, fix them in that file. Count the valid missions and note all ids, titles and topics. Do NOT modify ${pub}.
2. If there are already ${TARGET} or more valid missions with unique ids and titles: stop here and report the count. Otherwise plan the missing number of NEW missions, each on a different topic or clearly distinct subtopic not yet covered. With ${TARGET} missions you must go granular: split big topics into precise subtopics, use practical situations, and a few cross-topic "ripasso" missions; never repeat a question already used.
3. Write the new missions in batches of 10 into NEW files ${prefix}-NN.json, continuing the numbering after the highest existing NN (starting at 02 if none). Never overwrite an existing file of another batch, never touch files of other classes or subjects, never run git.
4. Validate each file right after writing it and fix until it reports 0 problems.
5. Finally confirm with Python that all valid missions for this class+subject are at least ${TARGET} and that ids and titles are unique across all of them.

${fill(SPEC, c, s)}

Reply with only: the files you wrote (or "nessun file nuovo"), the total for ${c.classe} / ${s.nome}, and the validator result.`
}

function reviewerPrompt(c, s) {
  const pub = `${ROOT}\\missioni\\${c.slug}\\${s.slug}.json`
  const glob = `${ROOT}\\missioni\\bozze\\${c.slug}-${s.slug}*.json`
  return `You are the strict final reviewer of quiz missions for Italian children (${c.classe}, ${c.age}), subject "${s.nome}", in the study game "Cryptex Studio" (repository ${ROOT}). The goal is perfect content: children will learn from it.

FILES TO REVIEW (only these; edit them in place, never touch other files, never run git):
- ${pub} (if it exists)
- every file matching ${glob}

For EVERY mission and EVERY question check, and fix whatever is wrong:
1. Facts: correct according to standard Italian school textbooks (dates, names, definitions, rules, geography, science). Rewrite anything doubtful or contestable into something certain.
2. The answer marked by "corretta" is really right, and it is the ONLY right one: no distractor that is also acceptable or arguable. "vero_falso" flags correct. "ordina" items really in the correct order and the order is unambiguous. "completa": the right word fits grammatically and the others do not fit as well.
3. Maths: recompute every number with Python.
4. Explanations ("spiegazione", "sintesi", "parola_spiegazione") consistent with the answers and correct; "indizio" helps without giving the answer away.
5. Clear, correct Italian (spelling, accents, apostrophes, agreement) at the level of ${c.age}; warm tone with "tu"; nothing inappropriate for children.
6. No duplicates: no two missions of this class+subject on the same topic in the same way, no repeated questions. If two missions overlap too much, rewrite one onto a different subtopic of the curriculum for ${c.classe}.
7. Structure stays valid (see the format below).
Edit the JSON with Python (json.load / json.dump with ensure_ascii=False, indent=2) so files stay valid; keep the same ids unless a duplicate forces a change. Do not delete missions: fix them. After your changes run the validator on every file you touched; each must report 0 problems.

${fill(SPEC, c, s)}

Reply with only: missions reviewed, number of questions changed, missions rewritten for overlap, a one-line list of the most important errors you fixed, and the validator result per file.`
}

const wanted = (args && args.classi) || CLASSES.map(c => c.slug)
const PAIRS = []
for (const c of CLASSES) if (wanted.includes(c.slug)) for (const s of SUBJECTS) PAIRS.push({ c, s })
log(`Classi: ${wanted.join(', ')} · ${PAIRS.length} coppie classe/materia`)

const results = await pipeline(
  PAIRS,
  p => agent(writerPrompt(p.c, p.s), { label: `scrive:${p.c.slug}/${p.s.slug}`, phase: 'Scrittura' }),
  (written, p) => agent(reviewerPrompt(p.c, p.s), { label: `rivede:${p.c.slug}/${p.s.slug}`, phase: 'Revisione' })
    .then(review => ({ coppia: `${p.c.classe} / ${p.s.nome}`, scrittura: written, revisione: review }))
)
return results
