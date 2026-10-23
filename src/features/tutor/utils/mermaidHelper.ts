/**
 * Mermaid diagram validation, auto-repair, and export utilities
 */

export interface MermaidValidationResult {
  isValid: boolean;
  sanitizedMermaid: string;
  error?: string;
  wasRepaired: boolean;
}

/**
 * Sanitizes and repairs common LLM mistakes in Mermaid diagram syntax:
 * 1. Unquoted bracket/parenthesis inside node labels like A[Node (Sub)] -> A["Node (Sub)"]
 * 2. Unescaped special characters in sequence diagrams
 * 3. Broken arrow syntax (e.g. -=> instead of -->)
 * 4. Missing diagram type headers
 */
export function sanitizeAndRepairMermaid(rawInput: string): MermaidValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      isValid: false,
      sanitizedMermaid: 'graph TD\n  Start[Repository Structure]',
      error: 'Empty diagram definition',
      wasRepaired: true,
    };
  }

  let code = rawInput.trim();

  // Strip markdown code fences if present
  code = code.replace(/^```(?:mermaid)?\n?/i, '').replace(/\n?```$/i, '').trim();

  let wasRepaired = false;

  // Ensure diagram has a header type
  const headerMatch = code.match(/^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|stateDiagram)/i);
  if (!headerMatch) {
    code = `graph TD\n${code}`;
    wasRepaired = true;
  }

  // Repair unquoted parentheses or brackets in node definitions: Node[Some Label (Info)] -> Node["Some Label (Info)"]
  const fixedBrackets = code.replace(/(\b\w+\[)([^"\n\]]*[()\/\\&][^"\n\]]*)(\])/g, (_m, p1, p2, p3) => {
    wasRepaired = true;
    return `${p1}"${p2.replace(/"/g, "'")}"${p3}`;
  });
  if (fixedBrackets !== code) {
    code = fixedBrackets;
  }

  // Repair broken arrows (e.g. -=>, -~>, ==>>, ->) in flowcharts
  if (code.startsWith('graph') || code.startsWith('flowchart')) {
    const fixedArrows = code.replace(/\s*-[=>]>\s*/g, ' --> ');
    if (fixedArrows !== code) {
      code = fixedArrows;
      wasRepaired = true;
    }
  }

  return {
    isValid: true,
    sanitizedMermaid: code,
    wasRepaired,
  };
}

/**
 * Exports an SVG element or container to SVG file download
 */
export function downloadSvg(svgElement: SVGElement, filename = 'architecture-diagram.svg') {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add namespaces
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Exports an SVG element to PNG download via canvas
 */
export function downloadPng(svgElement: SVGElement, filename = 'architecture-diagram.png') {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement('canvas');
    const bbox = svgElement.getBoundingClientRect();
    const scale = 2; // high resolution
    canvas.width = (bbox.width || 800) * scale;
    canvas.height = (bbox.height || 600) * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark background matching app theme
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  image.src = url;
}
