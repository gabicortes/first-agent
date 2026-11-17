export type ResearchSection = {
  title: string;
  content: string;
};

const SECTION_HEADINGS = [
  "Introduction",
  "Materials and methods",
  "Results",
  "Discussion",
  "Limitations",
  "Future directions",
  "Conclusion",
  "Data availability statement",
  "Ethics statement",
  "Author contributions",
  "Funding",
  "Acknowledgments",
  "Conflict of interest",
  "Publisher’s note",
  "References",
];

export function splitIntoSections(text: string): ResearchSection[] {
  const lines = text.split("\n");

  const sections: ResearchSection[] = [];

  let currentTitle = "Front matter";
  let currentContent: string[] = [];

  function saveSection() {
    const content = currentContent.join("\n").trim();

    if (content) {
      sections.push({
        title: currentTitle,
        content,
      });
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    const heading = SECTION_HEADINGS.find(
      (section) => section.toLowerCase() === trimmed.toLowerCase(),
    );

    if (heading) {
      saveSection();

      currentTitle = heading;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  saveSection();

  return sections;
}
