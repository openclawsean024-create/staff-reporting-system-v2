// 駐點人員回報系統 - 時區修正版
const SHEET_ID = '1vHtsnEVw-Ji2xkZQpAE8dnMQCmsO5oh6c6QC-HTDSHY';

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || '';
  
  try {
    if (action === 'getProducts') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('Price');
      var result = [];
      if (sheet) {
        var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
        for (var i = 0; i < data.length; i++) {
          if (data[i][0]) {
            result.push({pn: String(data[i][0]).trim(), name: String(data[i][1] || '').trim(), price: String(data[i][4] || '').trim()});
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'addReport') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報') || ss.insertSheet('回報');
      var uniqueId = new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
      // 使用台灣時區時間
      var taiwanTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString();
      sheet.appendRow([uniqueId, taiwanTime, p.name || '', p.store || '', p.pn || '', p.productName || '', p.price || '', p.note || '-']);
      return ContentService.createTextOutput(JSON.stringify({status: 'success', id: uniqueId})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getUserReports') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報');
      // 使用台灣時區的今天
      var now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
      var todayStr = now.toISOString().split('T')[0];
      var userName = p.name || '', userStore = p.store || '';
      var total = 0, count = 0, list = [];
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var time = String(data[i][1] || '');
          var name = String(data[i][2] || '');
          var store = String(data[i][3] || '');
          if (time.substring(0, 10) === todayStr && name === userName && store === userStore) {
            var price = String(data[i][6] || '0').replace(/[^0-9.]/g, '');
            if (price) { total += parseFloat(price) || 0; count++; }
            var timeObj = new Date(time);
            var timeStr = (timeObj.getMonth() + 1) + '/' + timeObj.getDate() + ' ' + timeObj.getHours().toString().padStart(2,'0') + ':' + timeObj.getMinutes().toString().padStart(2,'0');
            list.push({id: String(data[i][0]), time: timeStr, pn: String(data[i][4]), productName: String(data[i][5]), price: String(data[i][6]), note: String(data[i][7] || '')});
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({total: total, count: count, reports: list})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getAllReports') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報');
      var now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
      var todayStr = now.toISOString().split('T')[0];
      var total = 0, count = 0, list = [];
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var time = String(data[i][1] || '');
          if (time.substring(0, 10) === todayStr) {
            var price = String(data[i][6] || '0').replace(/[^0-9.]/g, '');
            if (price) { total += parseFloat(price) || 0; count++; }
            var timeObj = new Date(time);
            var timeStr = (timeObj.getMonth() + 1) + '/' + timeObj.getDate() + ' ' + timeObj.getHours().toString().padStart(2,'0') + ':' + timeObj.getMinutes().toString().padStart(2,'0');
            list.push({id: String(data[i][0]), time: timeStr, name: String(data[i][2]), store: String(data[i][3]), pn: String(data[i][4]), productName: String(data[i][5]), price: String(data[i][6]), note: String(data[i][7] || '')});
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({total: total, count: count, reports: list})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deleteReport') {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('回報');
      var uniqueId = p.id || '', userName = p.name || '', userStore = p.store || '';
      if (sheet && uniqueId) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][0]) === uniqueId && String(data[i][2]) === userName && String(data[i][3]) === userStore) {
            sheet.deleteRow(i + 1);
            return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({error: '權限不足'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
