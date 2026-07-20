import * as worker from "../services/worker.js";
import { text } from "../utils/response.js";

export async function listArticles() {
    
    try {
            const result = await worker.getArticles();
            return text(result);
        }
        catch (err) {
            throw new Error(err.response?.data?.detail || err.message);
        }
}