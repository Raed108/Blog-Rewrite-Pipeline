from datetime import datetime
from pydantic import BaseModel, Field

class SEOData(BaseModel):
    seo_title: str
    slug: str
    meta_description: str
    tags: list[str]


class ProcessedArticle(BaseModel):
    title: str
    author: str
    published_date: str

    source_url: str

    original_body: str
    rewritten_body: str
    arabic_body: str

    seo: SEOData

    status: str = "completed"

    created_at: datetime = Field(default_factory=datetime.utcnow)