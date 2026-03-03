let vectorDB = [];

export async function addToVectorDB(item) {
    vectorDB.push(item);
}

export async function getVectorDB() {
    return vectorDB;   
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function searchSimilar(queryEmbedding, topK = 3) {
  return vectorDB
    .map(item => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}