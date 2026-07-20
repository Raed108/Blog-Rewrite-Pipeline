from services.scraper import BlogScraper
from services.database import MongoDatabase
from services.llm import LLMClient
from pipeline.pipeline import BlogPipeline
from pipeline.orchestrator import PipelineOrchestrator

database = MongoDatabase()
database.create_indexes()

scraper = BlogScraper()
llm = LLMClient()

pipeline = BlogPipeline(llm)

orchestrator = PipelineOrchestrator(
    scraper,
    pipeline,
    database
)