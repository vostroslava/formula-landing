

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYpyOj61Uprd946DeO4KUdPvbNpwLPpSU8jfhzlKOrm6zofhMECjIwTNXb3pZ2Yus62w/exec";

function isValidScriptUrl(url) {
    return typeof url === "string" &&
        url.startsWith("https://script.google.com/macros/s/") &&
        url.endsWith("/exec") &&
        !url.includes("...") &&
        url.length > 80;
}

let leadData = null;
let testSubmitted = false;

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn');

    const isOpen = navLinks.classList.contains('open');

    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn');

    navLinks.classList.add('open');
    overlay.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn');

    navLinks.classList.remove('open');
    overlay.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Click outside menu to close
document.addEventListener('click', function (e) {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    // Если меню открыто И клик был не по меню и не по кнопке
    if (navLinks && navLinks.classList.contains('open')) {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// ===== END MOBILE MENU =====


// Управление скроллом страницы в зависимости от открытых модал
function adjustBodyScroll() {
    const lead = document.getElementById('leadModal');
    const test = document.getElementById('testModal');
    const privacy = document.getElementById('privacyModal');

    const anyOpen = [lead, test, privacy].some(m => m && m.classList.contains('open'));

    if (anyOpen) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open'); // Prevent iOS bounce
    } else {
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }
}

// Открыть модал заявки
function openLeadModal(source) {
    const modal = document.getElementById('leadModal');
    if (!modal) return;

    modal.classList.add('open');

    const banner = document.getElementById('testAccessBanner');
    if (banner) {
        banner.style.display = (source === 'test') ? 'block' : 'none';
    }

    adjustBodyScroll();
}

// Закрыть модал заявки
function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Открыть модал с тестом
function openTestModal() {
    const modal = document.getElementById('testModal');
    if (!modal) return;

    modal.classList.add('open');
    adjustBodyScroll();

    // ALWAYS Start new test (Fix: User reports skipping to result)
    // We ignore localStorage history to allow retakes
    currentQuestionIndex = 0;
    userAnswers = {};

    const container = document.getElementById('testContainer');
    const resultContainer = document.getElementById('testResultContainer');
    const nextStep = document.getElementById('testNextStep');
    const telegramBlock = document.getElementById('testTelegramBlock');

    if (container) container.style.display = 'block';
    if (resultContainer) resultContainer.style.display = 'none';
    if (nextStep) nextStep.style.display = 'none';
    if (telegramBlock) telegramBlock.style.display = 'none';

    renderQuestion();
}

// Закрыть модал теста
function closeTestModal() {
    const modal = document.getElementById('testModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Открыть модал политики конфиденциальности
function openPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.add('open');
    adjustBodyScroll();
}

// Закрыть модал политики конфиденциальности
function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}


// Логика Test 2.0
const testQuestions = [
    {
        id: 'q1',
        text: '1. Как он обычно реагирует на новую сложную задачу?',
        options: [
            { value: 'ptica', text: 'Тянет время, ждет напоминаний, сам не уточняет детали.' },
            { value: 'homiak', text: 'Сначала спрашивает, что получит лично он (бонус, доплату).' },
            { value: 'lisa', text: 'Интересуется, кто увидит результат, как это выглядит для руководства.' },
            { value: 'profi', text: 'Уточняет детали, сроки, критерии качества и спокойно берётся за дело.' },
            { value: 'volk', text: 'Оценивает, как это можно использовать для усиления своего влияния или ресурсов.' },
            { value: 'medved', text: 'Ворчит: «Опять что-то придумали», и делает так, как привык и считает правильным.' },
            { value: 'krysa', text: 'Избегает ответственности, ищет на кого можно переложить вину в случае неудачи.' }
        ]
    },
    {
        id: 'q2',
        text: '2. Как он ведёт себя под жестким контролем?',
        options: [
            { value: 'ptica', text: 'Начинает шевелиться, но без энтузиазма. Нужен постоянный пинок.' },
            { value: 'homiak', text: 'Делает ровно столько, сколько требуют, ни шагу больше.' },
            { value: 'lisa', text: 'Изображает бурную деятельность, чтобы отчеты выглядели идеально.' },
            { value: 'profi', text: 'Контроль воспринимает нормально, если он по делу. Держит качество.' },
            { value: 'volk', text: 'Сопротивляется, агрессирует, пытается установить свои правила игры.' },
            { value: 'medved', text: 'Игнорирует контроль, считая, что его опыт важнее указаний.' },
            { value: 'krysa', text: 'Внешне соглашается, но за спиной саботирует и обсуждает решения руководства.' }
        ]
    },
    {
        id: 'q3',
        text: '3. Поведение в конфликте (с клиентом или коллегой)?',
        options: [
            { value: 'ptica', text: 'Уходит от ответственности, переводит стрелки, прячется.' },
            { value: 'homiak', text: 'Защищает свои интересы и кошелек, остальное не волнует.' },
            { value: 'lisa', text: 'Думает о репутации, манипулирует фактами, чтобы выйти сухим из воды.' },
            { value: 'profi', text: 'Ищет решение проблемы, чтобы сохранить результат и отношения.' },
            { value: 'volk', text: 'Переходит в наступление, давит авторитетом, стремится победить любой ценой.' },
            { value: 'medved', text: 'Уходит в глухую оборону: «Я прав, а вы ничего не понимаете».' },
            { value: 'krysa', text: 'Стравливает стороны конфликта, чтобы ослабить конкурента чужими руками.' }
        ]
    },
    {
        id: 'q4',
        text: '4. Отношение к обучению и нововведениям?',
        options: [
            { value: 'ptica', text: 'Избегает, саботирует, «мне это не нужно».' },
            { value: 'homiak', text: '«Если за это заплатят или дадут диплом, который можно продать — пойду».' },
            { value: 'lisa', text: 'Учится, чтобы щеголять умными словами и казаться экспертом.' },
            { value: 'profi', text: 'Изучает то, что помогает работать эффективнее и давать лучший результат.' },
            { value: 'volk', text: 'Использует новые знания как оружие для укрепления власти.' },
            { value: 'medved', text: 'Критикует: «Это ерунда, старые методы работали лучше». Саботирует.' },
            { value: 'krysa', text: 'Ищет уязвимости в новом, чтобы повернуть ситуацию в свою пользу.' }
        ]
    },
    {
        id: 'q5',
        text: '5. О чем чаще всего говорит в курилке/на обеде?',
        options: [
            { value: 'ptica', text: 'Жалобы: «Как я устал», «Много требуют», «Скорее бы пятница».' },
            { value: 'homiak', text: 'Деньги: «Где дешевле», «Мало платят», «Вон там бонусы больше».' },
            { value: 'lisa', text: 'Интриги: «Кто с кем», «Кого повысили», обсуждение статуса.' },
            { value: 'profi', text: 'Работа: Идеи, решения задач, профессиональные темы.' },
            { value: 'volk', text: 'Критика руководства, обсуждение «своих» и «чужих», планы захвата.' },
            { value: 'medved', text: 'Воспоминания: «Вот раньше было время...», поучения молодежи.' },
            { value: 'krysa', text: 'Сплетни, «секреты», обсуждение чужих промахов и недостатков.' }
        ]
    },
    {
        id: 'q6',
        text: '6. Реакция на дополнительную ответственность?',
        options: [
            { value: 'ptica', text: 'Паника или тихий саботаж. «Это не входит в мои обязанности».' },
            { value: 'homiak', text: '«Сколько за это доплатят? Нет денег — нет работы».' },
            { value: 'lisa', text: 'Берет, если это даст власть, статус или доступ к «телу» шефа.' },
            { value: 'profi', text: 'Берет, если это нужно для дела и развития.' },
            { value: 'volk', text: 'Хватает полномочия, но не всегда готов отвечать за последствия.' },
            { value: 'medved', text: 'Отказывается: «Мне и своего хватает, отстаньте».' },
            { value: 'krysa', text: 'Уклоняется или берет только ту часть, которая дает доступ к информации.' }
        ]
    },
    {
        id: 'q7',
        text: '7. Как работает, когда руководитель в отпуске (нет контроля)?',
        options: [
            { value: 'ptica', text: 'Работа встает. ИБД (имитация бурной деятельности) или безделье.' },
            { value: 'homiak', text: 'Делает минимум, чтобы не уволили. Уходит домой ровно в 18:00.' },
            { value: 'lisa', text: 'Плетет интриги, занимается самопиаром, налаживает связи.' },
            { value: 'profi', text: 'Работает так же, как и всегда. Сам себе контролер.' },
            { value: 'volk', text: 'Начинает устанавливать свои порядки, подминает процессы под себя.' },
            { value: 'medved', text: 'Работает в своем темпе, игнорируя общие дедлайны и правила.' },
            { value: 'krysa', text: 'Распускает слухи, дезорганизует работу, подрывает авторитет зама.' }
        ]
    },
    {
        id: 'q8',
        text: '8. Что является главной мотивацией?',
        options: [
            { value: 'ptica', text: 'Спокойствие и отсутствие наказаний.' },
            { value: 'homiak', text: 'Деньги и материальные блага.' },
            { value: 'lisa', text: 'Признание, похвала, статус, карьера.' },
            { value: 'profi', text: 'Интерес к делу, профессиональный вызов, результат.' },
            { value: 'volk', text: 'Власть, влияние, контроль над ресурсами и людьми.' },
            { value: 'medved', text: 'Независимость, стабильность, уважение опыта.' },
            { value: 'krysa', text: 'Выживание любой ценой и устранение потенциальных конкурентов.' }
        ]
    },
    {
        id: 'q9',
        text: '9. Реакция на совершенную ошибку?',
        options: [
            { value: 'ptica', text: 'Прячет концы в воду, надеется, что не заметят. Если нашли — винит обстоятельства.' },
            { value: 'homiak', text: '«Ну, вы же мало платите, вот и качество такое». Не чувствует вины.' },
            { value: 'lisa', text: 'Мастерски оправдывается, находит козла отпущения: «Меня подвели».' },
            { value: 'profi', text: 'Признает, анализирует причины, предлагает вариант исправления.' },
            { value: 'volk', text: 'Агрессивно защищается, нападает в ответ: «Это не ошибка, это стратегия!»' },
            { value: 'medved', text: 'Отрицает: «Я лучше знаю, как надо. Это у вас стандарты неправильные».' },
            { value: 'krysa', text: 'Сваливает вину на других, подтасовывает факты, чтобы выйти сухим.' }
        ]
    },
    {
        id: 'q10',
        text: '10. Роль в команде?',
        options: [
            { value: 'ptica', text: 'Балласт. Требует постоянного микроменеджмента.' },
            { value: 'homiak', text: 'Наемник. Лоялен только пока платят.' },
            { value: 'lisa', text: 'Политик. Создает альянсы, но думает только о себе.' },
            { value: 'profi', text: 'Локомотив. Тянет на себе сложные задачи и результат.' },
            { value: 'volk', text: 'Неформальный лидер. Может увести команду за собой.' },
            { value: 'medved', text: 'Отшельник. Работает сам по себе, трудно интегрируется.' },
            { value: 'krysa', text: 'Серый кардинал. Вносит разлад и управляет через интриги.' }
        ]
    }
];

let currentQuestionIndex = 0;
let userAnswers = {};

function renderQuestion() {
    const container = document.getElementById('testQuestionCard');
    const progressBar = document.getElementById('testProgressBar');

    if (!container || !progressBar) return;

    const question = testQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / testQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    let html = `<h3>${question.text}</h3><div class="test-options">`;

    question.options.forEach(opt => {
        html += `<button class="test-option-btn" onclick="handleAnswer('${opt.value}')">
            ${opt.text}
        </button>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function handleAnswer(value) {
    userAnswers[testQuestions[currentQuestionIndex].id] = value;
    currentQuestionIndex++;

    if (currentQuestionIndex < testQuestions.length) {
        renderQuestion();
    } else {
        finishTest();
    }
}

function finishTest() {
    const progressBar = document.getElementById('testProgressBar');
    if (progressBar) progressBar.style.width = '100%';

    // Calculate Result
    // Calculate Result
    const scores = { ptica: 0, homiak: 0, lisa: 0, profi: 0, volk: 0, medved: 0, krysa: 0 };
    Object.values(userAnswers).forEach(val => {
        if (scores[val] !== undefined) scores[val]++;
    });

    let maxScore = -1;
    let resultType = 'profi'; // default
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            resultType = type;
        }
    }

    showDetailedResult(resultType);

    // Save completion status
    localStorage.setItem('teremok_test_completed', 'true');
    localStorage.setItem('teremok_test_result', resultType);

    // Send to Google Sheet
    sendToGoogleSheet(resultType, scores, `Test 2.0 Result: ${resultType}`);
}

function showDetailedResult(type) {
    const container = document.getElementById('testContainer');
    const resultContainer = document.getElementById('testResultContainer');
    const telegramBlock = document.getElementById('testTelegramBlock');

    if (container) container.style.display = 'none';
    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = getResultHTML(type);
    }
    if (telegramBlock) telegramBlock.style.display = 'flex';
}

function getResultHTML(type) {
    const content = {
        ptica: {
            icon: '🐦',
            title: 'Птица',
            subtitle: 'Мотивация: Принуждение',
            desc: 'Сотрудник, который работает эффективно только под жестким контролем. Избегает ответственности и инициативы.',
            risks: 'Главный риск — руководитель тратит 80% времени на контроль Птицы, вместо развития бизнеса. Если ослабить хватку, работа встанет.',
            advice: 'Стратегия «Подрезать крылья». Не давайте им «летать» где вздумается. Четкие инструкции, жесткие дедлайны и неотвратимость наказания. Либо создайте условия, где они вынуждены работать, либо прощайтесь.'
        },
        homiak: {
            icon: '🐹',
            title: 'Хомяк',
            subtitle: 'Мотивация: Выгода (Деньги)',
            desc: 'Рассматривает работу исключительно как источник ресурсов. Лоялен не компании, а своему кошельку.',
            risks: 'Легко уйдет к конкурентам за небольшую прибавку. Может торговаться за каждый шаг. Ненадежен в кризис.',
            advice: 'Стратегия «Субсидиарная ответственность». Привязывайте их доход к результатам команды, чтобы они начали видеть других. Не позволяйте шантажировать себя. Четкий KPI: сделал — получил.'
        },
        lisa: {
            icon: '🦊',
            title: 'Лиса',
            subtitle: 'Мотивация: Личная выгода (Статус)',
            desc: 'Ориентирован на власть, влияние и статус. Мастер создавать видимость работы. Хорошо выглядит на совещаниях, умеет презентовать себя.',
            risks: 'Может заботиться больше о форме, чем о содержании. Перекладывает рутинную работу на других.',
            advice: 'Стратегия «Внутренняя конкуренция и PR». Дайте возможность блистать, но требуйте измеримых результатов. Используйте их навыки презентации во благо компании.'
        },
        profi: {
            icon: '🦁',
            title: 'Профи',
            subtitle: 'Мотивация: Результат / Интерес',
            desc: 'Сотрудник, который болеет за дело. Берет ответственность, держит качество, ищет решения.',
            risks: 'Риск выгорания, так как часто тащит на себе работу за Птиц и Лис. Может уйти, если не видит смысла или уважения.',
            advice: 'Стратегия «Партнерство и Защита». Оградите их от бюрократии и токсичных коллег. Дайте интересные задачи и свободу действий. Признавайте их экспертность публично.'
        },
        volk: {
            icon: '🐺',
            title: 'Волк',
            subtitle: 'Мотивация: Власть',
            desc: 'Лидер «своей стаи». Живет по своим правилам, ориентирован на захват ресурсов и доминирование. Эффективен в кризис, но опасен для авторитета руководителя.',
            risks: 'Может увести команду, саботировать решения руководства или открыть свой бизнес на вашей базе. Неуправляем, если не чувствует силы.',
            advice: 'Стратегия «Договор и Границы». Четко обозначьте территорию и правила. Дайте ему ресурсы и задачи «на захват», но держите руку на пульсе. Будьте для него авторитетом.'
        },
        medved: {
            icon: '🐻',
            title: 'Медведь',
            subtitle: 'Мотивация: Независимость',
            desc: 'Опытный одиночка или «старожил». Работает по своим устоям, игнорирует новые правила. Ценит свой комфорт и статус неприкасаемого.',
            risks: 'Главный тормоз изменений. Саботирует внедрение нового, токсичен для новичков ("мы всегда так делали").',
            advice: 'Стратегия «Уважение и Автономия». Не пытайтесь его переделать. Советуйтесь с ним, подчеркивайте его опыт. Дайте ему обособленный участок работы, где он никому не мешает.'
        },
        krysa: {
            icon: '🐀',
            title: 'Крыса',
            subtitle: 'Мотивация: Выживание',
            desc: 'Токсичный интриган, действует исподтишка: подставляет, искажает факты, стравливает людей и разрушает доверие.',
            risks: 'Падает скорость и качество из-за конфликтов. Уходят Профи и сильные исполнители. Руководитель теряет контроль над реальной картиной.',
            advice: 'Стратегия «Прозрачность и ответственность»: Только факты (фиксация письменно), нулевая терпимость к интригам, разделить влияние (не давать монополию). Если не меняется — прощаться.'
        }
    };

    const data = content[type] || content.profi;

    return `
        <div class="result-card">
            <div class="result-header">
                <span class="result-icon">${data.icon}</span>
                <h2 class="result-title">${data.title}</h2>
                <p class="result-subtitle">${data.subtitle}</p>
            </div>
            
            <div class="result-section">
                <h4>Диагноз</h4>
                <p>${data.desc}</p>
            </div>

            <div class="result-warning">
                <h4>⚠️ Риски для бизнеса</h4>
                <p>${data.risks}</p>
            </div>

            <div class="result-advice">
                <h4>💡 Как управлять</h4>
                <p>${data.advice}</p>
            </div>
        </div>
    `;
}

// Отправка данных в Google Script
async function sendToGoogleSheet(mainType, types, resultText) {
    const fd = new FormData();

    // Fix: Access global variable set by integration.js if local is null
    const data = window.leadData || leadData;

    // Источник для различения лидов в таблице
    fd.append('source', 'Лид Формула');

    if (data) {
        fd.append('name', data.name || '');
        fd.append('company', data.company || '');
        fd.append('phone', data.phone || '');
    } else {
        fd.append('name', '');
        fd.append('company', '');
        fd.append('phone', '');
    }

    fd.append('test_main_type', mainType || '');
    fd.append('test_main_text', resultText || '');
    // Ensure types is object before accessing
    const safeTypes = types || {};
    fd.append('test_ptica', safeTypes.ptica || 0);
    fd.append('test_homiak', safeTypes.homiak || 0);
    fd.append('test_lisa', safeTypes.lisa || 0);
    fd.append('test_profi', safeTypes.profi || 0);
    fd.append('test_volk', safeTypes.volk || 0);
    fd.append('test_medved', safeTypes.medved || 0);
    fd.append('test_krysa', safeTypes.krysa || 0);

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: fd,
            mode: 'no-cors'
        });
        // Success (opaque)
        return true;
    } catch (err) {
        console.error('Ошибка отправки в Google Script', err);
        throw err;
    }
}

// Константа для Telegram
const TELEGRAM_URL = 'https://t.me/stalkermedia1';

/*
// Управление полем Telegram в форме
function toggleMessengerField() {
    const messengerSelect = document.getElementById('messenger');
    const telegramGroup = document.getElementById('telegram-field-group');
    const phoneInput = document.getElementById('phone');
    const phoneLabel = document.querySelector('label[for="phone"]');

    if (!messengerSelect || !telegramGroup) return;

    if (messengerSelect.value === 'telegram') {
        telegramGroup.style.display = 'block';
    } else {
        telegramGroup.style.display = 'none';
    }
}
*/

// Инициализация полоски отсчёта времени до мероприятия
function initEventCountdown() {
    const textEl = document.getElementById('eventCountdownText');
    const barEl = document.getElementById('eventCountdownFill');

    // Если элементов нет, значит DOM не готов или их нет на странице
    if (!textEl || !barEl) return;

    // 21 января 2026, 10:00 — локальное время
    const eventStart = new Date(2026, 0, 21, 10, 0, 0); // Месяцы в JS с 0 (0 = Январь)
    const windowMs = 30 * 24 * 60 * 60 * 1000; // 30 дней до события как "полная шкала"

    function formatUnit(value, forms) {
        const v = Math.abs(value) % 100;
        const v1 = v % 10;
        if (v > 10 && v < 20) return value + ' ' + forms[2];
        if (v1 > 1 && v1 < 5) return value + ' ' + forms[1];
        if (v1 === 1) return value + ' ' + forms[0];
        return value + ' ' + forms[2];
    }

    function updateCountdown() {
        const now = new Date();
        let diff = eventStart - now;

        if (diff <= 0) {
            textEl.textContent = 'мероприятие уже началось или прошло';
            barEl.style.width = '100%';
            barEl.setAttribute('aria-valuenow', '100');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * 1000 * 60 * 60 * 24;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor(diff / 1000); // Если нужно, можно добавить секунды

        let parts = [];
        if (days > 0) {
            parts.push(formatUnit(days, ['день', 'дня', 'дней']));
        }
        if (hours > 0) {
            parts.push(formatUnit(hours, ['час', 'часа', 'часов']));
        }
        // Показываем минуты, если дней мало или их вообще нет
        if (days < 3 && minutes > 0) {
            parts.push(formatUnit(minutes, ['минута', 'минуты', 'минут']));
        }

        textEl.textContent = parts.length ? parts.join(' ') : 'меньше минуты';

        let remainingForWindow = eventStart - now;
        if (remainingForWindow > windowMs) {
            remainingForWindow = windowMs;
        }
        if (remainingForWindow < 0) {
            remainingForWindow = 0;
        }

        const percent = 100 - (remainingForWindow / windowMs) * 100;
        const clamped = Math.max(0, Math.min(100, percent));

        barEl.style.width = clamped.toFixed(0) + '%';
        barEl.setAttribute('aria-valuenow', clamped.toFixed(0));
    }

    updateCountdown();
    // Обновляем чаще, чтобы было видно жизнь (раз в секунду)
    setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', function () {
    // 1. Замена всех Telegram ссылок
    const telegramLinks = document.querySelectorAll('a[href*="t.me"]');
    telegramLinks.forEach(link => {
        link.href = TELEGRAM_URL;
    });

    // 2. Инициализация таймера
    initEventCountdown();

    // 3. Закрытие модалок по Escape
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;

        const privacy = document.getElementById('privacyModal');
        const test = document.getElementById('testModal');
        const lead = document.getElementById('leadModal');

        // Сначала закрываем верхнее окно политики, если оно открыто
        if (privacy && privacy.classList.contains('open')) {
            closePrivacyModal();
            return;
        }

        // Потом — окно с тестом
        if (test && test.classList.contains('open')) {
            closeTestModal();
            return;
        }

        // И только потом — окно регистрации
        if (lead && lead.classList.contains('open')) {
            closeLeadModal();
        }
    });

    const animated = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window && animated.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animated.forEach(el => observer.observe(el));
    } else {
        animated.forEach(el => el.classList.add('in-view'));
    }


    // Testimonials & experts accordion
    const testimonialHeaders = document.querySelectorAll('.testimonial-header');
    testimonialHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const item = header.closest('.testimonial-item');
            const isOpen = item.classList.contains('open');

            document.querySelectorAll('.testimonial-item.open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                }
            });

            if (!isOpen) {
                item.classList.add('open');
            } else {
                item.classList.remove('open');
            }
        });
    });

    // FAQ Accordion (Matched Logic)
    const faqHeaders = document.querySelectorAll('.faq-header');
    faqHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const item = header.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Close others if you want strict accordion, else optional.
            // User screenshot implies accordion.
            document.querySelectorAll('.faq-item.open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                }
            });

            if (!isOpen) {
                item.classList.add('open');
            } else {
                item.classList.remove('open');
            }
        });
    });

    // Mobile menu close on link click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                closeMobileMenu();
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 400);
            }
        });
    });
});


// ===== CONTACT FORM HANDLING (Migrated from integration.js) =====

async function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('formStatus');
    const originalText = submitBtn.textContent;

    // 1. Validate Script URL
    if (!isValidScriptUrl(SCRIPT_URL)) {
        console.error('Invalid SCRIPT_URL configuration:', SCRIPT_URL);
        if (statusEl) {
            statusEl.textContent = "Форма временно недоступна. Сообщите менеджеру: не настроен SCRIPT_URL.";
            statusEl.className = "form-status error";
        }
        return; // Stop submission
    }

    // UI: Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    if (statusEl) {
        statusEl.textContent = "Отправляем...";
        statusEl.className = "form-status";
    }

    // Collect Data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Store globally
    window.leadData = {
        name: data.name || '',
        company: data.company || '',
        phone: data.phone || ''
    };

    if (typeof leadData !== 'undefined') {
        leadData = window.leadData;
    }

    try {
        // Send initial registration
        await sendToGoogleSheet('', {}, 'Регистрация (начало)');

        // Success: Replace form with video and confirmation
        const successHTML = `
            <div class="success-next-steps">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                <h3 class="success-title">Вы зарегистрированы!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Мы свяжемся с вами для подтверждения участия.
                </p>
                
                <p style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 1rem;">
                    Пока посмотрите короткое видео о методике:
                </p>
                
                <!-- Video -->
                <div class="video-wrapper" style="
                    position: relative; 
                    padding-bottom: 56.25%; 
                    height: 0; 
                    overflow: hidden; 
                    max-width: 100%; 
                    margin-bottom: 1.5rem; 
                    border-radius: 12px;
                ">
                    <iframe 
                        src="https://www.youtube.com/embed/kN2HonMXCfw" 
                        title="Формула успешной команды — видео"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;">
                    </iframe>
                </div>

                <div class="success-actions">
                    <button class="btn-primary" type="button" onclick="closeLeadModal()">
                        Закрыть
                    </button>
                </div>
            </div>
        `;

        // Replace form content container
        // We find the parent of the form to replace content clean
        form.innerHTML = successHTML;

    } catch (error) {
        // Error
        console.error('Submission failed:', error);
        if (statusEl) {
            statusEl.textContent = "Не удалось отправить заявку. Попробуйте ещё раз или обновите страницу.";
            statusEl.className = "form-status error";
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Promo Badge Auto-Hide
function initPromoBadgeNY() {
    const el = document.getElementById('promoBadgeNY');
    if (!el) return;
    const deadline = new Date(2025, 11, 31, 23, 59, 59); // 31 Dec 2025
    if (new Date() > deadline) el.style.display = 'none';
}

// Initialize Contact Form Listener & Promo
document.addEventListener('DOMContentLoaded', function () {
    initPromoBadgeNY();

    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        // Remove old listeners by cloning (optional but safe) or just adding ours
        leadForm.addEventListener('submit', handleContactSubmit);
    }
});

