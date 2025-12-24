function doPost(e) {
    // Логирование входящих параметров (для отладки в Google Apps Script)
    Logger.log(JSON.stringify(e.parameter));

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // Первая вкладка

    // Собираем данные в порядке колонок таблицы
    var data = [
        new Date(),                           // A: Дата и время
        e.parameter.name || '',     // B: Имя
        e.parameter.company || '',     // C: Компания
        e.parameter.phone || '',     // D: Телефон

        // Результаты теста
        e.parameter.test_main_type || '',     // E: Основной типаж (код)
        e.parameter.test_main_text || '',     // F: Результат (текст)
        e.parameter.test_ptica || 0,      // G: Баллы Птица
        e.parameter.test_homiak || 0,      // H: Баллы Хомяк
        e.parameter.test_lisa || 0,      // I: Баллы Лиса
        e.parameter.test_profi || 0,      // J: Баллы Профи
        e.parameter.test_volk || 0,      // K: Баллы Волк (Новое)
        e.parameter.test_medved || 0       // L: Баллы Медведь (Новое)
    ];

    // Добавляем строку
    sheet.appendRow(data);

    // Возвращаем простой HTML ответ
    var html = '<html><body style="font-family:sans-serif;">' +
        '<h2>Success</h2>' +
        '</body></html>';

    return HtmlService
        .createHtmlOutput(html)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
