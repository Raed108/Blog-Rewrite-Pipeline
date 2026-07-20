from http.client import HTTPException

from fastapi import FastAPI
from models.article import ProcessedArticle
from models.run import PipelineRun
from dependencies import database, orchestrator

app = FastAPI(
    title="Blog Rewrite Worker",
    version="1.0.0"
)

@app.get("/health")
def health():

    return {
        "status": "ok",
        "database": "connected",
        "version": "1.0.0"
    }


@app.post("/run")
def run_pipeline():
    return orchestrator.run()


@app.get("/articles", response_model=list[ProcessedArticle])
def get_articles():
    return database.get_articles()


@app.get("/runs", response_model=list[PipelineRun])
def get_runs():
    return database.get_runs()


@app.get("/articles/{slug}")
def get_article(slug: str):

    article = database.get_article_by_slug(slug)

    if article is None:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    return article