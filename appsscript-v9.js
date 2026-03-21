// ============================================
// 駐點人員回報系統 - Google Apps Script
// ============================================

const PRODUCTS_SHEET_ID = '1vHtsnEVw-Ji2xkZQpAE8dnMQCmsO5oh6c6QC-HTDSHY';

function doGet(e) {
  e = e || {};
  var parameter = e.parameter || {};
  var action = parameter.action || '';
  
  try {
    if (action === 'getProducts') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var products = [];
      var sheets = spreadsheet.getSheets();
      
      for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var sheetName = sheet.getName();
        
        // 跳過「回報」工作表
        if (sheetName === '回報') continue;
        
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          var data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
          for (var j = 0; j < data.length; j++) {
            if (data[j][0]) {
              products.push({
                pn: String(data[j][0]).trim(),
                name: data[j][1] ? String(data[j][1]).trim() : '',
                category: data[j][2] ? String(data[j][2]).trim() : '',
                spec: data[j][3] ? String(data[j][3]).trim() : ''
              });
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'addReport') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      
      // 直接嘗試取得或建立回報工作表
      var sheetName = '回報';
      var sheets = spreadsheet.getSheets();
      var sheet = null;
      
      // 檢查是否已有回報工作表
      for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getName() === sheetName) {
          sheet = sheets[i];
          break;
        }
      }
      
      // 如果沒有，就用最後一個工作表或建立新的
      if (!sheet) {
        try {
          sheet = spreadsheet.insertSheet(sheetName);
        } catch (e) {
          // 如果建立失敗，使用第一個工作表
          sheet = sheets[0];
        }
      }
      
      // 新增資料
      sheet.appendRow([
        new Date().toLocaleString('zh-TW'),
        parameter.name || '',
        parameter.store || '',
        parameter.pn || '',
        parameter.productName || '',
        parameter.note || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: '資料已寫入',
        sheetName: sheet.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else {
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
