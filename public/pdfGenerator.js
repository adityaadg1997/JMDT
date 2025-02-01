// pdfGenerator.js
import { getInputValue, numberToWords } from './utils.js';

let pdfBlob = null; // Store the PDF blob globally

export function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Set font
    doc.setFont("helvetica");

    // Header // SELLER // SHOPKEEPER
    doc.setFontSize(18);
    doc.text("INVOICE", 105, 13, null, null, "center"); // Shifted up by 5mm (from y=15 to y=10)
    doc.setFontSize(5);
    doc.text("Shree Ganeshay Namah", 105, 17, null, null, "center"); // Shifted up by 5mm (from y=22 to y=17)

    // Add border to the page starting below the header
    doc.rect(5, 20, 200, 267); // Start the border at y = 25 (below "Shree Ganeshay Namah")

    // Continue with the rest of the content
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("JAY MATA DI TRADING", 105, 29, null, null, "center");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("S/O- BIPIN KUMAR SINGH, RAMPATTY, WARD NO-08", 105, 35, null, null, "center");
    doc.text(" MAIN ROAD SINGHESHWAR, NEAR STATE BANK, MADHEPURA-852128", 105, 40, null, null, "center");
    doc.text("E-Mail : subhampratap98@gmail.com", 105, 45, null, null, "center");
    doc.text("Contact : 9631583115 / 9430453146", 105, 50, null, null, "center");
    doc.text("GSTIN/UIN: 10IZKPS3803Q1ZT", 105, 55, null, null, "center");
    doc.text("State Name : Bihar, Code : 10", 105, 60, null, null, "center");

    // Draw border around Company Details
    doc.rect(5, 5, 200, 60); // Adjust the coordinates and dimensions as needed

    // Buyer details
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Buyer (Bill to)", 15, 75);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(getInputValue("buyerName"), 15, 81);
    const buyerAddress = getInputValue("buyerAddress").split("\n");
    buyerAddress.forEach((line, index) => {
        doc.text(line, 15, 87 + index * 6);
    });
    doc.text("GSTIN/UIN: " + getInputValue("buyerGSTIN"), 15, 105);

    // Combine State Name and State Code into one line
    const buyerState = getInputValue("buyerState");
    const buyerStateCode = getInputValue("buyerStateCode");
    doc.text(`State Name : ${buyerState}, Code : ${buyerStateCode}`, 15, 111);

    doc.text("Place of Supply: " + getInputValue("placeOfSupply"), 15, 117);
    doc.text("Contact person: " + getInputValue("contactPerson"), 15, 123);
    doc.text("Contact: " + getInputValue("contact"), 15, 129);
    doc.text("Fax: " + getInputValue("fax"), 15, 135);

    // Draw border around Buyer Details
    doc.rect(125, 65, 0, 75); // Adjust the coordinates and dimensions as needed

    // Invoice details
    doc.text("Invoice No.", 130, 75);
    doc.text(getInputValue("invoiceNo"), 170, 75);
    doc.text("Delivery Note", 130, 81);
    doc.text("Mode/Terms of Payment", 130, 87);
    doc.text("Buyer's Order No.", 130, 93);
    doc.text("Dated", 130, 99);
    doc.text(getInputValue("date"), 170, 99);
    doc.text("Dispatch Doc No.", 130, 105);
    doc.text(getInputValue("dispatchDocNo"), 170, 105);
    doc.text("Delivery Note Date", 130, 111);
    doc.text("Dispatched through", 130, 117);
    doc.text(getInputValue("dispatchedThrough"), 170, 117);
    doc.text("Destination", 130, 123);
    doc.text(getInputValue("destination"), 170, 123);

    // Item details table
    const products = JSON.parse(getInputValue("products")); // Assuming products are stored in a JSON string
    const tableBody = products.map((product, index) => [
        index + 1,
        product.description,
        product.hsnSac,
        product.quantity,
        product.rate,
        "Nos",
        (product.quantity * product.rate).toFixed(2),
    ]);

    doc.autoTable({
        startY: 145,
        head: [["Sl", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Amount"]],
        body: tableBody,
        styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' }, // Smaller font and text wrapping
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 7, fontStyle: "bold" },
        columnStyles: {
            0: { cellWidth: 10 }, // Sl. No.
            1: { cellWidth: 80 }, // Description of Goods (wider for long text)
            2: { cellWidth: 20 }, // HSN/SAC
            3: { cellWidth: 15 }, // Quantity
            4: { cellWidth: 20 }, // Rate
            5: { cellWidth: 15 }, // per
            6: { cellWidth: 20 }, // Amount
        },
        didDrawCell: (data) => {
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            const x = data.settings.margin.left + data.column.x;
            const y1 = data.y;
            const y2 = data.y + data.row.height;
            if (x >= 0 && y1 >= 0 && y2 >= 0) {
                doc.line(x, y1, x, y2);
            }
        },
    });

    // Calculate total amount, taxes, and round off
    const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.rate), 0);
    const gstRate = parseFloat(getInputValue("gstRate")); // Get GST rate from input (12% or 18%)
    const cgst = (totalAmount * (gstRate / 2 / 100)).toFixed(2); // CGST is half of GST rate
    const sgst = (totalAmount * (gstRate / 2 / 100)).toFixed(2); // SGST is half of GST rate

    // Dynamic Round Off Calculation
    const totalBeforeRoundOff = totalAmount + Number.parseFloat(cgst) + Number.parseFloat(sgst);
    const roundedTotal = Math.round(totalBeforeRoundOff); // Round to the nearest whole number
    const roundOff = (roundedTotal - totalBeforeRoundOff).toFixed(2); // Calculate the difference for Round Off
    const total = roundedTotal.toFixed(2); // Final total after rounding

    // Add tax details
    const finalY = doc.lastAutoTable.finalY || 180;
    doc.setFontSize(8);

    // CGST OUTPUT TAX
    doc.text("CGST OUTPUT TAX", 15, finalY + 10); // Label at X = 15
    doc.text(cgst, 60, finalY + 10, { align: "right" }); // Amount at X = 60 (right-aligned)

    // SGST OUTPUT TAX
    doc.text("SGST OUTPUT TAX", 15, finalY + 16); // Label at X = 15
    doc.text(sgst, 60, finalY + 16, { align: "right" }); // Amount at X = 60 (right-aligned)

    // Round Off
    doc.text("Round Off", 15, finalY + 22); // Label at X = 15
    doc.text(roundOff, 60, finalY + 22, { align: "right" }); // Amount at X = 60 (right-aligned)

    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total ₹", 130, finalY + 22); // Label at X = 130
    doc.text(total, 160, finalY + 22, { align: "right" }); // Amount at X = 160 (right-aligned, closer to the label)
    doc.setFont("helvetica", "normal");

    // Amount in words
    doc.setFontSize(8);
    doc.text("Amount Chargeable (in words)", 15, finalY + 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Indian Rupees " + numberToWords(total) + " Only", 15, finalY + 36);
    doc.setFont("helvetica", "normal");

    // Tax summary table
    const taxSummaryBody = products.map(product => [
        product.hsnSac,
        (product.quantity * product.rate).toFixed(2),
        `${gstRate / 2}%`,
        (product.quantity * product.rate * (gstRate / 2 / 100)).toFixed(2),
        `${gstRate / 2}%`,
        (product.quantity * product.rate * (gstRate / 2 / 100)).toFixed(2),
        (product.quantity * product.rate * (gstRate / 100)).toFixed(2),
    ]);

    taxSummaryBody.push([
        "Total",
        totalAmount.toFixed(2),
        "",
        cgst,
        "",
        sgst,
        (Number.parseFloat(cgst) + Number.parseFloat(sgst)).toFixed(2),
    ]);

    doc.autoTable({
        startY: finalY + 40,
        head: [
            [
                "HSN/SAC",
                "Taxable Value",
                "CGST Rate",
                "CGST Amount",
                "SGST/UTGST Rate",
                "SGST/UTGST Amount",
                "Total Tax Amount",
            ],
        ],
        body: taxSummaryBody,
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 8, fontStyle: "bold" },
        didDrawCell: (data) => {
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            const x = data.settings.margin.left + data.column.x;
            const y1 = data.y;
            const y2 = data.y + data.row.height;
            if (x >= 0 && y1 >= 0 && y2 >= 0) {
                doc.line(x, y1, x, y2);
            }
        },
    });

    // Draw border around Item Details & Tax Amount
    doc.rect(5, 140, 200, finalY + 40 - 140); // Adjust the coordinates and dimensions as needed

    // Tax Amount in words
    const taxY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(8);
    doc.text(
        "Tax Amount (in words) : Indian Rupees " +
            numberToWords((Number.parseFloat(cgst) + Number.parseFloat(sgst)).toFixed(2)) +
            " Only",
        15,
        taxY,
    );

    // Company details
    doc.text("Company's PAN :", 15, taxY + 10);
    doc.setFont("helvetica", "bold");
    doc.text("IZKPS3803Q", 45, taxY + 10);
    doc.setFont("helvetica", "normal");

    // Declaration
    doc.setFontSize(8);
    doc.text("Declaration", 15, taxY + 20);
    doc.setFontSize(6);
    doc.text("We declare that this invoice shows the actual price of the", 15, taxY + 25);
    doc.text("goods described and that all particulars are true and", 15, taxY + 29);
    doc.text("correct.", 15, taxY + 33);

    // Company's Bank Details
    doc.setFontSize(8);
    doc.text("Company's Bank Details", 115, taxY + 20);
    doc.setFontSize(6);
    doc.text("A/c Holder's Name:", 115, taxY + 25);
    doc.text("JAY MATA DI TRADING", 150, taxY + 25);
    doc.text("Bank Name:", 115, taxY + 29);
    doc.text("Punjab National Bank_ Current Account", 150, taxY + 29);
    doc.text("A/c No.:", 115, taxY + 33);
    doc.text("6403002100002325", 150, taxY + 33);
    doc.text("Branch & IFS Code:", 115, taxY + 37);
    doc.text("SINGHESHWARSTHAN, Madhepura & PUNB0640300", 150, taxY + 37);

    // Signature
    doc.setFontSize(8);
    doc.text("for JAY MATA DI TRADING", 160, taxY + 42);
    doc.text("Authorised Signatory", 160, taxY + 46);

    // Footer
    doc.setFontSize(6);
    doc.text("This is a Computer Generated Invoice", 105, 290, null, null, "center");

    // Instead of saving, get the PDF as a blob
    pdfBlob = doc.output("blob"); // Store the blob globally
    return pdfBlob;
}