from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from config import settings

from models.article import ProcessedArticle
from models.run import PipelineRun


class MongoDatabase:

    def __init__(self):

        self.client = MongoClient(settings.MONGO_URL)

        db = self.client.get_database()

        self.articles = db["articles"]

        self.runs = db["runs"]

        self.create_indexes()
    
    def save_article(self, article: ProcessedArticle):

        try:
            self.articles.insert_one(
                article.model_dump(mode="json")
            )
        except DuplicateKeyError:
            pass

    def get_articles(self):

        return list(
            self.articles.find({}, {"_id":0})
            .sort("created_at", -1)
        )
    
    def save_run(self, run: PipelineRun):

        self.runs.insert_one(
            run.model_dump(mode="json")
        )

    def update_run(self, run: PipelineRun):

        self.runs.update_one(
            {"run_id": run.run_id},
            {"$set": run.model_dump(mode="json")}
        )

    def get_runs(self):

        return list(
            self.runs.find({}, {"_id":0})
            .sort("started_at",-1)
        )
    
    def get_article_by_slug(self, slug: str):

        return self.articles.find_one(
            {"seo.slug": slug},
            {"_id": 0}
        )
    
    def create_indexes(self):

        self.articles.create_index(
            "source_url",
            unique=True
        )

        self.runs.create_index(
            "run_id",
            unique=True
        )

        self.articles.create_index(
            "created_at"
        )

    def article_exists(self, source_url: str) -> bool:
        return self.articles.find_one(
            {"source_url": source_url},
            {"_id": 1}
        ) is not None