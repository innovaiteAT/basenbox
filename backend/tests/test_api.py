import pytest
from fastapi.testclient import TestClient

from main import app
from tests.conftest import make_xlsx

ROWS = [{"Spezialwünsche": "OM; 2xAbend"}, {"Notizen": "bitte ohne Koriander"}, {"Spezialwünsche": "Kreatin"}]
XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@pytest.fixture
def client(data_dir):
    return TestClient(app)


def upload(client, name="08.06. Gesamt.xlsx", data=None):
    return client.post("/api/runs", files={"file": (name, data or make_xlsx(ROWS), XLSX)})


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_rejects_non_xlsx(client):
    assert upload(client, "liste.csv", b"a;b").status_code == 415
    assert upload(client, "08.06. Gesamt.xlsx", b"kein excel").status_code == 422


def test_full_flow(client, data_dir):
    res = upload(client)
    assert res.status_code == 200, res.text
    run = res.json()
    assert run["delivery"]["label"] == "08.06."
    assert run["boxes"] == 3
    review_id = next(r for r in run["results"] if r["review"])["review"][0]["id"]
    row_index = int(review_id.split(":")[0])

    patch = {
        "menu": {"nuts": ["M"], "zk": ["A"], "raisins": []},
        "overrides": {str(row_index): {"decisions": {review_id: {"action": "custom", "text": "Ohne Koriander"}}}},
        "checklist": {"avery.import": True},
    }
    run = client.patch(f"/api/runs/{run['id']}", json=patch).json()
    assert run["checklist"] == {"avery.import": True}
    assert not [w for w in run["warnings"] if w["code"] == "review"]
    assert run["totals"]["meals"]["M"]["total"] == 2

    run = client.post(f"/api/runs/{run['id']}/generate").json()
    assert len(run["files"]) == 6
    folder = data_dir / "output" / "KW24" / "08.06. Montag"
    assert (folder / "run.json").exists() and (folder / "08.06. Etikettenliste.xlsx").exists()
    assert client.get(f"/api/runs/{run['id']}/files/08.06. Spezialwünsche.pdf").status_code == 200
    assert client.get(f"/api/runs/{run['id']}/files/run.json").status_code == 404
    assert client.get(f"/api/runs/{run['id']}/files/..%2Frun.json").status_code == 404
    assert client.get(f"/api/runs/{run['id']}/zip").content[:2] == b"PK"
    assert [r["id"] for r in client.get("/api/runs").json()] == [run["id"]]
    assert (data_dir / "config" / "menu_defaults.json").exists()


def test_change_date_moves_folder(client, data_dir):
    run = upload(client).json()
    run = client.patch(f"/api/runs/{run['id']}", json={"delivery_date": "2026-06-09"}).json()
    assert run["delivery"]["weekday"] == "Dienstag"
    assert (data_dir / "output" / "KW24" / "09.06. Dienstag" / "run.json").exists()
    assert not (data_dir / "output" / "KW24" / "08.06. Montag").exists()
    assert client.get(f"/api/runs/{run['id']}").status_code == 200


def test_delete_run(client, data_dir):
    run = upload(client).json()
    assert client.delete(f"/api/runs/{run['id']}").status_code == 204
    assert not (data_dir / "output" / "KW24").exists()
    assert client.get(f"/api/runs/{run['id']}").status_code == 404
    assert client.get("/api/runs").json() == []
    assert client.delete(f"/api/runs/{run['id']}").status_code == 404


def test_rules_config(client):
    rules = client.get("/api/config/rules").json()
    assert {"nuts", "zk", "kreatin"} <= {r["id"] for r in rules}
    bad = rules + [{"id": "x", "label": "X", "kind": "ignore", "patterns": ["("]}]
    assert client.put("/api/config/rules", json=bad).status_code == 422
    hits = client.post("/api/config/rules/test", json={"text": "OM; 2xAbend"}).json()
    assert {m["rule_id"] for m in hits["matches"]} == {"no_m", "multi_a"}


def test_rules_import(client):
    from io import BytesIO

    from openpyxl import Workbook

    wb = Workbook()
    for w in ["Suchwort", "Knoblauch", "Koriander"]:
        wb.active.append([w])
    buf = BytesIO()
    wb.save(buf)
    res = client.post("/api/config/rules/import", files={"file": ("Suchwörter.xlsx", buf.getvalue(), XLSX)})
    ids = [r["id"] for r in res.json()]
    assert "koriander" in ids and ids.count("zk") == 1


def test_mail_templates(client):
    value = client.get("/api/config/mail-templates").json()
    assert {r["id"] for r in value["recipients"]} == {"gaumenfreundinnen", "goran"}
    assert client.put("/api/config/mail-templates", json={"x": 1}).status_code == 422
