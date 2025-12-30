/**
 * citation-utils.ts
 * Utilities for detecting and formatting law citations in text.
 */

// Regex patterns for common Philippine laws and codes
// Captures: "RA 9514", "PD 1096", "BP 344", "Rule VII", "Section 10.2"
// We use a custom protocol "law:" to handle clicks
export function formatCitations(text: string): string {
    if (!text) return "";

    // 1. Republic Acts (e.g., RA 9514, R.A. 9514)
    // 2. Presidential Decrees (e.g., PD 1096, P.D. 1096)
    // 3. Batas Pambansa (e.g., BP 344)
    // 4. Rule/Section specific references (simplified)

    let formatted = text;

    const patterns = [
        { regex: /(?<!\[)(?:R\.?A\.?|Republic Act)\s+(\d+)(?!\])/gi, prefix: "RA" },
        { regex: /(?<!\[)(?:P\.?D\.?|Presidential Decree)\s+(\d+)(?!\])/gi, prefix: "PD" },
        // BP 344 disabled at user request (bad source encoding)
        // { regex: /(?<!\[)(?:B\.?P\.?|Batas Pambansa)\s+(\d+)(?!\])/gi, prefix: "BP" },
        { regex: /(?<!\[)(?:Rule)\s+([IVXLCDM]+)(?!\])/gi, prefix: "Rule" }, // Roman numerals
    ];

    patterns.forEach(({ regex, prefix }) => {
        formatted = formatted.replace(regex, (match, number) => {
            // Normalize citation for lookup (e.g., "RA 9514")
            const citation = `${prefix} ${number}`;
            // Return markdown link with custom protocol, encoding spaces
            // [**Match**](law:Citation)
            return `[**${match}**](law:${encodeURIComponent(citation)})`;
        });
    });

    return formatted;
}

// Extract a clean excerpt from the law content
export function getLawExcerpt(content: string, maxLength: number = 300): string {
    if (!content) return "";
    const cleaned = content.replace(/[#*`]/g, ''); // Remove markdown syntax
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + "...";
}
