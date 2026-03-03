export function chunkText(text, chunkSize = 500, overlap = 200) {
    const chunks = [];
    let start = 0;
    let id = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const content = text.slice(start, end);

        chunks.push({
            chunkId: `chunk_${id++}`,
            text: content.trim(),
        });

        start += chunkSize - overlap;
    }

    return chunks;
}