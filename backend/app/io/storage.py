import json
import os
import re
import shutil
import zipfile
from importlib import resources
from io import BytesIO
from pathlib import Path

from app.domain.models import Delivery, Rule, Run

UPLOAD_NAME = "_upload.xlsx"
RUN_NAME = "run.json"


def data_dir() -> Path:
    # Lokal liegt data/ neben backend/, im Container setzt Compose DATA_DIR=/app/data
    return Path(os.environ.get("DATA_DIR") or Path(__file__).resolve().parents[3] / "data")


def output_dir() -> Path:
    return data_dir() / "output"


def config_dir() -> Path:
    return data_dir() / "config"


def template_path() -> Path:
    return data_dir() / "input" / "templates" / "Spezialwünsche_Template.xlsx"


def safe_name(name: str) -> str:
    base = Path(name.replace("\\", "/")).name
    return re.sub(r"[^\w .,()&+-]", "_", base).strip(" .") or "upload.xlsx"


# --- Konfiguration ---------------------------------------------------------

def _default_text(name: str) -> str:
    return resources.files("app.defaults").joinpath(name).read_text(encoding="utf-8")


def _read_config(name: str, default: str | None):
    path = config_dir() / name
    if not path.exists():
        if default is None:
            return None
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(default, encoding="utf-8")
    return json.loads(path.read_text(encoding="utf-8"))


def _write_config(name: str, value) -> None:
    path = config_dir() / name
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def load_rules() -> list[Rule]:
    return [Rule.model_validate(r) for r in _read_config("rules.json", _default_text("rules.json"))]


def save_rules(rules: list[Rule]) -> None:
    _write_config("rules.json", [r.model_dump(mode="json", exclude_none=True) for r in rules])


def load_mail_templates() -> dict:
    return _read_config("mail_templates.json", _default_text("mail_templates.json"))


def save_mail_templates(value: dict) -> None:
    _write_config("mail_templates.json", value)


def load_menu_defaults() -> dict:
    return _read_config("menu_defaults.json", "{}")


def save_menu_default(weekday: str, menu: dict) -> None:
    current = load_menu_defaults()
    current[weekday] = menu
    _write_config("menu_defaults.json", current)


# --- Läufe -------------------------------------------------------------------

def day_folder(delivery: Delivery) -> Path:
    return output_dir() / f"KW{delivery.iso_week:02d}" / f"{delivery.label} {delivery.weekday}"


def save_run(run: Run, upload: bytes | None = None) -> Run:
    folder = day_folder(run.delivery)
    if run.folder and Path(run.folder) != folder and Path(run.folder).exists():
        folder.parent.mkdir(parents=True, exist_ok=True)
        if folder.exists():
            shutil.rmtree(folder)
        shutil.move(run.folder, folder)
        old_label = Path(run.folder).name.split(" ")[0]
        for f in folder.iterdir():
            if f.name.startswith(old_label + " "):
                f.unlink()  # alte Ausgabedateien passen nicht mehr zum Datum
        run = run.model_copy(update={"files": []})
    folder.mkdir(parents=True, exist_ok=True)
    run = run.model_copy(update={"folder": str(folder)})
    if upload is not None:
        (folder / UPLOAD_NAME).write_bytes(upload)
    tmp = folder / (RUN_NAME + ".tmp")
    tmp.write_text(run.model_dump_json(indent=1), encoding="utf-8")
    tmp.replace(folder / RUN_NAME)
    return run


def _run_files() -> list[Path]:
    return sorted(output_dir().glob(f"KW*/*/{RUN_NAME}"))


def list_runs() -> list[Run]:
    runs = [Run.model_validate_json(p.read_text(encoding="utf-8")) for p in _run_files()]
    return sorted(runs, key=lambda r: (r.delivery.date, r.id), reverse=True)


def load_run(run_id: str) -> Run | None:
    for p in _run_files():
        run = Run.model_validate_json(p.read_text(encoding="utf-8"))
        if run.id == run_id:
            return run.model_copy(update={"folder": str(p.parent)})
    return None


def delete_run(run: Run) -> None:
    folder = Path(run.folder).resolve()
    if not folder.is_relative_to(output_dir().resolve()):
        raise ValueError(f"Ordner liegt außerhalb von output/: {folder}")
    shutil.rmtree(folder)
    if not any(folder.parent.iterdir()):
        folder.parent.rmdir()  # leeren KW-Ordner mit aufräumen


def read_upload(run: Run) -> bytes:
    return (Path(run.folder) / UPLOAD_NAME).read_bytes()


def file_path(run: Run, name: str) -> Path | None:
    if name not in run.files:
        return None
    path = Path(run.folder) / name
    return path if path.is_file() else None


def build_zip(run: Run) -> bytes:
    buf = BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in run.files:
            path = Path(run.folder) / name
            if path.is_file():
                zf.write(path, arcname=name)
    return buf.getvalue()
