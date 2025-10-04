// Google Apps Script Code for Photography Contest Form
// Deploy this as a Web App

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Get current timestamp
    const timestamp = new Date();

    // Prepare the row data matching the header structure:
    // Name Bengali | Name English | Category | Email | Phone Number | Whatsapp Number | Institution | Class | Image 1 | Image 2 | Image 3 | Timestamp
    const rowData = [
      data.nameBengali || '',
      data.nameEnglish || '',
      data.category || '',
      data.email || '',
      data.phoneNumber || '',
      data.whatsappNumber || '',
      data.institution || '',
      data.class || '',
      data.image1 || '',
      data.image2 || '',
      data.image3 || '',
      timestamp
    ];

    // Append the row to the sheet
    sheet.appendRow(rowData);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'success', message: 'Data added successfully' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Handle GET requests for testing
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ message: 'Photography Contest API is running!' })
  ).setMimeType(ContentService.MimeType.JSON);
}
