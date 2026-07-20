import axios from "axios";

const api = axios.create({
    baseURL: process.env.WORKER_URL || "http://worker:8000",
    timeout: 30000,
});

export async function health() {
    const { data } = await api.get("/health");
    return data;
}

export async function runPipeline() {
    const { data } = await api.post("/run");
    return data;
}

export async function getArticles() {
    const { data } = await api.get("/articles");
    return data;
}

export async function getArticle(slug) {
    const { data } = await api.get(`/articles/${slug}`);
    return data;
}

export async function getRuns() {
    const { data } = await api.get("/runs");
    return data;
}