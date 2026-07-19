import json

from openai import OpenAI

from config import settings

from models.blog import BlogPost
from models.article import SEOData

from services.interfaces import LLMInterface

from utils.prompts import load_prompt



class LLMClient(LLMInterface):

    def __init__(self):

        self.client = OpenAI(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_BASE_URL,
            timeout=60,
            max_retries=3
        )

        self.model = settings.LLM_MODEL

        self.rewrite_prompt = load_prompt("rewrite.system.txt")

        self.translate_prompt = load_prompt("translate.system.txt")

        self.seo_prompt = load_prompt("seo.system.txt")

    def _chat(self, system_prompt: str, user_prompt: str, task_hint="")-> str:

        content = user_prompt

        if task_hint:
            content = f"{task_hint}\n\n{user_prompt}"

        response = self.client.chat.completions.create(
            model=self.model,
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content},
            ]
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError("LLM returned an empty response.")

        return content

    def rewrite(self, post: BlogPost) -> str:

        return self._chat(
            self.rewrite_prompt,
            user_prompt = post.body
        )
    
    def translate(self, rewritten_text: str) -> str:

        return self._chat(
            self.translate_prompt,
            user_prompt=rewritten_text,
            task_hint="Translate to Arabic"
        )
    
    def generate_seo(self, rewritten_text: str) -> SEOData:
        response = self._chat(
            self.seo_prompt,
            user_prompt=rewritten_text,
            task_hint="SEO"
        )

        print("SEO RESPONSE:")
        print(response)
        response = response.strip()

        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "").strip()

        try:
            seo = json.loads(response)
        except json.JSONDecodeError as e:
            raise RuntimeError(
                f"Invalid SEO JSON returned by LLM:\n{response}"
            ) from e

        return SEOData(**seo)