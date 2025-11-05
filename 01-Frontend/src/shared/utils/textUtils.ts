export function capitalizeText(text: string): string {
    // Convierte todo a minúsculas, luego capitaliza cada palabra
    return text
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Si quieres capitalizar solo la primera letra de una palabra:
export function capitalizeWord(word: string): string {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
