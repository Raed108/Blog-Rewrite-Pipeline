from abc import ABC, abstractmethod
from typing import List

from models.blog import BlogPost
from models.article import SEOData


class ScraperInterface(ABC):

    @abstractmethod
    def discover_posts(self) -> List[str]:
        pass

    @abstractmethod
    def scrape_post(self, url: str) -> BlogPost:
        pass

    @abstractmethod
    def scrape_all(self) -> List[BlogPost]:
        pass


class LLMInterface(ABC):

    @abstractmethod
    def rewrite(self, post: BlogPost) -> str:
        pass

    @abstractmethod
    def translate(self, rewritten_text: str) -> str:
        pass

    @abstractmethod
    def generate_seo(self, rewritten_text: str) -> SEOData:
        pass