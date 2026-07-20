from httpx import post

from models.article import ProcessedArticle
from models.blog import BlogPost

from services.interfaces import LLMInterface
import re

class BlogPipeline:

    def __init__(self, llm: LLMInterface):
        self.llm = llm


    def process(self, post: BlogPost) -> ProcessedArticle:
        """
        Process a single blog article.

        Steps:
        1. Rewrite in English
        2. Translate to Arabic
        3. Generate SEO metadata
        4. Build ProcessedArticle
        """

        rewritten = self.llm.rewrite(post)

        arabic = self.llm.translate(rewritten)

        seo = self.llm.generate_seo(rewritten)

        seo.slug = slugify(post.title)

        return ProcessedArticle(
            title=post.title,
            author=post.author,
            published_date=post.published_date,
            source_url=post.source_url,
            original_body=post.body,
            rewritten_body=rewritten,
            arabic_body=arabic,
            seo=seo,
            status="completed",
        )
    
def slugify(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug