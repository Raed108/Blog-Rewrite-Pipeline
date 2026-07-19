from pydantic import BaseModel

class BlogPost(BaseModel):
    title: str
    author: str
    published_date: str
    description: str
    body: str
    source_url: str