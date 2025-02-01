// eventHandlers.js
import { generatePDF } from './pdfGenerator.js';
import { renderPDF } from './pdfRenderer.js';

let pdfBlob = null;

export function generateAndViewPDF() {
    pdfBlob = generatePDF();
    renderPDF(pdfBlob);

    // Show the download button
    const downloadButton = document.getElementById("downloadButton");
    downloadButton.style.display = "block";
}

export function downloadPDF() {
    if (pdfBlob) {
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = "invoice.pdf";
        downloadLink.click();
    } else {
        alert("No PDF generated yet. Please generate the invoice first.");
    }
}