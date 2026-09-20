const XLSX = require("xlsx");
const fs = require("fs");

const filePath = "C:\\Delta Force\\v4. ten mien - snnmt - bo_sung_CSDL_theo_ND278_15.9.2026 (1).xlsx";
const workbook = XLSX.readFile(filePath);

console.log("Sheets:", workbook.SheetNames);

const sheetName = workbook.SheetNames[0]; // Or target a specific one
const sheet = workbook.Sheets[sheetName];
const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log(`\n--- Sheet 1: ${sheetName} ---`);
console.log("Row 1 (Header):", json[0]);
console.log("Row 2:", json[1]);
console.log("Row 3:", json[2]);
console.log("Row 4:", json[3]);
console.log("Row 5:", json[4]);
console.log("Row 6:", json[5]);
