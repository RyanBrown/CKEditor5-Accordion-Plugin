// Helper function to create a new accordion element with default structure
export function insertAccordionElement(writer) {
  const accordion = writer.createElement("accordion");
  const header = writer.createElement("accordionHeader");
  const button = writer.createElement("accordionButton");
  const title = writer.createElement("accordionTitle");
  const panel = writer.createElement("accordionPanel");
  const paragraph = writer.createElement("paragraph", {
    content: "Enter your text here...",
  });

  // Build the nested structure
  writer.append(header, accordion);
  writer.append(button, header);
  writer.append(title, header);
  writer.append(panel, accordion);
  writer.append(paragraph, panel);

  return accordion;
}

// Helper for placeholder text
export const PLACEHOLDER_TEXTS = {
  TITLE: "Add accordion content...",
};

// Helper function for toggling accordion
export function toggleAccordionOpenState(writer, accordionElement) {
  const isOpen = accordionElement.getAttribute("isOpen");
  writer.setAttribute("isOpen", !isOpen, accordionElement);
}
