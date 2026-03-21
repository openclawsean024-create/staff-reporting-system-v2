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
      var reportSheet = spreadsheet.getSheetByName('回報') || spreadsheet.insertSheet('回報');
      
      var timestamp = new Date().toISOString(); // 精確時間戳記
      
      reportSheet.appendRow([
        timestamp, parameter.name || '', parameter.store || '', parameter.pn || '', 
        parameter.productName || '', parameter.price || '', parameter.note || '-'
      ]);
      return ContentService.createTextOutput(JSON.stringify({status: 'success', timestamp: timestamp})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 簡化刪除：只用時間 + PN 比對
    else if (action === 'deleteReport') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var reportSheet = spreadsheet.getSheetByName('回報');
      
      var timestamp = parameter.timestamp || '';
      var pn = parameter.pn || '';
      
      if (reportSheet && timestamp && pn) {
        var data = reportSheet.getDataRange().getValues();
        
        // 從最後一筆往前找
        for (var i = data.length - 1; i >= 1; i--) {
          var rowTimestamp = data[i][0] ? String(data[i][0]).trim() : '';
          var rowPN = data[i][3] ? String(data[i][3]).trim() : '';
          
          // 比對時間 + PN
          if (rowTimestamp === timestamp && rowPN === pn) {
            reportSheet.deleteRow(i + 1);
            return ContentService.createTextOutput(JSON.stringify({
              status: 'success',
              deletedRow: i + 1
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        error: '找不到符合的記錄',
        debug: { timestamp: timestamp, pn: pn }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'getDailySales') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var reportSheet = spreadsheet.getSheetByName('回報');
      var today = new Date().toLocaleDateString('zh-TW');
      var totalSales = 0, count = 0, reports = [];
      
      if (reportSheet) {
        var data = reportSheet.getDataRange().getValues();
        
        for (var i = 1; i < data.length; i++) {
          var timestamp = data[i][0] ? String(data[i][0]).trim() : '';
          
          if (timestamp && timestamp.includes(today.replace(/\//g, '-'))) {
            var price = data[i][5];
            if (price) {
              var priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ''));
              if (!isNaN(priceNum)) { totalSales += priceNum; count++; }
            }
            
            reports.push({
              rowNum: i + 1,
              timestamp: timestamp,
              name: data[i][1] ? String(data[i][1]).trim() : '',
              store: data[i][2] ? String(data[i][2]).trim() : '',
              pn: data[i][3] ? String(data[i][3]).trim() : '',
              productName: data[i][4] ? String(data[i][4]).trim() : '',
              price: price,
              note: data[i][6] ? String(data[i][6]).trim() : ''
            });
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        date: today,
        totalSales: totalSales,
        count: count,
        reports: reports
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else {
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
