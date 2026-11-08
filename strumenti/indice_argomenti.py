"""Indice degli argomenti: per ogni classe e materia, un file breve con ciò che esiste già.

Scrive strumenti/argomenti/<classe>-<materia>.txt con titoli, id, concetti e il testo (accorciato)
di ogni domanda, più il numero dell'ultima bozza. Chi scrive nuove missioni legge questo file
invece delle missioni complete, per non ripetere argomenti o domande.

Uso:
    python strumenti/indice_argomenti.py                         # tutte le coppie
    python strumenti/indice_argomenti.py 4-elementare-storia     # solo alcune (separate da virgola)
"""
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from unisci_biblioteca import BOZZE, CLASSI, LIB, leggi, problemi, slug_classe, slug_materia  # noqa: E402

OUT = Path(__file__).resolve().parent / "argomenti"


def corto(testo, n=110):
    t = re.sub(r"\s+", " ", str(testo)).strip()
    return t if len(t) <= n else t[: n - 1] + "…"


def main():
    solo = set(sys.argv[1].split(",")) if len(sys.argv) > 1 else None
    gruppi = defaultdict(dict)
    nomi = {}
    ultimo = defaultdict(int)
    sorgenti = [p for p in sorted(LIB.glob("*/*.json")) if p.parent != BOZZE] + sorted(BOZZE.glob("*.json"))
    for path in sorgenti:
        if path.parent == BOZZE:
            m = re.fullmatch(r"(\d-(?:elementare|media))-([a-z-]+?)(?:-(\d+))?", path.stem)
            if m and m.group(3):
                key = f"{m.group(1)}-{m.group(2)}"
                ultimo[key] = max(ultimo[key], int(m.group(3)))
        for mis in leggi(path):
            if not isinstance(mis, dict) or problemi(mis):
                continue
            key = f"{slug_classe(mis['classe'])}-{slug_materia(mis['materia'])}"
            nomi[key] = (mis["classe"], mis["materia"])
            gruppi[key].setdefault(mis["id"], mis)

    OUT.mkdir(exist_ok=True)
    scritti = 0
    for key, missioni in sorted(gruppi.items()):
        if solo and key not in solo:
            continue
        classe, materia = nomi[key]
        righe = [f"# {classe} · {materia}: {len(missioni)} missioni valide",
                 f"# ultima bozza numerata: {ultimo[key]:02d} · aggiornato {datetime.now():%Y-%m-%d %H:%M}",
                 "# Per ogni missione: titolo [id], parola segreta, concetti, poi le domande (testo accorciato).", ""]
        for mis in sorted(missioni.values(), key=lambda x: x["titolo"].lower()):
            righe.append(f"## {mis['titolo']} [{mis['id']}] · {mis['parola']}")
            righe.append("concetti: " + "; ".join(c.get("nome", "") for c in mis["concetti"]))
            righe += [f"- {corto(q['testo'])}" for q in mis["domande"]]
            righe.append("")
        (OUT / f"{key}.txt").write_text("\n".join(righe), encoding="utf-8")
        scritti += 1
    print(f"Indice scritto per {scritti} coppie in {OUT}")


if __name__ == "__main__":
    main()
