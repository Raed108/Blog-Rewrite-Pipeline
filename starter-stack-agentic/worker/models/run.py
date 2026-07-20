from datetime import datetime
from pydantic import BaseModel, Field


class PipelineRun(BaseModel):

    run_id: str

    status: str

    processed: int = 0

    failed: int = 0

    started_at: datetime = Field(default_factory=datetime.utcnow)

    finished_at: datetime | None = None

    errors: list[str] = Field(default_factory=list)