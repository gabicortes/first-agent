import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";
import { splitIntoSections } from "../src/lib/rag/split-sections";
import { chunkSections } from "../src/lib/rag/chunk-text";
import { cleanResearchText } from "../src/lib/rag/clean-research-text";

const INPUT_PATH = path.join(
  process.cwd(),
  "data/research/hip-trust-and-back-squat-training.pdf",
);

const OUTPUT_PATH = path.join(
  process.cwd(),
  "data/processed/hip-thrust-and-back-squat-training.txt",
);

async function ingestResearch() {
  const buffer = await fs.readFile(INPUT_PATH);

  const document = await pdf(buffer);

  const cleanedText = cleanResearchText(document.text);

  const sections = splitIntoSections(cleanedText);

  const chunks = chunkSections(sections);

  const chunksOutputPath = path.join(
    process.cwd(),
    "data/processed/research-chunks.json",
  );

  await fs.writeFile(chunksOutputPath, JSON.stringify(chunks, null, 2), "utf8");

  console.log("\nGenerated chunks:", chunks.length);

  console.log("\nFirst chunk:");
  console.log(chunks[0]);

  for (const section of sections) {
    console.log(`${section.title}: ${section.content.length} characters`);
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), {
    recursive: true,
  });

  await fs.writeFile(OUTPUT_PATH, cleanedText, "utf8");

  console.log("Pages:", document.numpages);
  console.log("Characters:", cleanedText.length);
  console.log("Preview:\n", cleanedText.slice(0, 1500));
}

ingestResearch().catch(console.error);
