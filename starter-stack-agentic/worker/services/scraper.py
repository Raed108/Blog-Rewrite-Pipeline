from curses import meta
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from config import settings
from models.blog import BlogPost
from services.interfaces import ScraperInterface

class BlogScraper(ScraperInterface):
    def __init__(self):
        self.base_url = settings.SEED_BLOG_URL

    def discover_posts(self):

        response = requests.get(self.base_url)

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html5lib")

        links = []

        for link in soup.select("main a"):

            href = link.get("href")

            if href:
                links.append(urljoin(self.base_url, href))

        return links


    def scrape_post(self, url: str):

        response = requests.get(url)

        response.raise_for_status()

        def get_meta(soup, name, default=None):
            tag = soup.find("meta", attrs={"name": name})
            if tag:
                return tag.get("content", default)
            return default

        soup = BeautifulSoup(response.text, "html5lib")

        title = ""

        h1 = soup.find("h1")

        if h1:
            title = h1.get_text(" ", strip=True)
        else:
            title = get_meta(soup, "title")

        if not title:
            title_tag = soup.find("title")

            if title_tag:
                title = title_tag.get_text().split("|")[0].strip()

        author = get_meta(soup, "author", "Unknown")
        published_date = get_meta(soup, "date", "Unknown")
        description = get_meta(soup, "description", "No description available")

        paragraphs = []

        article = soup.find("article")

        if article:
            ps = article.find_all("p")
        else:
            ps = soup.find_all("p")

        for p in ps:

            classes = p.get("class", [])

            if "byline" in classes:
                continue

            paragraphs.append(
                p.get_text(" ", strip=True)
            )

        if not paragraphs:
            paragraphs = [
                p.get_text(" ", strip=True)
                for p in soup.find_all("p")
            ]

        body = "\n\n".join(paragraphs)

        return BlogPost(
            title=title,
            author=author,
            published_date=published_date,
            description=description,
            body=body,
            source_url=url,
        )

    def scrape_all(self):

        articles = []

        for url in self.discover_posts():

            articles.append(
                self.scrape_post(url)
            )

        return articles