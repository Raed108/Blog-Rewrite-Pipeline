from datetime import datetime
import uuid

from models.run import PipelineRun

from pipeline.pipeline import BlogPipeline

from services.database import MongoDatabase
from services.interfaces import (
    ScraperInterface,
)

from utils.logger import get_logger

logger = get_logger(__name__)


class PipelineOrchestrator:

    def __init__(
        self,
        scraper: ScraperInterface,
        pipeline: BlogPipeline,
        database: MongoDatabase,
    ):

        self.scraper = scraper
        self.database = database
        self.pipeline = pipeline

    def run(self) -> PipelineRun:

        run = PipelineRun(
            run_id=str(uuid.uuid4()),
            status="running",
        )

        self.database.save_run(run)

        logger.info("Pipeline started (%s)", run.run_id)

        try:

            posts = self.scraper.scrape_all()

            logger.info("Found %d blog posts.", len(posts))

            for index, post in enumerate(posts, start=1):

                logger.info(
                    "Processing (%d/%d): %s",
                    index,
                    len(posts),
                    post.title,
                )

                try:

                    article = self.pipeline.process(post)

                    # Avoid duplicate inserts
                    if self.database.article_exists(post.source_url):

                        logger.info(
                            "Skipped existing article: %s",
                            article.title,
                        )
                        continue

                    self.database.save_article(article)

                    run.processed += 1

                    logger.info(
                        "Saved article: %s",
                        article.title,
                    )

                except Exception as e:

                    logger.exception(
                        "Failed processing '%s'",
                        post.title,
                    )

                    run.failed += 1
                    run.errors.append(
                        f"{post.title}: {str(e)}"
                    )

            run.status = "completed"

        except Exception:

            logger.exception("Pipeline crashed.")

            run.status = "failed"

        finally:

            run.finished_at = datetime.utcnow()

            self.database.update_run(run)

            logger.info(
                "Pipeline finished. Processed=%d Failed=%d",
                run.processed,
                run.failed,
            )

        return run