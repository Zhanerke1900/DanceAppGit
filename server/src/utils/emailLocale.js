const EMAIL_LANGUAGES = new Set(["en", "ru", "kk"]);
const MONTH_NUMBERS = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

const moneyLocales = {
  en: "en-US",
  ru: "ru-KZ",
  kk: "kk-KZ",
};

export function normalizeEmailLanguage(language) {
  // Все письма поддерживают только en/ru/kk, иначе fallback на en.
  const value = String(language || "").trim().toLowerCase();
  return EMAIL_LANGUAGES.has(value) ? value : "en";
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMoneyForEmail(amount, currency = "KZT", language = "en") {
  const lang = normalizeEmailLanguage(language);
  const value = Number(amount || 0);
  try {
    return `${new Intl.NumberFormat(moneyLocales[lang], {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)} ${currency}`;
  } catch {
    return `${value.toFixed(2).replace(/\.00$/, "")} ${currency}`;
  }
}

const copy = {
  en: {
    greeting: (name) => `Hi${name ? `, ${name}` : ""}`,
    copyLink: "If the button doesn't work, copy this link:",
    automaticNotice: "This is an automatic notification from DanceTime.",
    securityNotice: "This is a security notification from DanceTime.",
    ignore: "If you didn't request this, ignore the email.",
    event: "Event",
    date: "Date",
    time: "Time",
    location: "Location",
    ticketType: "Ticket Type",
    ticketCode: "Ticket Code",
    price: "Price",
    qrCode: "QR Code",
    barcode: "Barcode",
    verifySubject: "Verify your DanceTime email",
    verifyTitle: "Confirm your email",
    verifyIntro: "Confirm your email to activate your DanceTime account.",
    verifyButton: "Verify email",
    verifyCode: "Your verification code (optional):",
    resetSubject: "Reset your DanceTime password",
    resetTitle: "Password reset",
    resetIntro: "You requested a password reset.",
    resetButton: "Reset password",
    resetCode: "Your reset code (optional):",
    validatorSubject: "Activate your DanceTime validator account",
    validatorTitle: "Validator account activation",
    validatorIntro: (organizerName) =>
      organizerName
        ? `${organizerName} has created a validator account for you on DanceTime.`
        : "A validator account has been created for you on DanceTime.",
    validatorActionIntro: "Please activate your email to use the validator dashboard and ticket validation tools.",
    validatorButton: "Activate validator account",
    validatorCode: "Your activation code (optional):",
    validatorIgnore: "If you were not expecting this invitation, you can safely ignore this email.",
    passwordChangedSubject: "Your DanceTime password was changed",
    passwordChangedTitle: "Password changed",
    passwordChangedIntro: "Your DanceTime password was changed successfully.",
    passwordChangedOk: "If this was you, no further action is needed.",
    passwordChangedWarning: "If you did not change your password, please reset it immediately and review your account access.",
    refundSubject: "Your DanceTime refund is being processed",
    refundTitle: "Refund confirmed",
    refundIntro: "Your ticket refund was successfully requested.",
    refundProcessing: "The refund is being processed. The money for your ticket should arrive within <b>3 business days</b>.",
    cancelledSubject: (title) => `DanceTime event cancelled: ${title}`,
    cancelledTitle: "Event cancelled",
    cancelledIntro: (title) => `Unfortunately, <b>${title}</b> has been cancelled by the organizer.`,
    bookingLabel: (count) => `Your ticket${count === 1 ? "" : "s"} / booking:`,
    bookingFallback: "Reservation / booking",
    refundRequested: (amount) => `A refund of <b>${amount}</b> has been requested through the payment provider.`,
    refundTimeline: "The money should arrive within <b>3 business days</b>, depending on your bank.",
    ticketsSubject: (title) => `Your DanceTime tickets for ${title}`,
    ticketsTitle: "Your DanceTime tickets are ready",
    ticketsThanks: (title) => `Thank you for your purchase. Your tickets for <strong>${title}</strong> are attached below.`,
    presentQr: "Present the QR code at the entrance. Each ticket can be used only once.",
    eventUpdateSubject: (title) => `DanceTime event update: ${title}`,
    eventUpdateTitle: "Event update",
    eventUpdateIntro: (title) => `Details for <b>${title}</b> have changed.`,
    eventUpdatedFallback: "The event details were updated by the organizer.",
    eventUpdateReason: "You received this because you have a ticket or active reservation for this event.",
    changedDate: "Date",
    changedLocation: "Location",
    changedTitle: "Title",
    reminderSubject: (title) => `Reminder: ${title} is tomorrow`,
    reminderTitle: "Your event is tomorrow",
    reminderIntro: (title) => `This is your 24-hour reminder for <b>${title}</b>.`,
    yourTickets: (count) => `Your ticket${count === 1 ? "" : "s"}`,
    keepQrReady: "Please keep your QR ticket ready for check-in.",
    reminderPrefs: "You can turn off event reminders in your DanceTime notification preferences.",
  },
  ru: {
    greeting: (name) => `Здравствуйте${name ? `, ${name}` : ""}`,
    copyLink: "Если кнопка не работает, скопируйте ссылку:",
    automaticNotice: "Это автоматическое уведомление от DanceTime.",
    securityNotice: "Это уведомление безопасности от DanceTime.",
    ignore: "Если это были не вы, просто проигнорируйте письмо.",
    event: "Событие",
    date: "Дата",
    time: "Время",
    location: "Место",
    ticketType: "Тип билета",
    ticketCode: "Код билета",
    price: "Цена",
    qrCode: "QR-код",
    barcode: "Штрихкод",
    verifySubject: "Подтвердите email в DanceTime",
    verifyTitle: "Подтвердите email",
    verifyIntro: "Подтвердите email, чтобы активировать аккаунт DanceTime.",
    verifyButton: "Подтвердить email",
    verifyCode: "Код подтверждения (необязательно):",
    resetSubject: "Сброс пароля DanceTime",
    resetTitle: "Сброс пароля",
    resetIntro: "Вы запросили сброс пароля.",
    resetButton: "Сбросить пароль",
    resetCode: "Код сброса (необязательно):",
    validatorSubject: "Активируйте аккаунт валидатора DanceTime",
    validatorTitle: "Активация аккаунта валидатора",
    validatorIntro: (organizerName) =>
      organizerName
        ? `${organizerName} создал для вас аккаунт валидатора в DanceTime.`
        : "Для вас создан аккаунт валидатора в DanceTime.",
    validatorActionIntro: "Активируйте email, чтобы пользоваться панелью валидатора и проверкой билетов.",
    validatorButton: "Активировать аккаунт валидатора",
    validatorCode: "Код активации (необязательно):",
    validatorIgnore: "Если вы не ожидали это приглашение, письмо можно безопасно проигнорировать.",
    passwordChangedSubject: "Ваш пароль DanceTime изменен",
    passwordChangedTitle: "Пароль изменен",
    passwordChangedIntro: "Пароль от вашего аккаунта DanceTime успешно изменен.",
    passwordChangedOk: "Если это сделали вы, ничего больше делать не нужно.",
    passwordChangedWarning: "Если вы не меняли пароль, сразу сбросьте его и проверьте доступ к аккаунту.",
    refundSubject: "Возврат DanceTime обрабатывается",
    refundTitle: "Возврат подтвержден",
    refundIntro: "Запрос на возврат билета успешно создан.",
    refundProcessing: "Возврат обрабатывается. Деньги за билет должны поступить в течение <b>3 рабочих дней</b>.",
    cancelledSubject: (title) => `Событие DanceTime отменено: ${title}`,
    cancelledTitle: "Событие отменено",
    cancelledIntro: (title) => `К сожалению, организатор отменил событие <b>${title}</b>.`,
    bookingLabel: (count) => `Ваш${count === 1 ? "" : "и"} билет${count === 1 ? "" : "ы"} / бронь:`,
    bookingFallback: "Бронь / заказ",
    refundRequested: (amount) => `Возврат на сумму <b>${amount}</b> отправлен платежному провайдеру.`,
    refundTimeline: "Деньги должны поступить в течение <b>3 рабочих дней</b>, срок зависит от банка.",
    ticketsSubject: (title) => `Ваши билеты DanceTime на ${title}`,
    ticketsTitle: "Ваши билеты DanceTime готовы",
    ticketsThanks: (title) => `Спасибо за покупку. Ваши билеты на <strong>${title}</strong> ниже.`,
    presentQr: "Покажите QR-код на входе. Каждый билет можно использовать только один раз.",
    eventUpdateSubject: (title) => `Обновление события DanceTime: ${title}`,
    eventUpdateTitle: "Обновление события",
    eventUpdateIntro: (title) => `Детали события <b>${title}</b> изменились.`,
    eventUpdatedFallback: "Организатор обновил детали события.",
    eventUpdateReason: "Вы получили это письмо, потому что у вас есть билет или активная бронь на это событие.",
    changedDate: "Дата",
    changedLocation: "Место",
    changedTitle: "Название",
    reminderSubject: (title) => `Напоминание: ${title} уже завтра`,
    reminderTitle: "Событие уже завтра",
    reminderIntro: (title) => `Это напоминание за 24 часа до события <b>${title}</b>.`,
    yourTickets: (count) => `Ваш${count === 1 ? "" : "и"} билет${count === 1 ? "" : "ы"}`,
    keepQrReady: "Подготовьте QR-код билета для входа.",
    reminderPrefs: "Напоминания можно отключить в настройках уведомлений DanceTime.",
  },
  kk: {
    greeting: (name) => `Сәлем${name ? `, ${name}` : ""}`,
    copyLink: "Егер батырма жұмыс істемесе, мына сілтемені көшіріңіз:",
    automaticNotice: "Бұл DanceTime жіберген автоматты хабарлама.",
    securityNotice: "Бұл DanceTime қауіпсіздік хабарламасы.",
    ignore: "Егер бұл сұрауды сіз жасамасаңыз, хатты елемей қоюға болады.",
    event: "Іс-шара",
    date: "Күні",
    time: "Уақыты",
    location: "Өтетін орны",
    ticketType: "Билет түрі",
    ticketCode: "Билет коды",
    price: "Бағасы",
    qrCode: "QR-код",
    barcode: "Штрихкод",
    verifySubject: "DanceTime email-ін растаңыз",
    verifyTitle: "Email-ді растаңыз",
    verifyIntro: "DanceTime аккаунтын іске қосу үшін email-ді растаңыз.",
    verifyButton: "Email-ді растау",
    verifyCode: "Растау коды (міндетті емес):",
    resetSubject: "DanceTime құпиясөзін қалпына келтіру",
    resetTitle: "Құпиясөзді қалпына келтіру",
    resetIntro: "Сіз құпиясөзді қалпына келтіруді сұрадыңыз.",
    resetButton: "Құпиясөзді қалпына келтіру",
    resetCode: "Қалпына келтіру коды (міндетті емес):",
    validatorSubject: "DanceTime валидатор аккаунтын іске қосыңыз",
    validatorTitle: "Валидатор аккаунтын іске қосу",
    validatorIntro: (organizerName) =>
      organizerName
        ? `${organizerName} сіз үшін DanceTime жүйесінде валидатор аккаунтын жасады.`
        : "Сіз үшін DanceTime жүйесінде валидатор аккаунты жасалды.",
    validatorActionIntro: "Валидатор панелін және билет тексеру құралдарын пайдалану үшін email-ді іске қосыңыз.",
    validatorButton: "Валидатор аккаунтын іске қосу",
    validatorCode: "Іске қосу коды (міндетті емес):",
    validatorIgnore: "Егер бұл шақыруды күтпесеңіз, хатты елемей қоюға болады.",
    passwordChangedSubject: "DanceTime құпиясөзі өзгертілді",
    passwordChangedTitle: "Құпиясөз өзгертілді",
    passwordChangedIntro: "DanceTime аккаунтыңыздың құпиясөзі сәтті өзгертілді.",
    passwordChangedOk: "Егер мұны сіз жасаған болсаңыз, басқа әрекет қажет емес.",
    passwordChangedWarning: "Егер құпиясөзді сіз өзгертпесеңіз, оны дереу қалпына келтіріп, аккаунтқа кіруді тексеріңіз.",
    refundSubject: "DanceTime қайтарымы өңделуде",
    refundTitle: "Қайтарым расталды",
    refundIntro: "Билет қайтару сұрауы сәтті жасалды.",
    refundProcessing: "Қайтарым өңделуде. Билет ақшасы <b>3 жұмыс күні</b> ішінде түсуі тиіс.",
    cancelledSubject: (title) => `DanceTime іс-шарасы тоқтатылды: ${title}`,
    cancelledTitle: "Іс-шара тоқтатылды",
    cancelledIntro: (title) => `Өкінішке қарай, ұйымдастырушы <b>${title}</b> іс-шарасын тоқтатты.`,
    bookingLabel: () => "Сіздің билетіңіз / бронь:",
    bookingFallback: "Бронь / тапсырыс",
    refundRequested: (amount) => `<b>${amount}</b> сомасындағы қайтарым төлем провайдеріне жіберілді.`,
    refundTimeline: "Ақша банкке байланысты <b>3 жұмыс күні</b> ішінде түсуі тиіс.",
    ticketsSubject: (title) => `${title} іс-шарасына DanceTime билеттеріңіз`,
    ticketsTitle: "DanceTime билеттеріңіз дайын",
    ticketsThanks: (title) => `Сатып алғаныңызға рахмет. <strong>${title}</strong> іс-шарасына билеттеріңіз төменде.`,
    presentQr: "Кіреберісте QR-кодты көрсетіңіз. Әр билет тек бір рет қолданылады.",
    eventUpdateSubject: (title) => `DanceTime іс-шарасы жаңартылды: ${title}`,
    eventUpdateTitle: "Іс-шара жаңартылды",
    eventUpdateIntro: (title) => `<b>${title}</b> іс-шарасының мәліметтері өзгерді.`,
    eventUpdatedFallback: "Ұйымдастырушы іс-шара мәліметтерін жаңартты.",
    eventUpdateReason: "Бұл хат сізде осы іс-шараға билет немесе белсенді бронь болғандықтан жіберілді.",
    changedDate: "Күні",
    changedLocation: "Өтетін орны",
    changedTitle: "Атауы",
    reminderSubject: (title) => `Еске салу: ${title} ертең өтеді`,
    reminderTitle: "Іс-шара ертең өтеді",
    reminderIntro: (title) => `Бұл <b>${title}</b> іс-шарасына 24 сағат қалғанда жіберілген еске салу.`,
    yourTickets: () => "Сіздің билетіңіз",
    keepQrReady: "Кіру үшін билетіңіздің QR-кодын дайындап қойыңыз.",
    reminderPrefs: "Еске салғыштарды DanceTime хабарлама баптауларынан өшіруге болады.",
  },
};

export function getEmailCopy(language) {
  return copy[normalizeEmailLanguage(language)];
}

function padDatePart(value) {
  return String(value || "").padStart(2, "0");
}

function normalizeNumericDateText(value) {
  const text = String(value || "").trim();
  if (!text) return text;

  const isoRange = text.match(/^(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})$/);
  if (isoRange) return `${isoRange[1]} - ${isoRange[2]}`;

  return text.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*-\s*(\d{1,2}))?,\s*(\d{4})\b/g,
    (_match, month, day, endDay, year) => {
      const monthNumber = MONTH_NUMBERS[month] || month;
      const startDate = `${year}-${monthNumber}-${padDatePart(day)}`;
      return endDay ? `${startDate} - ${year}-${monthNumber}-${padDatePart(endDay)}` : startDate;
    }
  );
}

export function localizeEventForEmail(event = {}, language = "en") {
  // Для email берем перевод события, если он есть, иначе fallback на основные поля Event.
  const lang = normalizeEmailLanguage(language);
  const localized = event?.translations?.[lang] || {};
  const fallback = event || {};

  return {
    ...fallback,
    title: localized.title || fallback.title,
    date: normalizeNumericDateText(fallback.date),
    venue: localized.venue || fallback.venue,
    address: localized.address || fallback.address,
    location: localized.location || fallback.location,
    description: localized.description || fallback.description,
    longDescription: localized.longDescription || fallback.longDescription,
    targetAudience: localized.targetAudience || fallback.targetAudience,
    highlights: Array.isArray(localized.highlights) && localized.highlights.length
      ? localized.highlights
      : fallback.highlights,
  };
}
