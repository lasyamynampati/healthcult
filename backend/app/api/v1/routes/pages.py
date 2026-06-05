from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["pages"])

PROJECT_ROOT = Path(__file__).resolve().parents[5]
TEMPLATES_DIR = PROJECT_ROOT / "backend" / "app" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@router.get("/", response_class=HTMLResponse)
def dashboard_page(request: Request):
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "page_title": "HealthCult Dashboard",
        },
    )