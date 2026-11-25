/**
 * TA'MEER-E-REKHTA (تعمیرِ ریختہ)
 * Google Apps Script for Volunteer Registration Google Sheet Integration
 * 
 * Target Sheet:
 * https://docs.google.com/spreadsheets/d/1yClRjr457V5H5KAIdH_DbbrcrKGshCZdc4bz6sUbffw/edit?gid=0#gid=0
 * 
 * HOW TO INSTALL (Takes 1 Minute):
 * 1. Open your Google Sheet in a browser:
 *    https://docs.google.com/spreadsheets/d/1yClRjr457V5H5KAIdH_DbbrcrKGshCZdc4bz6sUbffw/edit?gid=0#gid=0
 * 2. In the top menu, click: Extensions > Apps Script
 * 3. Delete any default code in the editor, and paste this entire script.
 * 4. Click the "Save" icon (or Ctrl + S).
 * 5. (Optional) Run "setupHeaders" once to generate the styled columns immediately.
 * 6. Click the blue "Deploy" button (top-right) > "New deployment".
 * 7. Click the gear icon (Select type) > choose "Web app".
 * 8. Set:
 *    - Description: "Ta'meer-e-Rekhta Volunteer Webhook"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"
 * 9. Click "Deploy", authorize permissions if prompted.
 * 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 11. Paste this URL into your .env file:
 *     GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 */

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  var headers = [
    "Timestamp",
    "Full Name",
    "Email Address",
    "Phone / WhatsApp",
    "Instagram ID",
    "City",
    "Age",
    "Area of Interest",
    "Motivation / Why Join"
  ];
  
  if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() === "") {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0D5C3A"); // Ta'meer-e-Rekhta Brand Emerald
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 36);
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Auto-fit column widths
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    setupHeaders();
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = data.timestamp || new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
    var fullName = data.fullName || "";
    var email = data.email || "";
    var phone = data.phone || "";
    var instagramId = data.instagramId || "";
    var city = data.city || "";
    var age = data.age || "";
    var areaOfInterest = data.areaOfInterest || "";
    var motivation = data.motivation || "";
    
    var newRow = [
      timestamp,
      fullName,
      email,
      phone,
      instagramId,
      city,
      age,
      areaOfInterest,
      motivation
    ];
    
    sheet.appendRow(newRow);
    
    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, newRow.length);
    rowRange.setFontSize(10);
    rowRange.setVerticalAlignment("middle");
    
    // Zebra striping for easy reading
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#F9FBFA");
    } else {
      rowRange.setBackground("#FFFFFF");
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Volunteer application successfully added to Google Sheet.",
        row: lastRow
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  setupHeaders();
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "active",
      message: "Ta'meer-e-Rekhta Volunteer Sheet Service is live and ready."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

