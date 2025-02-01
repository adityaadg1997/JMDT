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
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
        return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "");
    }

    if (number === 0) return "Zero";

    const [integerPart, decimalPart] = number.toString().split(".");
    let result = "";

    const intValue = Number.parseInt(integerPart);
    if (intValue >= 100000) {
        result += convertLessThanOneThousand(Math.floor(intValue / 100000)) + " Lakh ";
        number %= 100000;
    }
    if (intValue >= 1000) {
        result += convertLessThanOneThousand(Math.floor(intValue / 1000)) + " Thousand ";
        number %= 1000;
    }
    result += convertLessThanOneThousand(intValue % 1000);

    if (decimalPart) {
        result += " and " + convertLessThanOneThousand(Number.parseInt(decimalPart)) + " Paise";
    }

    return result.trim();
}