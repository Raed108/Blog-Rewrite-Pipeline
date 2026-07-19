from fastapi import FastAPI
from services.scraper import BlogScraper

app = FastAPI(
    title="Blog Rewrite Worker",
    version="1.0.0"
)

scraper = BlogScraper()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/posts")
def get_posts():
    return scraper.scrape_all()