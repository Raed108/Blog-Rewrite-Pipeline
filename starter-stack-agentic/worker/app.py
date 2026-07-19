from fastapi import FastAPI
from services.scraper import BlogScraper
from services.llm import LLMClient

app = FastAPI(
    title="Blog Rewrite Worker",
    version="1.0.0"
)

scraper = BlogScraper()
llm = LLMClient()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/posts")
def get_posts():
    return scraper.scrape_all()

@app.get("/test-llm")
def test_llm():

    post = scraper.scrape_all()[0]
    rewritten = llm.rewrite(post)
    arabic = llm.translate(rewritten)
    seo = llm.generate_seo(rewritten)
    
    return {
        "rewritten": rewritten,
        "arabic": arabic,
        "seo": seo
    }