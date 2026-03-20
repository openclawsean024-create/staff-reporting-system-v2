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
      
      // 讀取 Price 工作表
      var sheet = spreadsheet.getSheetByName('Price');
      if (sheet) {
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
          for (var j = 0; j < data.length; j++) {
            if (data[j][0]) {
              products.push({
                pn: String(data[j][0]).trim(),
                name: data[j][1] ? String(data[j][1]).trim() : '',
                category: data[j][2] ? String(data[j][2]).trim() : '',
                spec: data[j][3] ? String(data[j][3]).trim() : '',
                price: data[j][4] ? String(data[j][4]).trim() : ''
              });
            }
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'addReport') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      
      // 寫入回報
      var reportSheet = spreadsheet.getSheetByName('回報') || spreadsheet.insertSheet('回報');
      
      // 取得價格
      var price = parameter.price || '';
      
      // 新增回報資料 (包含價格)
      reportSheet.appendRow([
        new Date().toLocaleString('zh-TW'),
        parameter.name || '',
        parameter.store || '',
        parameter.pn || '',
        parameter.productName || '',
        price,
        parameter.note || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        price: price
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'getDailySales') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var reportSheet = spreadsheet.getSheetByName('回報');
      
      var today = new Date().toLocaleDateString('zh-TW');
      var totalSales = 0;
      var count = 0;
      
      if (reportSheet) {
        var data = reportSheet.getDataRange().getValues();
        
        for (var i = 1; i < data.length; i++) {
          var date = data[i][0];
          if (date && date.toString().includes(today)) {
            var price = data[i][5]; // 價格欄位
            if (price) {
              var priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ''));
              if (!isNaN(priceNum)) {
                totalSales += priceNum;
                count++;
              }
            }
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        date: today,
        totalSales: totalSales,
        count: count
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else {
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
