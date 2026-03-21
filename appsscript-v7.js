// ============================================
// 駐點人員回報系統 - Google Apps Script
// ============================================

// 請先打開產品資料表，從「擴充功能」開啟 Apps Script
// 這樣 getActiveSpreadsheet() 才能正確運作

function doGet(e) {
  e = e || {};
  var parameter = e.parameter || {};
  var action = parameter.action || '';
  
  try {
    if (action === 'getProducts') {
      // 使用 getActiveSpreadsheet() - 必須從 Sheet 開啟 Apps Script
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      var products = [];
      
      try {
        var sheets = spreadsheet.getSheets();
        for (var i = 0; i < sheets.length; i++) {
          var sheet = sheets[i];
          try {
            var lastRow = sheet.getLastRow();
            if (lastRow > 1) {
              var range = sheet.getRange(2, 1, lastRow - 1, 4);
              var data = range.getValues();
              for (var j = 0; j < data.length; j++) {
                if (data[j][0] && String(data[j][0]).trim() !== '') {
                  products.push({
                    pn: String(data[j][0]).trim(),
                    name: data[j][1] ? String(data[j][1]).trim() : '',
                    category: data[j][2] ? String(data[j][2]).trim() : '',
                    spec: data[j][3] ? String(data[j][3]).trim() : ''
                  });
                }
              }
            }
          } catch (sheetErr) { }
        }
      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({error: '無法讀取工作表: ' + err.toString()}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify(products))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'addReport') {
      // 新增回報到另一個 Google Sheet
      var reportsSpreadsheet = SpreadsheetApp.openById('1KZpYIMTlrj0P0-WWVSSVp2D0xhDlmwXiaj2mT-CD5Do');
      var sheet = reportsSpreadsheet.getSheetByName('回報');
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
