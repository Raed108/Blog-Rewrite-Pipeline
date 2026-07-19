from abc import ABC, abstractmethod
from typing import List

from models.blog import BlogPost


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