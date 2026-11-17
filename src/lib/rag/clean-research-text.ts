export function cleanResearchText(text: string): string {
  return (
    text
      // Normalize line endings
      .replace(/\r\n?/g, "\n")

      // Remove recurring Frontiers PDF page headers/footers
      .replace(/Frontiers in\s*Physiology\s*frontiersin\.org\s*\d{1,2}/gi, "")

      // Remove recurring author + DOI page headers
      .replace(/Plotkin et al\.\s*10\.3389\/fphys\.2023\.1279170/gi, "")

      // Normalize horizontal whitespace
      .replace(/[ \t]+/g, " ")

      // Remove excessive blank lines
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
}
