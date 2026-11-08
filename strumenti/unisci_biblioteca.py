"""Unisce e controlla la biblioteca delle missioni.

Struttura della biblioteca (servita da GitHub Pages e letta dall'app):
    missioni/indice.json                     classi -> materie -> numero di missioni
    missioni/<classe>/<materia>.json         {"classe", "materia", "missioni": [...]}

Fonti lette: i file già nella struttura, i vecchi file per classe (missioni/<classe>.json)
e le bozze (missioni/bozze/*.json). Le missioni non valide vengono scartate ed elencate,
i doppioni (stesso id) tenuti una volta sola.

Uso (senza --scrivi lo strumento controlla e riassume soltanto, non modifica nulla):
    python strumenti/unisci_biblioteca.py                  # controlla tutto e riassume
    python strumenti/unisci_biblioteca.py --scrivi         # unisce, riscrive i file pubblicati e l'indice
    python strumenti/unisci_biblioteca.py --scrivi --pulisci   # come sopra, poi cancella bozze e vecchi file
    python strumenti/unisci_biblioteca.py --senza-bozze    # ignora le bozze (es. non ancora riviste)
    python strumenti/unisci_biblioteca.py --solo 1-elementare-storia,1-elementare-inglese   # solo queste bozze
    python strumenti/unisci_biblioteca.py --file missioni/bozze/4-elementare-storia-1.json
"""
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "missioni"
BOZZE = LIB / "bozze"
CLASSI = ["1ª elementare", "2ª elementare", "3ª elementare", "4ª elementare", "5ª elementare",
          "1ª media", "2ª media", "3ª media"]
TIPI = {"scelta", "vero_falso", "completa", "ordina", "aperta"}
CHIAVI_MISSIONE = ["id", "classe", "titolo", "materia", "parola", "parola_spiegazione", "creata", "concetti", "domande"]
CHIAVI_DOMANDA = ["tipo", "concetto", "testo", "opzioni", "corretta", "indizio", "spiegazione", "risposta_modello"]


def slug_classe(classe):
    m = re.match(r"^(\d)ª\s+(elementare|media)$", classe)
    return f"{m.group(1)}-{m.group(2)}" if m else None


def slug_materia(materia):
    s = unicodedata.normalize("NFD", str(materia)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-") or "altro"


def normale(testo):
    s = unicodedata.normalize("NFD", str(testo)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def problemi(m):
    """Restituisce l'elenco dei problemi di una missione (vuoto se è valida)."""
    p = []
    for k in CHIAVI_MISSIONE:
        if k not in m:
            p.append(f"manca '{k}'")
    if p:
        return p
    if not re.fullmatch(r"[a-z0-9-]{3,80}", str(m["id"])):
        p.append("id non valido")
    if m["classe"] not in CLASSI:
        p.append(f"classe sconosciuta: {m['classe']}")
    if not str(m["titolo"]).strip() or not str(m["materia"]).strip():
        p.append("titolo o materia vuoti")
    if not re.fullmatch(r"[A-Z]{4,7}", str(m["parola"])):
        p.append(f"parola non valida: {m['parola']}")
    if not str(m["parola_spiegazione"]).strip():
        p.append("parola_spiegazione vuota")
    concetti = m["concetti"] if isinstance(m["concetti"], list) else []
    ids = {c.get("id") for c in concetti if isinstance(c, dict) and str(c.get("nome", "")).strip()}
    if not 3 <= len(ids) <= 6:
        p.append(f"{len(ids)} concetti (servono 3-6)")
    domande = m["domande"] if isinstance(m["domande"], list) else []
    if len(domande) != 8:
        p.append(f"{len(domande)} domande (servono 8)")
    usati = set()
    for i, q in enumerate(domande, 1):
        if not isinstance(q, dict) or any(k not in q for k in CHIAVI_DOMANDA):
            p.append(f"domanda {i}: campi mancanti")
            continue
        t, opz, c = q["tipo"], q["opzioni"], q["corretta"]
        usati.add(q["concetto"])
        if t not in TIPI:
            p.append(f"domanda {i}: tipo '{t}'")
            continue
        if not str(q["testo"]).strip() or not str(q["spiegazione"]).strip() or not str(q["indizio"]).strip():
            p.append(f"domanda {i}: testo, indizio o spiegazione vuoti")
        if re.match(r"^\s*(esatto|sbagliato)", str(q["spiegazione"]), re.I):
            p.append(f"domanda {i}: la spiegazione inizia con Esatto/Sbagliato")
        if q["concetto"] not in ids:
            p.append(f"domanda {i}: concetto '{q['concetto']}' inesistente")
        if not isinstance(opz, list) or not isinstance(c, int) or isinstance(c, bool):
            p.append(f"domanda {i}: opzioni o corretta del tipo sbagliato")
            continue
        if any(not isinstance(o, str) or not o.strip() for o in opz):
            p.append(f"domanda {i}: opzione vuota")
        if t == "scelta" and (len(opz) != 4 or not 0 <= c < 4):
            p.append(f"domanda {i}: scelta con {len(opz)} opzioni / corretta {c}")
        if t == "vero_falso" and (opz != ["Vero", "Falso"] or c not in (0, 1)):
            p.append(f"domanda {i}: vero_falso non valido")
        if t == "completa" and ("___" not in q["testo"] or not 3 <= len(opz) <= 4 or not 0 <= c < len(opz)):
            p.append(f"domanda {i}: completa non valida")
        if t == "ordina" and (not 3 <= len(opz) <= 6 or c != -1):
            p.append(f"domanda {i}: ordina non valida")
        if t == "aperta" and (opz or c != -1 or not str(q["risposta_modello"]).strip()):
            p.append(f"domanda {i}: aperta non valida")
        if t != "aperta" and str(q["risposta_modello"]).strip():
            p.append(f"domanda {i}: risposta_modello deve essere vuota")
        # Keep signs and symbols: in maths "-3" and "3" are different answers.
        if len({re.sub(r"\s+", " ", str(o).strip().lower()) for o in opz}) != len(opz):
            p.append(f"domanda {i}: opzioni ripetute")
    if ids - usati:
        p.append(f"concetti mai usati: {', '.join(sorted(ids - usati))}")
    if domande and isinstance(domande[-1], dict) and domande[-1].get("tipo") != "aperta":
        p.append("l'ultima domanda non è 'aperta'")
    if sum(1 for q in domande if isinstance(q, dict) and q.get("tipo") == "aperta") > 1:
        p.append("più di una domanda 'aperta'")
    return p


def leggi(path):
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001 - report any unreadable file
        print(f"!! {path.relative_to(ROOT)}: JSON non leggibile ({e})")
        return []
    return data.get("missioni", []) if isinstance(data, dict) else []


def controlla_file(path):
    """Controlla un solo file (per chi scrive le bozze) e stampa i problemi trovati."""
    missioni = leggi(path)
    viste, titoli, errori_tot = set(), set(), 0
    for m in missioni:
        mid = m.get("id", "?") if isinstance(m, dict) else "?"
        errori = problemi(m) if isinstance(m, dict) else ["non è un oggetto"]
        if mid in viste:
            errori.append("id ripetuto")
        t = normale(m.get("titolo", "")) if isinstance(m, dict) else ""
        if t and t in titoli:
            errori.append("titolo ripetuto")
        viste.add(mid)
        titoli.add(t)
        if errori:
            errori_tot += 1
            print(f"PROBLEMA {mid}: " + "; ".join(errori))
    print(f"{path.name}: {len(missioni)} missioni, {errori_tot} con problemi")
    return 1 if errori_tot or not missioni else 0


def main():
    if "--file" in sys.argv:
        return controlla_file(Path(sys.argv[sys.argv.index("--file") + 1]).resolve())
    pulisci = "--pulisci" in sys.argv
    # Writing the published files is opt-in: a plain run (for example by a helper agent) only checks.
    solo_controllo = "--scrivi" not in sys.argv or "--solo-controllo" in sys.argv

    vecchi = [LIB / f"{slug_classe(c)}.json" for c in CLASSI]
    sorgenti = sorted(LIB.glob("*/*.json"))
    sorgenti = [p for p in sorgenti if p.parent != BOZZE] + [p for p in vecchi if p.exists()]
    if "--senza-bozze" not in sys.argv:
        bozze = sorted(BOZZE.glob("*.json"))
        if "--solo" in sys.argv:
            # only drafts of these class-subject pairs, e.g. --solo 1-elementare-storia,1-elementare-inglese
            coppie = [c.strip() for c in sys.argv[sys.argv.index("--solo") + 1].split(",") if c.strip()]
            bozze = [p for p in bozze if any(re.fullmatch(re.escape(c) + r"(-\d+)?", p.stem) for c in coppie)]
        sorgenti += bozze

    gruppi = defaultdict(dict)           # (classe, materia) -> id -> missione
    nomi_materia = {}
    scartate, doppioni = [], []
    for path in sorgenti:
        for m in leggi(path):
            if not isinstance(m, dict):
                continue
            errori = problemi(m)
            if errori:
                scartate.append((path.relative_to(ROOT), m.get("id", "?"), errori))
                continue
            chiave = (m["classe"], slug_materia(m["materia"]))
            nomi_materia.setdefault(chiave[1], m["materia"].strip())
            if m["id"] in gruppi[chiave]:
                continue
            titolo = normale(m["titolo"])
            if any(normale(x["titolo"]) == titolo for x in gruppi[chiave].values()):
                doppioni.append((m["classe"], m["materia"], m["titolo"], m["id"]))
            gruppi[chiave][m["id"]] = m

    for path, mid, errori in scartate:
        print(f"SCARTATA {mid} ({path}): " + "; ".join(errori[:4]))
    for classe, materia, titolo, mid in doppioni:
        print(f"TITOLO DOPPIO in {classe} / {materia}: «{titolo}» ({mid})")

    indice = {"aggiornato": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "classi": {}}
    totale = 0
    for classe in CLASSI:
        sc = slug_classe(classe)
        materie = sorted((k[1] for k in gruppi if k[0] == classe), key=lambda s: nomi_materia[s])
        voce = {"classe": classe, "materie": []}
        righe = []
        for sm in materie:
            missioni = sorted(gruppi[(classe, sm)].values(), key=lambda m: normale(m["titolo"]))
            totale += len(missioni)
            voce["materie"].append({"slug": sm, "nome": nomi_materia[sm], "n": len(missioni)})
            righe.append(f"{nomi_materia[sm]} {len(missioni)}")
            if not solo_controllo:
                out = LIB / sc / f"{sm}.json"
                out.parent.mkdir(parents=True, exist_ok=True)
                doc = {"classe": classe, "materia": nomi_materia[sm], "missioni": missioni}
                out.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        indice["classi"][sc] = voce
        print(f"{classe}: {sum(len(gruppi[(classe, sm)]) for sm in materie)} missioni ({', '.join(righe)})")
    print(f"Totale: {totale} missioni valide, {len(scartate)} scartate, {len(doppioni)} titoli doppi")

    if not solo_controllo:
        import subprocess  # refresh the topic index used by mission writers
        subprocess.run([sys.executable, str(Path(__file__).with_name("indice_argomenti.py"))], check=False)
        (LIB / "indice.json").write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if pulisci:
            for path in list(BOZZE.glob("*.json")) + [p for p in vecchi if p.exists()]:
                path.unlink()
            if BOZZE.exists() and not any(BOZZE.iterdir()):
                BOZZE.rmdir()
            print("Bozze e vecchi file cancellati.")
    return 1 if scartate else 0


if __name__ == "__main__":
    sys.exit(main())
