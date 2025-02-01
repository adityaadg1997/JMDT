// pdfRenderer.js
export function renderPDF(pdfBlob) {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        const pdfArrayBuffer = this.result;

        // Use PDF.js to render the PDF
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
        loadingTask.promise.then((pdf) => {
            pdf.getPage(1).then((page) => {
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });

                const canvas = document.getElementById("pdf-render");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                page.render(renderContext);
            });
        });
    };
    fileReader.readAsArrayBuffer(pdfBlob);
}