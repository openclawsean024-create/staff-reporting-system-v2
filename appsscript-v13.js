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
      
      var rowNum = reportSheet.getLastRow() + 1; // 取得即將寫入的行號
      
      reportSheet.appendRow([
        rowNum,                                           // A: 行號
        new Date().toISOString(),                         // B: ISO時間
        parameter.name || '',                             // C: 姓名
        parameter.store || '',                           // D: 店名
        parameter.pn || '',                              // E: PN
        parameter.productName || '',                     // F: 產品名稱
        parameter.price || '',                           // G: 價格
        parameter.note || '-'                            // H: 備註
      ]);
      return ContentService.createTextOutput(JSON.stringify({status: 'success', rowNum: rowNum})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 用行號刪除（最可靠）
    else if (action === 'deleteReport') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var reportSheet = spreadsheet.getSheetByName('回報');
      var rowNum = parseInt(parameter.rowNum);
      
      if (reportSheet && rowNum > 1) {
        reportSheet.deleteRow(rowNum);
        return ContentService.createTextOutput(JSON.stringify({status: 'success', deletedRow: rowNum})).setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify({error: '找不到'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'getDailySales') {
      var spreadsheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID);
      var reportSheet = spreadsheet.getSheetByName('回報');
      var today = new Date().toLocaleDateString('zh-TW');
      var totalSales = 0, count = 0, reports = [];
      
      if (reportSheet) {
        var data = reportSheet.getDataRange().getValues();
        
        for (var i = 1; i < data.length; i++) {
          var isoTime = data[i][1] ? String(data[i][1]).trim() : '';
          var date = data[i][2] ? String(data[i][2]).trim() : ''; // 備用日期
          
          // 用 ISO 時間或日期來過濾今天
          if (isoTime.includes('T') || (date && date.includes(today.replace(/\//g, '-')))) {
            var price = data[i][6];
            if (price) {
              var priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ''));
              if (!isNaN(priceNum)) { totalSales += priceNum; count++; }
            }
            reports.push({
              rowNum: data[i][0],  // 行號
              timestamp: isoTime || date,
              name: data[i][2] ? String(data[i][2]).trim() : '',
              store: data[i][3] ? String(data[i][3]).trim() : '',
              pn: data[i][4] ? String(data[i][4]).trim() : '',
              productName: data[i][5] ? String(data[i][5]).trim() : '',
              price: price,
              note: data[i][7] ? String(data[i][7]).trim() : ''
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
