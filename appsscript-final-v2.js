// ============================================
// 駐點人員回報系統 - 最終版 (Admin + 用戶分離)
// ============================================

const SHEET_ID = '1vHtsnEVw-Ji2xkZQpAE8dnMQCmsO5oh6c6QC-HTDSHY';

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || '';
  
  try {
    // 1. 讀取產品列表
    if (action === 'getProducts') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('Price');
      var result = [];
      if (sheet) {
        var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
        for (var i = 0; i < data.length; i++) {
          if (data[i][0]) {
            result.push({
              pn: String(data[i][0]).trim(),
              name: String(data[i][1] || '').trim(),
              price: String(data[i][4] || '').trim()
            });
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. 新增回報
    if (action === 'addReport') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報') || ss.insertSheet('回報');
      
      var uniqueId = new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
      var now = new Date().toISOString();
      
      // A:ID, B:時間, C:姓名, D:店名, E:PN, F:品名, G:價格, H:備註
      sheet.appendRow([uniqueId, now, p.name || '', p.store || '', p.pn || '', p.productName || '', p.price || '', p.note || '-']);
      
      return ContentService.createTextOutput(JSON.stringify({status: 'success', id: uniqueId})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Admin: 獲取所有報告
    if (action === 'getAllReports') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報');
      var today = new Date().toISOString().split('T')[0];
      var total = 0, count = 0, list = [];
      
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var time = String(data[i][1] || '');
          if (time.includes(today)) {
            var price = String(data[i][6] || '0').replace(/[^0-9.]/g, '');
            if (price) { total += parseFloat(price) || 0; count++; }
            list.push({
              id: String(data[i][0] || ''),
              time: time,
              name: String(data[i][2] || ''),
              store: String(data[i][3] || ''),
              pn: String(data[i][4] || ''),
              productName: String(data[i][5] || ''),
              price: String(data[i][6] || ''),
              note: String(data[i][7] || '')
            });
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({total: total, count: count, reports: list})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 4. 一般用戶: 獲取自己的報告
    if (action === 'getUserReports') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報');
      var today = new Date().toISOString().split('T')[0];
      var userName = p.name || '';
      var userStore = p.store || '';
      var total = 0, count = 0, list = [];
      
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var time = String(data[i][1] || '');
          var name = String(data[i][2] || '');
          var store = String(data[i][3] || '');
          
          // 只顯示今天的報告，並且是這個用戶的
          if (time.includes(today) && name === userName && store === userStore) {
            var price = String(data[i][6] || '0').replace(/[^0-9.]/g, '');
            if (price) { total += parseFloat(price) || 0; count++; }
            list.push({
              id: String(data[i][0] || ''),
              time: time,
              name: name,
              store: store,
              pn: String(data[i][4] || ''),
              productName: String(data[i][5] || ''),
              price: String(data[i][6] || ''),
              note: String(data[i][7] || '')
            });
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({total: total, count: count, reports: list})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 5. 刪除報告
    if (action === 'deleteReport') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報');
      var uniqueId = p.id || '';
      var userName = p.name || '';
      var userStore = p.store || '';
      
      if (sheet && uniqueId) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var id = String(data[i][0] || '');
          var name = String(data[i][2] || '');
          var store = String(data[i][3] || '');
          
          // 比對 ID + 姓名 + 店名
          if (id === uniqueId && name === userName && store === userStore) {
            sheet.deleteRow(i + 1);
            return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({error: '找不到或權限不足'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
    
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
