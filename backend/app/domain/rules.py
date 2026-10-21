import json
import re
from dataclasses import dataclass
from importlib import resources

from .models import Rule, RuleKind
from .text import fold

UNCLEAR = re.compile(r"\b(ohne|kein|keine|keinen|allergi\w*|unvertraeglich\w*|statt|extra)\b", re.IGNORECASE)


@dataclass(frozen=True)
class Hit:
    rule: Rule
    quantity: int
    pattern: str
    excerpt: str


@dataclass(frozen=True)
class CompiledRule:
    rule: Rule
    regexes: tuple[tuple[str, re.Pattern[str]], ...]
    qty_regexes: tuple[re.Pattern[str], ...]

    def search(self, folded: str) -> Hit | None:
        for source, rx in self.regexes:
            m = rx.search(folded)
            if m:
                return Hit(self.rule, self._quantity(folded, m), source, m.group(0))
        return None

    def _quantity(self, folded: str, m: re.Match[str]) -> int:
        if self.rule.kind == RuleKind.meal_multi and m.groups() and m.group(1) and m.group(1).isdigit():
            return int(m.group(1))
        if self.rule.kind == RuleKind.addon:
            for rx in self.qty_regexes:
                q = rx.search(folded)
                if q:
                    return int(q.group(1))
        return 1


def compile_rule(rule: Rule) -> CompiledRule:
    regexes: list[tuple[str, re.Pattern[str]]] = []
    for p in rule.patterns:
        regexes.append((p, re.compile(fold(p), re.IGNORECASE)))
    for code in rule.case_sensitive:
        regexes.append((code, re.compile(rf"(?<![A-Za-z0-9]){re.escape(fold(code))}(?![A-Za-z])")))
    qty: list[re.Pattern[str]] = []
    if rule.kind == RuleKind.addon:
        body = "|".join(f"(?:{fold(p)})" for p in rule.patterns)
        qty.append(re.compile(rf"(\d+)\s*x\s*(?:{body})", re.IGNORECASE))
        qty.append(re.compile(rf"(?:{body})\w*\s*(\d+)\s*x\b", re.IGNORECASE))
    return CompiledRule(rule, tuple(regexes), tuple(qty))


class Catalog:
    def __init__(self, rules: list[Rule]):
        self.rules = rules
        self.by_id = {r.id: r for r in rules}
        self.compiled = [compile_rule(r) for r in rules]

    def hits(self, segment: str) -> list[Hit]:
        folded = fold(segment)
        return [h for c in self.compiled if (h := c.search(folded))]

    def ingredients(self) -> list[Rule]:
        return [r for r in self.rules if r.kind == RuleKind.ingredient]

    def addons(self) -> list[Rule]:
        return [r for r in self.rules if r.kind == RuleKind.addon]


def is_unclear(segment: str) -> bool:
    return bool(UNCLEAR.search(fold(segment)))


def default_rules() -> list[Rule]:
    raw = resources.files("app.defaults").joinpath("rules.json").read_text(encoding="utf-8")
    return [Rule.model_validate(r) for r in json.loads(raw)]


def rules_from_keywords(keywords: list[str], existing: list[Rule]) -> list[Rule]:
    """Suchwörter-Import: bekannte Wörter treffen schon eine Regel, unbekannte werden neue Zutatenregeln."""
    catalog = Catalog(existing)
    result = list(existing)
    for word in keywords:
        word = word.strip()
        if not word or catalog.hits(word):
            continue
        rid = re.sub(r"[^a-z0-9]+", "_", fold(word).lower()).strip("_") or "regel"
        while any(r.id == rid for r in result):
            rid += "_2"
        result.append(Rule(id=rid, label=word, kind=RuleKind.ingredient, patterns=[re.escape(word.lower())], cell=word))
        catalog = Catalog(result)
    return result
