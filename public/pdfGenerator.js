// pdfGenerator.js
import { getInputValue, numberToWords, formatDateToDDMMYYYY } from './utils.js';

let pdfBlob = null;

/**
 * Draws page borders with proper continuation handling
 * @param {object} doc - jsPDF document instance
 * @param {number} pageNumber - Current page number (1-based)
 * @param {number} totalPages - Total pages in document
 * @param {number} borderX - X position of border
 * @param {number} borderY - Y position of border
 * @param {number} borderWidth - Width of border
 * @param {number} borderHeight - Height of border
 */
const drawPageBorder = (doc, pageNumber, totalPages, borderX, borderY, borderWidth, borderHeight) => {
    // Always draw left and right borders
    doc.line(borderX, borderY, borderX, borderY + borderHeight); // Left border
    doc.line(borderX + borderWidth, borderY, borderX + borderWidth, borderY + borderHeight); // Right border
    
    // Draw top border only on first page
    if (pageNumber === 1) {
        doc.line(borderX, borderY, borderX + borderWidth, borderY); // Top border
    }
    
    // Draw bottom border only on last page (or if single page)
    if (pageNumber === totalPages) {
        doc.line(borderX, borderY + borderHeight, borderX + borderWidth, borderY + borderHeight); // Bottom border
    }
};

export function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Page dimensions and border calculations
    const pageWidth = 210;
    const pageHeight = 297;
    const borderX = 5;
    const borderY = 5;
    const borderWidth = pageWidth - 2 * borderX;
    const borderHeight = pageHeight - 2 * borderY;

    // Initial page count (will update as pages are added)
    let totalPages = 1;

    // Draw initial border
    drawPageBorder(doc, 1, totalPages, borderX, borderY, borderWidth, borderHeight);
    // Add decorative border after "Shree Ganeshay Namah"
    doc.setDrawColor(150, 150, 150); // Set border color (gray)
    doc.setLineWidth(0.2); // Thin line
    doc.line(60, 19, 150, 19); // Horizontal line below the text

    // --- HEADER SECTION ---
    const invoiceType = getInputValue("invoiceType") || "Invoice";
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceType.toUpperCase(), 105, 13, null, null, "center");

    doc.setFontSize(5);
    doc.text("Shree Ganeshay Namah", 105, 17, null, null, "center");

    // --- COMPANY DETAILS ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("JAY MATA DI TRADING", 105, 29, null, null, "center");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("S/O- BIPIN KUMAR SINGH, RAMPATTY, WARD NO-08", 105, 35, null, null, "center");
    doc.text(" MAIN ROAD SINGHESHWAR, NEAR STATE BANK, MADHEPURA-852128", 105, 40, null, null, "center");
    doc.text("E-Mail : jmdt0051@gmail.com", 105, 45, null, null, "center");
    doc.text("Contact : 9631583115 / 9430453146", 105, 50, null, null, "center");
    doc.text("GSTIN/UIN: 10IZKPS3803Q1ZT", 105, 55, null, null, "center");
    doc.text("State Name : Bihar, Code : 10", 105, 60, null, null, "center");

    // Company section border (complete rectangle)
    doc.rect(5, 5, 200, 60);

    // --- BUYER DETAILS ---
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

    const buyerState = getInputValue("buyerState");
    const buyerStateCode = getInputValue("buyerStateCode");
    doc.text(`State Name : ${buyerState}, Code : ${buyerStateCode}`, 15, 111);
    doc.text("Contact person: " + getInputValue("contactPerson"), 15, 117);
    doc.text("Contact: " + getInputValue("contact"), 15, 123);
    doc.text("Fax: " + getInputValue("fax"), 15, 129);

    // --- VERTICAL SEPARATOR LINE ---
    doc.setDrawColor(200, 200, 200); // Same gray color
    doc.setLineWidth(0.2); // Same thin line
    doc.line(120, 75, 120, 120); // Horizontal line positioned just above invoice info

    // --- INVOICE INFO ---
    doc.text(invoiceType + " No.", 125, 75); // Adjusted from 130
    doc.text(getInputValue("invoiceNo"), 165, 75); // Adjusted from 170
    doc.text("Delivery Note", 125, 81);
    doc.text("Mode/Terms of Payment", 125, 87);
    doc.text("Buyer's Order No.", 125, 93);
    doc.text("Dated", 125, 99);
    doc.text(formatDateToDDMMYYYY(getInputValue("date")), 165, 99); // Adjusted
    doc.text("Dispatch Doc No.", 125, 105);
    doc.text(getInputValue("dispatchDocNo"), 165, 105); // Adjusted
    doc.text("Delivery Note Date", 125, 111);
    doc.text("Dispatched through", 125, 117);
    doc.text(getInputValue("dispatchedThrough"), 165, 117); // Adjusted
    doc.text("Destination", 125, 123);
    doc.text(getInputValue("destination"), 165, 123); // Adjusted

    // Horizontal separator line
    doc.line(5, 140, 205, 140);

    // --- PRODUCT TABLE ---
    const products = JSON.parse(getInputValue("products"));
    const tableBody = products.map((p, i) => [
        i + 1,
        p.description,
        p.hsnSac,
        p.quantity,
        p.rate,
        "Nos",
        (p.quantity * p.rate).toFixed(2),
    ]);

    doc.autoTable({
        startY: 145,
        head: [["Sl", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Amount"]],
        body: tableBody,
        styles: { 
            fontSize: 7, 
            cellPadding: 1,
            textColor: [0, 0, 0] // Black text for body
        },
        headStyles: { 
            fillColor: [52, 144, 209], // Dark blue background
            textColor: [255, 255, 255], // White text
            fontSize: 7, 
            fontStyle: "bold",
            halign: 'center',
            cellPadding: 1
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            2: { cellWidth: 20 },
            3: { cellWidth: 15 },
            4: { cellWidth: 20 },
            5: { cellWidth: 15 },
            6: { cellWidth: 20 },
        },
        didDrawPage: (data) => {
            totalPages = data.pageCount;
            drawPageBorder(doc, data.pageNumber, totalPages, borderX, borderY, borderWidth, borderHeight);
        }
    });

    // --- TAX CALCULATION ---
    const totalAmount = products.reduce((sum, p) => sum + (p.quantity * p.rate), 0);
    const gstRate = parseFloat(getInputValue("gstRate"));
    const sellerState = "Bihar";
    const isInterState = sellerState.toLowerCase() !== buyerState.toLowerCase();

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
        igst = (totalAmount * (gstRate / 100)).toFixed(2);
    } else {
        cgst = (totalAmount * (gstRate / 2 / 100)).toFixed(2);
        sgst = (totalAmount * (gstRate / 2 / 100)).toFixed(2);
    }

    const totalBeforeRoundOff = totalAmount + +cgst + +sgst + +igst;
    const roundedTotal = Math.round(totalBeforeRoundOff);
    const roundOff = (roundedTotal - totalBeforeRoundOff).toFixed(2);
    const total = roundedTotal.toFixed(2);

    let finalY = doc.lastAutoTable.finalY || 180;

    // Check if we need a new page for tax summary
    if (finalY > 230) {
        doc.addPage();
        totalPages = doc.internal.getNumberOfPages();
        drawPageBorder(doc, totalPages, totalPages, borderX, borderY, borderWidth, borderHeight);
        finalY = 30; // Start content higher on continuation page
    }

    // Tax details
    doc.setFontSize(8);
    if (isInterState) {
        doc.text("IGST OUTPUT TAX", 15, finalY + 10);
        doc.text(igst, 60, finalY + 10, { align: "right" });
    } else {
        doc.text("CGST OUTPUT TAX", 15, finalY + 10);
        doc.text(cgst, 60, finalY + 10, { align: "right" });

        doc.text("SGST OUTPUT TAX", 15, finalY + 16);
        doc.text(sgst, 60, finalY + 16, { align: "right" });
    }

    doc.text("Round Off", 15, finalY + 22);
    doc.text(roundOff, 60, finalY + 22, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total ₹", 130, finalY + 22);
    doc.text(total, 160, finalY + 22, { align: "right" });
    doc.setFont("helvetica", "normal");

    // Amount in words
    doc.setFontSize(8);
    doc.text("Amount Chargeable (in words)", 15, finalY + 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Indian Rupees " + numberToWords(total) + " Only", 15, finalY + 36);
    doc.setFont("helvetica", "normal");

    // --- TAX SUMMARY TABLE ---
    const taxSummaryBody = products.map(p => [
        p.hsnSac,
        (p.quantity * p.rate).toFixed(2),
        isInterState ? `${gstRate}%` : `${gstRate / 2}%`,
        isInterState ? (p.quantity * p.rate * (gstRate / 100)).toFixed(2) : (p.quantity * p.rate * (gstRate / 2 / 100)).toFixed(2),
        isInterState ? "" : `${gstRate / 2}%`,
        isInterState ? "" : (p.quantity * p.rate * (gstRate / 2 / 100)).toFixed(2),
        (p.quantity * p.rate * (gstRate / 100)).toFixed(2),
    ]);

    taxSummaryBody.push([
        "Total",
        totalAmount.toFixed(2),
        "",
        isInterState ? igst : cgst,
        "",
        isInterState ? "" : sgst,
        (+cgst + +sgst + +igst).toFixed(2),
    ]);

    doc.autoTable({
        startY: finalY + 40,
        head: [[
            "HSN/SAC", "Taxable Value", isInterState ? "IGST Rate" : "CGST Rate",
            isInterState ? "IGST Amount" : "CGST Amount",
            isInterState ? "" : "SGST/UTGST Rate",
            isInterState ? "" : "SGST/UTGST Amount",
            "Total Tax Amount"
        ]],
        body: taxSummaryBody,
        styles: { fontSize: 7 },
        didDrawPage: (data) => {
            totalPages = data.pageCount;
            drawPageBorder(doc, data.pageNumber, totalPages, borderX, borderY, borderWidth, borderHeight);
        }
    });

    // --- SELLER SIGNATURE BLOCK ---
    const taxY = doc.lastAutoTable.finalY;
    const remainingHeight = pageHeight - taxY - 15;
    
    if (remainingHeight < 40) {
        doc.addPage();
        totalPages = doc.internal.getNumberOfPages();
        drawPageBorder(doc, totalPages, totalPages, borderX, borderY, borderWidth, borderHeight);
        addSellerSignatureBlock(doc, 30, invoiceType);
    } else {
        addSellerSignatureBlock(doc, taxY + 10, invoiceType);
    }
    
    // --- FOOTER ---
    doc.setFontSize(6);
    const footerY = pageHeight - 2;
    doc.text("This is a Computer Generated " + invoiceType, pageWidth / 2, footerY, null, null, "center");

    // --- PAGE NUMBERS ---
    totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawPageBorder(doc, i, totalPages, borderX, borderY, borderWidth, borderHeight);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 2);
    }

    // Return PDF as blob
    pdfBlob = doc.output("blob");
    return pdfBlob;
}

/**
 * Adds seller signature block
 * @param {object} doc - jsPDF document instance
 * @param {number} yPosition - Vertical start position
 * @param {string} invoiceType - Type of invoice
 */
function addSellerSignatureBlock(doc, yPosition, invoiceType) {
    // Company PAN
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Company's PAN :", 15, yPosition + 10);
    doc.setFont("helvetica", "bold");
    doc.text("IZKPS3803Q", 45, yPosition + 10);
    doc.setFont("helvetica", "normal");
  
    // Declaration
    doc.setFontSize(8);
    doc.text("Declaration", 15, yPosition + 20);
    doc.setFontSize(6);
    doc.text("We declare that this " + invoiceType.toLowerCase() + " shows the actual price of the", 15, yPosition + 25);
    doc.text("goods described and that all particulars are true and", 15, yPosition + 29);
    doc.text("correct.", 15, yPosition + 33);
  
    // Company's Bank Details
    doc.setFontSize(8);
    doc.text("Company's Bank Details", 115, yPosition + 20);
    doc.setFontSize(6);
    doc.text("A/c Holder's Name:", 115, yPosition + 25);
    doc.text("JAY MATA DI TRADING", 150, yPosition + 25);
    doc.text("Bank Name:", 115, yPosition + 29);
    doc.text("Punjab National Bank_ Current Account", 150, yPosition + 29);
    doc.text("A/c No.:", 115, yPosition + 33);
    doc.text("6403002100002325", 150, yPosition + 33);
    doc.text("Branch & IFS Code:", 115, yPosition + 37);
    doc.text("SINGHESHWARSTHAN, Madhepura & PUNB0640300", 150, yPosition + 37);
  
    // Signature
    doc.setFontSize(8);
    doc.text("for JAY MATA DI TRADING", 160, yPosition + 47);
    doc.text("Authorised Signatory", 160, yPosition + 51);
}