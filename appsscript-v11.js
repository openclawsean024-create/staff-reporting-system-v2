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
      
      var timestamp = new Date().toISOString();
      
      reportSheet.appendRow([
        timestamp,
        parameter.name || '',           // A: 時間戳記
        parameter.name || '',           // B: 姓名
        parameter.store || '',          // C: 店名
        parameter.pn || '',            // D: PN碼
        parameter.productName || '',   // E: 產品名稱
        parameter.price || '',         // F: 價格
        parameter.note || '-'          // G: 備註
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        timestamp: timestamp
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'deleteReport') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var reportSheet = spreadsheet.getSheetByName('回報');
      
      var name = parameter.name || '';
      var store = parameter.store || '';
      var pn = parameter.pn || '';
      var productName = parameter.productName || '';
      var price = parameter.price || '';
      
      if (reportSheet) {
        var data = reportSheet.getDataRange().getValues();
        
        for (var i = data.length - 1; i >= 1; i--) {
          var rowName = data[i][1] ? String(data[i][1]).trim() : '';  // 姓名
          var rowStore = data[i][2] ? String(data[i][2]).trim() : '';  // 店名
          var rowPN = data[i][3] ? String(data[i][3]).trim() : '';  // PN
          var rowProductName = data[i][4] ? String(data[i][4]).trim() : '';  // 產品名稱
          var rowPrice = data[i][5] ? String(data[i][5]).trim() : '';  // 價格
          
          if (rowName === name && rowStore === store && rowPN === pn && 
              rowProductName === productName && rowPrice === price) {
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
        debug: { name: name, store: store, pn: pn, productName: productName, price: price }
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
          var date = data[i][1] ? String(data[i][1]).trim() : '';  // 這是時間
          
          if (timestamp && (timestamp.includes(today) || date.includes(today))) {
            var price = data[i][5];
            if (price) {
              var priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ''));
              if (!isNaN(priceNum)) { totalSales += priceNum; count++; }
            }
            reports.push({
              rowNum: i + 1,
              timestamp: timestamp,
              date: date,
              name: data[i][1] ? String(data[i][1]).trim() : '',           // 姓名
              store: data[i][2] ? String(data[i][2]).trim() : '',         // 店名
              pn: data[i][3] ? String(data[i][3]).trim() : '',            // PN
              productName: data[i][4] ? String(data[i][4]).trim() : '',    // 產品名稱
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
