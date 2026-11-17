import type { ResearchSection } from "./split-sections";

export type ResearchChunk = {
  id: string;
  section: string;
  content: string;
  chunkIndex: number;
  wordCount: number;
};

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

const EXCLUDED_SECTIONS = new Set([
  "References",
  "Data availability statement",
  "Ethics statement",
  "Author contributions",
  "Funding",
  "Acknowledgments",
  "Conflict of interest",
  "Publisher’s note",
]);

export function chunkSections(sections: ResearchSection[]): ResearchChunk[] {
  const chunks: ResearchChunk[] = [];

  for (const section of sections) {
    if (EXCLUDED_SECTIONS.has(section.title)) {
      continue;
    }

    const words = section.content.split(/\s+/).filter(Boolean);

    const step = CHUNK_SIZE - CHUNK_OVERLAP;

    for (let start = 0; start < words.length; start += step) {
      const chunkWords = words.slice(start, start + CHUNK_SIZE);

      chunks.push({
        id: `chunk-${chunks.length + 1}`,
        section: section.title,
        content: chunkWords.join(" "),
        chunkIndex: chunks.length,
        wordCount: chunkWords.length,
      });

      if (start + CHUNK_SIZE >= words.length) {
        break;
      }
    }
  }

  return chunks;
}
