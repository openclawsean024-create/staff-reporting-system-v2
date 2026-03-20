// ============================================
// 駐點人員回報系統 - Google Apps Script
// ============================================
// 複製以下所有程式碼，貼到 Google Sheet 的 Apps Script 中

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'getProducts') {
      // 讀取產品列表
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('工作表1');
      const data = sheet.getDataRange().getValues();
      const products = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
          products.push({
            pn: String(data[i][0]).trim(),
            name: data[i][1] ? String(data[i][1]).trim() : '',
            spec: data[i][2] ? String(data[i][2]).trim() : '',
            category: data[i][3] ? String(data[i][3]).trim() : ''
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify(products))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'addReport') {
      // 新增回報
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('工作表1');
      const timestamp = new Date().toLocaleString('zh-TW');
      
      sheet.appendRow([
        timestamp,
        e.parameter.name || '',
        e.parameter.store || '',
        e.parameter.pn || '',
        e.parameter.productName || '',
        e.parameter.note || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    else {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'ok',
        message: '駐點人員回報系統 API'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
