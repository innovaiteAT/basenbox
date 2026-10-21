import logging
from datetime import date
from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

from app.domain.derived import make_delivery
from app.domain.models import Delivery, Meal, RowOverride, Run
from app.domain.rules import Catalog
from app.io import storage
from app.io.excel_reader import InputError
from app.service import create_run, default_menu, generate_files, recompute

router = APIRouter(prefix="/api/runs", tags=["runs"])
log = logging.getLogger("basenbox.runs")

MAX_UPLOAD = 10 * 1024 * 1024


class RunSummary(BaseModel):
    id: str
    source_name: str
    delivery: Delivery
    boxes: int
    open_reviews: int
    files: list[str]


class RunPatch(BaseModel):
    delivery_date: date | None = None
    menu: dict[str, list[Meal]] | None = None
    overrides: dict[int, RowOverride] | None = None  # ersetzt die Overrides der genannten Zeilen
    checklist: dict[str, bool] | None = None  # wird gemischt


def _catalog() -> Catalog:
    return Catalog(storage.load_rules())


def _get(run_id: str) -> Run:
    run = storage.load_run(run_id)
    if run is None:
        raise HTTPException(404, "Lauf nicht gefunden.")
    return run


@router.post("", response_model=Run)
async def upload(file: UploadFile = File(...), delivery_date: date | None = Form(None)) -> Run:
    name = storage.safe_name(file.filename or "")
    if not name.lower().endswith(".xlsx"):
        raise HTTPException(415, "Bitte eine Excel-Datei (.xlsx) hochladen.")
    data = await file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Die Datei ist größer als 10 MB.")
    try:
        run = create_run(data, name, date.today(), delivery_date)
    except InputError as exc:
        raise HTTPException(422, str(exc)) from exc
    catalog = _catalog()
    saved = storage.load_menu_defaults().get(run.delivery.weekday)
    run = run.model_copy(update={"menu": default_menu(catalog, saved)})
    run = storage.save_run(recompute(run, catalog, storage.load_mail_templates()), data)
    log.info("Lauf %s angelegt: %d Zeilen, %d relevant", run.id, run.boxes, len(run.totals.relevant_rows))
    return run


@router.get("", response_model=list[RunSummary])
def list_runs() -> list[RunSummary]:
    return [
        RunSummary(
            id=r.id, source_name=r.source_name, delivery=r.delivery, boxes=r.boxes,
            open_reviews=sum(len(x.review) for x in r.results), files=r.files,
        )
        for r in storage.list_runs()
    ]


@router.get("/{run_id}", response_model=Run)
def get_run(run_id: str) -> Run:
    return _get(run_id)


@router.patch("/{run_id}", response_model=Run)
def patch_run(run_id: str, patch: RunPatch) -> Run:
    run = _get(run_id)
    update: dict = {}
    if patch.delivery_date and patch.delivery_date != run.delivery.date:
        update["delivery"] = make_delivery(patch.delivery_date)
    if patch.menu is not None:
        update["menu"] = patch.menu
    if patch.overrides is not None:
        update["overrides"] = {**run.overrides, **patch.overrides}
    if patch.checklist is not None:
        update["checklist"] = {**run.checklist, **patch.checklist}
    run = run.model_copy(update=update)
    run = storage.save_run(recompute(run, _catalog(), storage.load_mail_templates()))
    log.info("Lauf %s aktualisiert", run.id)
    return run


@router.post("/{run_id}/generate", response_model=Run)
def generate(run_id: str) -> Run:
    run = _get(run_id)
    catalog = _catalog()
    run = recompute(run, catalog, storage.load_mail_templates())
    files = generate_files(run, catalog, storage.read_upload(run), Path(run.folder), storage.template_path())
    storage.save_menu_default(run.delivery.weekday, {k: [m.value for m in v] for k, v in run.menu.items()})
    run = storage.save_run(run.model_copy(update={"files": files}))
    log.info("Lauf %s: %d Dateien erzeugt", run.id, len(files))
    return run


@router.get("/{run_id}/files/{name}")
def download(run_id: str, name: str) -> FileResponse:
    run = _get(run_id)
    path = storage.file_path(run, name)
    if path is None:
        raise HTTPException(404, "Datei nicht gefunden.")
    return FileResponse(path, filename=name)


@router.get("/{run_id}/zip")
def download_zip(run_id: str) -> Response:
    run = _get(run_id)
    if not run.files:
        raise HTTPException(409, "Noch keine Dateien erzeugt.")
    name = f"{run.delivery.label} {run.delivery.weekday}.zip"
    return Response(
        storage.build_zip(run), media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(name)}"},
    )
