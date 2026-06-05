from celery import Celery

from app.core.config import settings

celery = Celery("healthcult")
celery.conf.update(
    broker_url=settings.celery_broker_url,
    result_backend=settings.celery_result_backend,
    task_routes={
        "app.tasks.jobs.run_ocr_task": {"queue": "ocr_queue"},
        "app.tasks.jobs.run_prediction_batch": {"queue": "ml_queue"},
        "app.tasks.jobs.build_analytics_snapshots": {"queue": "analytics_queue"},
        "app.tasks.jobs.retention_cleanup": {"queue": "compliance_queue"},
    },
    beat_schedule={
        "nightly-analytics": {
            "task": "app.tasks.jobs.build_analytics_snapshots",
            "schedule": 86400.0,
        }
    },
)
