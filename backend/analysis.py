from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json
from typing import List

# models
EMB_MODEL_NAME = "all-MiniLM-L6-v2"
GEN_MODEL_NAME = "facebook/bart-large-cnn"
SENT_MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"

embedder = SentenceTransformer(EMB_MODEL_NAME)
gen_tokenizer = AutoTokenizer.from_pretrained(GEN_MODEL_NAME)
gen_model = AutoModelForSeq2SeqLM.from_pretrained(GEN_MODEL_NAME)
summarizer = pipeline("summarization", model=GEN_MODEL_NAME, tokenizer=gen_tokenizer)
sentiment_analyzer = pipeline("sentiment-analysis", model=SENT_MODEL_NAME)

def summarize_text(text: str) -> str:
    if not text or len(text.strip()) == 0:
        return ""
    max_chunk_chars = 1000
    parts = [text[i:i+max_chunk_chars] for i in range(0, len(text), max_chunk_chars)]
    part_summaries = []
    for p in parts:
        s = summarizer(p, max_length=130, min_length=30, do_sample=False)[0]["summary_text"]
        part_summaries.append(s)
    return " ".join(part_summaries)

def analyze_sentiment(text: str):
    if not text:
        return "NEUTRAL", 0.0
    res = sentiment_analyzer(text[:1000])
    label = res[0]["label"]
    score = float(res[0]["score"])
    return label, score

def chunk_texts(text: str, max_words=200, overlap_words=40) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i+max_words]
        chunks.append(" ".join(chunk_words))
        i += max_words - overlap_words
    return chunks

def compute_and_store_embeddings(video_id: str, chunks: List[str], storage_dir: str):
    if not chunks:
        return
    embeddings = embedder.encode(chunks, convert_to_numpy=True, show_progress_bar=False)
    # normalize for cosine
    faiss.normalize_L2(embeddings)
    d = embeddings.shape[1]
    index = faiss.IndexFlatIP(d)
    index.add(embeddings)
    path = os.path.join(storage_dir, f"faiss_{video_id}.index")
    faiss.write_index(index, path)
    # save chunk texts mapping
    meta = {"chunks": chunks}
    with open(os.path.join(storage_dir, f"{video_id}_chunks.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

def retrieve_answer(video_id: str, question: str, top_k: int = 4, storage_dir: str = ".") -> str:
    # embed question
    q_emb = embedder.encode([question], convert_to_numpy=True)
    faiss.normalize_L2(q_emb)
    index_path = os.path.join(storage_dir, f"faiss_{video_id}.index")
    chunks_path = os.path.join(storage_dir, f"{video_id}_chunks.json")
    if not os.path.exists(index_path) or not os.path.exists(chunks_path):
        raise ValueError("Index or chunks not found for video_id")
    index = faiss.read_index(index_path)
    D, I = index.search(q_emb, top_k)
    I = I[0].tolist()
    with open(chunks_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    chunks = meta.get("chunks", [])
    retrieved = []
    for idx in I:
        if 0 <= idx < len(chunks):
            retrieved.append(chunks[idx])
    context = "\n\n".join(retrieved)
    prompt = (
        "You are an assistant answering questions about a YouTube video's transcript. "
        "Use only the context below to answer the question. If the answer is not contained, say you don't know.\n\n"
        f"CONTEXT:\n{context}\n\nQUESTION: {question}\n\nAnswer concisely:"
    )
    inputs = gen_tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
    output_ids = gen_model.generate(**inputs, max_length=250, num_beams=4, early_stopping=True)
    answer = gen_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return answer
