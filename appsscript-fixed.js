// ============================================
// 駐點人員回報系統 - Google Apps Script
// ============================================

// 請修改為你的 Google Sheet ID
const PRODUCTS_SPREADSHEET_ID = '1vHtsnEVw-Ji2xkZQpAE8dnMQCmsO5oh6c6QC-HTDSHY'; // 產品資料表
const REPORTS_SPREADSHEET_ID = '1KZpYIMTlrj0P0-WWVSSVp2D0xhDlmwXiaj2mT-CD5Do';  // 回報記錄表
const SHEET_NAME = '工作表1';  // 工作表名稱

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'getProducts') {
      // 讀取產品列表
      const sheet = SpreadsheetApp.openById(PRODUCTS_SPREADSHEET_ID).getSheetByName(SHEET_NAME);
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
      const sheet = SpreadsheetApp.openById(REPORTS_SPREADSHEET_ID).getSheetByName(SHEET_NAME);
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
