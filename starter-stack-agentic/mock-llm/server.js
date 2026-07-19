// Bundled language model — OpenAI-compatible, deterministic, offline.
//
// WHY THIS EXISTS: so `docker compose up` works with no credentials and the
// stack produces the SAME output every time. It is plumbing, not part of what
// you build — treat it as the language model behind LLM_BASE_URL. At grading
// time an env file may point LLM_BASE_URL at a real endpoint instead; write
// your pipeline against the OpenAI chat-completions shape and it works with
// either.
//
// It implements POST /v1/chat/completions and GET /v1/models. Output is a pure
// function of the request (keyed by a hash of the messages), so retries and
// re-runs are reproducible. It infers what you're asking for — an English
// rewrite, an Arabic translation, or SEO metadata — from the prompt, and it
// keeps real-world details (numbers, links, and any existing Arabic text)
// intact so the canned output stays realistic.

import express from 'express';
import { createHash } from 'node:crypto';

const app = express();
app.use(express.json({ limit: '4mb' }));

const PORT = process.env.PORT || 8080;

const hash = (s) => createHash('sha256').update(s).digest('hex');

// ── Extraction helpers — carry real-world tokens through verbatim ──────────
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const arabicSpans = (t) => t.match(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿][^\n<]*/g) || [];
const urls = (t) => t.match(/https?:\/\/[^\s"'<>)]+/g) || [];
const emails = (t) => t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
// Phone-shaped runs (keeps the +20 100 123 4567 style intact).
const phones = (t) => t.match(/\+?\d[\d\s()-]{6,}\d/g) || [];
// Numbers with separators (prices etc.).
const numbers = (t) => t.match(/\d[\d,._]*\d|\d/g) || [];
// Capitalised multi/single-word proper-noun-shaped tokens (brands, compounds).
const properNouns = (t) => t.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}\b/g) || [];

const uniq = (arr) => [...new Set(arr)];

function entitiesOf(text) {
  return uniq([
    ...urls(text),
    ...emails(text),
    ...phones(text),
    ...numbers(text),
    ...properNouns(text),
    ...arabicSpans(text),
  ]).filter(Boolean);
}

// Re-append any real-world tokens that didn't already come through, so the
// deterministic output stays realistic for a rewrite/translation step.
function carryThrough(source, out) {
  const missing = entitiesOf(source).filter((e) => !out.includes(e));
  if (missing.length === 0) return out;
  return `${out}\n\n${missing.join(' ')}`;
}

// ── Deterministic content generators ───────────────────────────────────────
function rewriteEn(source, seed) {
  const opener = [
    'Here is a fresh take on the piece:',
    'The following is an original reworking of the article:',
    'A rephrased version of the post follows:',
    'Reworded for a new audience:',
  ][seed % 4];
  // Sentence-shuffle to guarantee the output is not a verbatim copy while
  // keeping the same content and entities.
  const sentences = source
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const reworded = sentences
    .map((s) => s.trim())
    .reverse()
    .join(' ');
  return carryThrough(source, `${opener} ${reworded}`);
}

function translateAr(source, seed) {
  // Not a real translation — a deterministic Arabic-block stand-in that keeps
  // any already-Arabic text and all entities intact, so language-block and
  // entity checks behave like they would against a real model.
  const lead = [
    'هذه ترجمة عربية للمقال.',
    'فيما يلي النص باللغة العربية.',
    'ترجمة المحتوى إلى العربية:',
    'النسخة العربية من المقال:',
  ][seed % 4];
  const keptArabic = arabicSpans(source).join(' ');
  const body = 'تم تحويل المحتوى إلى اللغة العربية مع الحفاظ على التفاصيل الأساسية.';
  const out = [lead, keptArabic, body].filter(Boolean).join(' ');
  return carryThrough(source, out);
}

function seoJson(source, seed) {
  const nouns = uniq(properNouns(source)).slice(0, 5);
  const base = (nouns[0] || 'Real Estate Guide').toString();
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `article-${seed % 1000}`;
  const tags = uniq([...nouns.map((n) => n.toLowerCase()), 'real-estate', 'egypt']).slice(0, 6);
  return JSON.stringify({
    seo_title: `${base} — Guide & Insights`,
    slug,
    meta_description: `An overview of ${base} for buyers and renters, with the key details you need.`,
    tags,
  });
}

// Pick the mode from the prompt. Falls back to a rewrite.
function classify(text) {
  const t = text.toLowerCase();
  if (/\b(seo|slug|meta description|meta-description|tags|keywords)\b/.test(t)) return 'seo';
  if (/\b(translate|arabic|بالعربية|to arabic|arabic translation)\b/.test(t) || /translat/.test(t)) return 'translate';
  return 'rewrite';
}

// Flatten chat messages to the user-facing text we generate from.
function inputText(messages) {
  if (!Array.isArray(messages)) return '';
  const user = messages.filter((m) => m && m.role === 'user');
  const src = (user.length ? user : messages)
    .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))
    .join('\n');
  return src;
}

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.get('/v1/models', (_req, res) => {
  res.json({ object: 'list', data: [{ id: 'mock-1', object: 'model', owned_by: 'local' }] });
});

app.post('/v1/chat/completions', (req, res) => {
  const body = req.body || {};
  const messages = body.messages || [];
  const src = inputText(messages);
  const mode = classify(src);
  const seed = parseInt(hash(src).slice(0, 8), 16);

  let content;
  if (mode === 'seo') content = seoJson(src, seed);
  else if (mode === 'translate') content = translateAr(src, seed);
  else content = rewriteEn(src, seed);

  const promptTokens = Math.max(1, Math.round(src.length / 4));
  const completionTokens = Math.max(1, Math.round(content.length / 4));

  res.json({
    id: `chatcmpl-${hash(src).slice(0, 24)}`,
    object: 'chat.completion',
    created: 0, // fixed so responses are byte-stable
    model: body.model || 'mock-1',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`mock-llm listening on :${PORT}`);
});
