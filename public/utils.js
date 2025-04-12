// utils.js

export function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : "";
}

export function numberToWords(number) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];

    function convertLessThanOneThousand(n) {
    
        if (isNaN(n)) return "";
        n = Number(n); // ensure it's a number

        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
        return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "");
    }

    if (number === 0) return "Zero";

    const [integerPart, decimalPart] = number.toString().split(".");
    let result = "";

    const intValue = Number.parseInt(integerPart);
    // Handle Lakh
    if (intValue >= 100000) {
        result += convertLessThanOneThousand(Math.floor(intValue / 100000)) + " Lakh ";
    }
    // Handle Thousand
    if (intValue >= 1000) {
        result += convertLessThanOneThousand(Math.floor((intValue % 100000) / 1000)) + " Thousand ";
    }
    // Handle Hundreds
    result += convertLessThanOneThousand(intValue % 1000);

    // Handle Decimal (Paise)
    if (decimalPart) {
        const decimalValue = Number.parseInt(decimalPart);
        if (decimalValue > 0) {
            result += " and " + convertLessThanOneThousand(decimalValue) + " Paise";
        }
    }

    return result.trim();
}

// New Date Utility Functions

export function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

export function formatDateToDDMMYYYY(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

export function prettifyDate(isoDate) {
    const date = new Date(isoDate);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
}
