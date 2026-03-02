let documentText="";

export function setDocument(text){
    documentText = text;
}

export function getDocument(){
    return documentText;
}

export function hasDocument(){
    return !!documentText;
}