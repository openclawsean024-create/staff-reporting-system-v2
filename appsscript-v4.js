// ============================================
// 駐點人員回報系統 - Google Apps Script
// ============================================

const PRODUCTS_SPREADSHEET_ID = '1vHtsnEVw-Ji2xkZQpAE8dnMQCmsO5oh6c6QC-HTDSHY';
const REPORTS_SPREADSHEET_ID = '1KZpYIMTlrj0P0-WWVSSVp2D0xhDlmwXiaj2mT-CD5Do';

function doGet(e) {
  // 確保 e 物件存在
  e = e || {};
  var parameter = e.parameter || {};
  var action = parameter.action || '';
  
  try {
    if (action === 'getProducts') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SPREADSHEET_ID);
      var sheetNames = ['KB', 'MICE', 'HS'];
      var products = [];
      
      sheetNames.forEach(function(sheetName) {
        try {
          var sheet = spreadsheet.getSheetByName(sheetName);
          if (sheet) {
            var data = sheet.getDataRange().getValues();
            for (var i = 1; i < data.length; i++) {
              if (data[i][0]) {
                products.push({
                  pn: String(data[i][0]).trim(),
                  name: data[i][1] ? String(data[i][1]).trim() : '',
                  spec: data[i][2] ? String(data[i][2]).trim() : '',
                  category: sheetName
                });
              }
            }
          }
        } catch(err) { }
      });
      
      return ContentService.createTextOutput(JSON.stringify(products))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'addReport') {
      var sheet = SpreadsheetApp.openById(REPORTS_SPREADSHEET_ID).getSheetByName('回報');
      sheet.appendRow([
        new Date().toLocaleString('zh-TW'),
        parameter.name || '',
        parameter.store || '',
        parameter.pn || '',
        parameter.productName || '',
        parameter.note || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    else {
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
