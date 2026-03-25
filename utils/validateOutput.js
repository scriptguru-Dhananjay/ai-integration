export default function validateOutput(data){
    if (!data || typeof data.answer !== "string"){
        throw new Error("Invlaid LLM Output");
    }

    return data;
}