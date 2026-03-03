export function checkHallucination(result, topChunks) {

    if (
        result.answer?.trim() ===
        "Answer not found in the document."
    ) {
        return false;
    }


    if (!Array.isArray(result.sources) || result.sources.length === 0) {
        return true;
    }


    const chunkMap = new Map(
        topChunks.map(c => [c.chunkId, c.text])
    );


    for (const src of result.sources) {
        const chunkText = chunkMap.get(src.chunkId);


        if (!chunkText) {
            return true;
        }


        if (!chunkText.includes(src.snippet)) {
            return true;
        }
    }


    return false;
}