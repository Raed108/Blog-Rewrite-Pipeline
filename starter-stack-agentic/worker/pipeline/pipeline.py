class BlogPipeline:

    def __init__(
        self,
        scraper,
        llm,
        database
    ):

        self.scraper = scraper
        self.llm = llm
        self.database = database