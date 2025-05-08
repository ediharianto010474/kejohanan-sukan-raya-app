
// This is an AppScript file that should be deployed as a Web App in Google Scripts
// connected to the Google Sheet with ID: 1XAUwcOptPtAEpheciNlBX7XsufBEnsxwyiaikO9hxWA

function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  if (action === 'read') {
    return getSheetData(sheet);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  const id = e.parameter.id;
  const dataStr = e.parameter.data;
  let data = null;
  
  if (dataStr) {
    data = JSON.parse(dataStr);
  }
  
  if (action === 'create') {
    return createRecord(sheet, data);
  } else if (action === 'update') {
    return updateRecord(sheet, id, data);
  } else if (action === 'delete') {
    return deleteRecord(sheet, id);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheetName) {
  try {
    const ss = SpreadsheetApp.openById('1XAUwcOptPtAEpheciNlBX7XsufBEnsxwyiaikO9hxWA');
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const jsonData = [];
    
    // Skip header row (i=1)
    for (let i = 1; i < data.length; i++) {
      const row = {};
      row.id = i; // Using row index as ID
      
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      
      jsonData.push(row);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: jsonData,
      headers: headers
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: e.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createRecord(sheetName, data) {
  try {
    const ss = SpreadsheetApp.openById('1XAUwcOptPtAEpheciNlBX7XsufBEnsxwyiaikO9hxWA');
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Create the sheet if it doesn't exist
      ss.insertSheet(sheetName);
      sheet = ss.getSheetByName(sheetName);
      
      // Create headers based on data keys
      const headers = Object.keys(data);
      sheet.appendRow(headers);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = [];
    
    for (let i = 0; i < headers.length; i++) {
      newRow.push(data[headers[i]] || '');
    }
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Record created successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: e.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateRecord(sheetName, id, data) {
  try {
    const ss = SpreadsheetApp.openById('1XAUwcOptPtAEpheciNlBX7XsufBEnsxwyiaikO9hxWA');
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rowIndex = parseInt(id) + 1; // +1 because row 1 is headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (data.hasOwnProperty(header)) {
        sheet.getRange(rowIndex, i + 1).setValue(data[header]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Record updated successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: e.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteRecord(sheetName, id) {
  try {
    const ss = SpreadsheetApp.openById('1XAUwcOptPtAEpheciNlBX7XsufBEnsxwyiaikO9hxWA');
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rowIndex = parseInt(id) + 1; // +1 because row 1 is headers
    sheet.deleteRow(rowIndex);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Record deleted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: e.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
