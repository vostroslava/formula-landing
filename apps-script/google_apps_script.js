/**
 * Google Apps Script для приёма заявок с лендингов «Теремок» и «Формула»
 * Поддерживает FormData и JSON форматы
 * 
 * Инструкция:
 * 1. Откройте вашу Google Таблицу
 * 2. Расширения → Apps Script
 * 3. Удалите старый код и вставьте этот
 * 4. Нажмите "Развернуть" → "Управление развертываниями"
 * 5. Создайте новую версию или обновите существующую
 * 6. URL развертывания должен быть тот же (если обновляете)
 */

const SHEET_NAME = 'Лиды';

function doPost(e) {
    try {
        let data = {};

        // Обработка FormData (с сайта через форму)
        if (e.parameter && Object.keys(e.parameter).length > 0) {
            data = e.parameter;
        }
        // Обработка JSON (если придёт)
        else if (e.postData && e.postData.contents) {
            try {
                data = JSON.parse(e.postData.contents);
            } catch (jsonErr) {
                data = {};
            }
        }

        const sheet = getOrCreateSheet();
        const timestamp = new Date();

        // Источник: 'Лид Формула' или 'Лид Теремок' (по умолчанию Теремок)
        const source = data.source || 'Лид Теремок';

        const row = [
            timestamp,
            source,
            data.name || '',
            data.phone || '',
            data.company || '',
            data.position || '',
            'Новый'
        ];

        sheet.appendRow(row);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, message: 'Заявка принята' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'OK', message: 'Скрипт работает' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        const headers = ['Дата/время', 'Источник', 'Имя', 'Телефон', 'Компания', 'Должность', 'Статус'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setBackground('#4a90d9').setFontColor('#ffffff').setFontWeight('bold');
        sheet.setFrozenRows(1);
    }
    return sheet;
}

function testScript() {
    const testFormula = {
        parameter: {
            name: 'Тест Формула',
            phone: '+375291234567',
            company: 'Компания',
            source: 'Лид Формула'
        }
    };
    const result = doPost(testFormula);
    Logger.log(result.getContent());
}
