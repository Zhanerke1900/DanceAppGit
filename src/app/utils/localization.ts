import type { Language } from '../i18n';

type LocalizedText = Record<Language, string>;

export const CITY_OPTIONS = [
  'Astana',
  'Almaty',
  'Shymkent',
  'Karaganda',
  'Aktobe',
  'Taraz',
  'Pavlodar',
  'Ust-Kamenogorsk',
  'Atyrau',
] as const;

const CITY_LABELS: Record<string, LocalizedText> = {
  astana: { en: 'Astana', ru: 'Астана', kk: 'Астана' },
  almaty: { en: 'Almaty', ru: 'Алматы', kk: 'Алматы' },
  shymkent: { en: 'Shymkent', ru: 'Шымкент', kk: 'Шымкент' },
  karaganda: { en: 'Karaganda', ru: 'Караганда', kk: 'Қарағанды' },
  aktobe: { en: 'Aktobe', ru: 'Актобе', kk: 'Ақтөбе' },
  taraz: { en: 'Taraz', ru: 'Тараз', kk: 'Тараз' },
  pavlodar: { en: 'Pavlodar', ru: 'Павлодар', kk: 'Павлодар' },
  'ust-kamenogorsk': { en: 'Ust-Kamenogorsk', ru: 'Усть-Каменогорск', kk: 'Өскемен' },
  atyrau: { en: 'Atyrau', ru: 'Атырау', kk: 'Атырау' },
};

const normalizeLookupText = (value: string) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[’']/g, '')
    .replace(/[\s_]+/g, '-');

const CITY_ALIASES: Record<string, string> = {
  astana: 'Astana',
  'nur-sultan': 'Astana',
  nursultan: 'Astana',
  астана: 'Astana',
  'нур-султан': 'Astana',
  нурсултан: 'Astana',
  almaty: 'Almaty',
  алматы: 'Almaty',
  shymkent: 'Shymkent',
  шымкент: 'Shymkent',
  шимкент: 'Shymkent',
  karaganda: 'Karaganda',
  караганда: 'Karaganda',
  қарағанды: 'Karaganda',
  aktobe: 'Aktobe',
  актобе: 'Aktobe',
  ақтөбе: 'Aktobe',
  taraz: 'Taraz',
  тараз: 'Taraz',
  pavlodar: 'Pavlodar',
  павлодар: 'Pavlodar',
  'ust-kamenogorsk': 'Ust-Kamenogorsk',
  ustkamenogorsk: 'Ust-Kamenogorsk',
  oskemen: 'Ust-Kamenogorsk',
  оскемен: 'Ust-Kamenogorsk',
  өскемен: 'Ust-Kamenogorsk',
  'усть-каменогорск': 'Ust-Kamenogorsk',
  устькаменогорск: 'Ust-Kamenogorsk',
  atyrau: 'Atyrau',
  атырау: 'Atyrau',
};

export const getCanonicalCity = (value: string) => {
  const raw = String(value || '').trim();
  const key = normalizeLookupText(raw);
  return CITY_ALIASES[key] || raw;
};

export const normalizeCity = (value: string) => normalizeLookupText(getCanonicalCity(value));

export const localizeCityName = (city: string, language: Language) => {
  const key = normalizeCity(city);
  return CITY_LABELS[key]?.[language] || String(city || '');
};

export const citySearchText = (city: string, language: Language) => {
  const canonical = getCanonicalCity(city);
  const key = normalizeCity(canonical);
  const labels = CITY_LABELS[key] ? Object.values(CITY_LABELS[key]) : [];
  return [canonical, ...labels, localizeCityName(city, language)].join(' ').toLocaleLowerCase();
};

const MONTH_LABELS: Record<string, LocalizedText> = {
  January: { en: 'January', ru: 'января', kk: 'қаңтар' },
  February: { en: 'February', ru: 'февраля', kk: 'ақпан' },
  March: { en: 'March', ru: 'марта', kk: 'наурыз' },
  April: { en: 'April', ru: 'апреля', kk: 'сәуір' },
  May: { en: 'May', ru: 'мая', kk: 'мамыр' },
  June: { en: 'June', ru: 'июня', kk: 'маусым' },
  July: { en: 'July', ru: 'июля', kk: 'шілде' },
  August: { en: 'August', ru: 'августа', kk: 'тамыз' },
  September: { en: 'September', ru: 'сентября', kk: 'қыркүйек' },
  October: { en: 'October', ru: 'октября', kk: 'қазан' },
  November: { en: 'November', ru: 'ноября', kk: 'қараша' },
  December: { en: 'December', ru: 'декабря', kk: 'желтоқсан' },
};

export const localizeDateText = (value: string, language: Language) => {
  const text = String(value || '');
  if (!text || language === 'en') return text;

  return text.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*-\s*(\d{1,2}))?,\s*(\d{4})\b/g,
    (_match, month: string, day: string, endDay: string | undefined, year: string) => {
      const dayPart = endDay ? `${day}-${endDay}` : day;
      const monthLabel = MONTH_LABELS[month]?.[language] || month;
      return language === 'kk'
        ? `${year} жылғы ${dayPart} ${monthLabel}`
        : `${dayPart} ${monthLabel} ${year}`;
    }
  );
};

const CATEGORY_LABELS: Record<string, LocalizedText> = {
  All: { en: 'All', ru: 'Все', kk: 'Барлығы' },
  'Hip Hop': { en: 'Hip Hop', ru: 'Хип-хоп', kk: 'Хип-хоп' },
  Contemporary: { en: 'Contemporary', ru: 'Контемпорари', kk: 'Контемпорари' },
  Ballet: { en: 'Ballet', ru: 'Балет', kk: 'Балет' },
  Latin: { en: 'Latin', ru: 'Латина', kk: 'Латын биі' },
  Ballroom: { en: 'Ballroom', ru: 'Бальные танцы', kk: 'Бал биі' },
  Festivals: { en: 'Festivals', ru: 'Фестивали', kk: 'Фестивальдер' },
  Competitions: { en: 'Competitions', ru: 'Соревнования', kk: 'Жарыстар' },
  Masterclasses: { en: 'Masterclasses', ru: 'Мастер-классы', kk: 'Шеберлік сабақтары' },
  Camps: { en: 'Camps', ru: 'Лагеря', kk: 'Лагерьлер' },
  Masterclass: { en: 'Masterclass', ru: 'Мастер-класс', kk: 'Шеберлік сабағы' },
  Battle: { en: 'Battle', ru: 'Баттл', kk: 'Баттл' },
  Contest: { en: 'Contest', ru: 'Конкурс', kk: 'Байқау' },
  Camp: { en: 'Camp', ru: 'Лагерь', kk: 'Лагерь' },
};

export const localizeCategoryName = (category: string, language: Language) =>
  CATEGORY_LABELS[String(category || '').trim()]?.[language] || String(category || '');

const EVENT_TITLE_TRANSLATIONS: Record<string, Partial<LocalizedText>> = {
  'Velvet Motion Night': { ru: 'Ночь Velvet Motion', kk: 'Velvet Motion түні' },
  'Neon Floor Battle': { ru: 'Баттл Neon Floor', kk: 'Neon Floor баттлы' },
  'Midnight Bachata Club': { ru: 'Полуночный Bachata Club', kk: 'Түнгі Bachata Club' },
  'Silk Road Vogue Ball': { ru: 'Vogue-бал Silk Road', kk: 'Silk Road Vogue балы' },
  'Prima Lights Gala': { ru: 'Гала Prima Lights', kk: 'Prima Lights гала кеші' },
  'Pulse Weekend': { ru: 'Уикенд Pulse', kk: 'Pulse демалысы' },
  'Golden Hour Social': { ru: 'Social Golden Hour', kk: 'Golden Hour social кеші' },
  'Rhythm Orbit': { ru: 'Rhythm Orbit', kk: 'Rhythm Orbit' },
  'Waltz Invitationals': { ru: 'Вальсовый турнир', kk: 'Вальс турнирі' },
  'Contemporary Showcase': { ru: 'Контемпорари-шоукейс', kk: 'Контемпорари шоукейсі' },
  'Ballet Spring Gala': { ru: 'Весеннее балетное гала', kk: 'Көктемгі балет гала кеші' },
  'Beat District': { ru: 'Beat District', kk: 'Beat District' },
  'Motion Theatre': { ru: 'Театр движения', kk: 'Қозғалыс театры' },
  'Bachata Under Lights': { ru: 'Бачата под огнями', kk: 'Шамдар астындағы бачата' },
  'Winter Ballroom Cup': { ru: 'Зимний кубок по бальным танцам', kk: 'Қысқы бал биі кубогы' },
  'Grand Opera Night': { ru: 'Большая оперная ночь', kk: 'Үлкен опера түні' },
  'Modern Dance Fest': { ru: 'Фестиваль современного танца', kk: 'Заманауи би фестивалі' },
  'Groove Days': { ru: 'Groove Days', kk: 'Groove Days' },
  'Salsa Night': { ru: 'Ночь сальсы', kk: 'Сальса түні' },
  'Folk Heritage': { ru: 'Народное наследие', kk: 'Халық мұрасы' },
  'Freestyle Lab': { ru: 'Лаборатория фристайла', kk: 'Фристайл лабораториясы' },
  'Ballroom Masters': { ru: 'Мастера бальных танцев', kk: 'Бал биі шеберлері' },
  'Latin Heat': { ru: 'Латинский ритм', kk: 'Латын қызуы' },
  'B-Boy Battle': { ru: 'B-Boy баттл', kk: 'B-Boy баттлы' },
  'Modern Movement': { ru: 'Современное движение', kk: 'Заманауи қозғалыс' },
  'Tango Night': { ru: 'Ночь танго', kk: 'Танго түні' },
  'Urban Jam': { ru: 'Urban Jam', kk: 'Urban Jam' },
  'Bachata Social': { ru: 'Bachata Social', kk: 'Bachata social кеші' },
  'Astana Digital Dance Week': { ru: 'Цифровая танцевальная неделя Астаны', kk: 'Астананың цифрлық би апталығы' },
  'Step Up: Varsity Edition': { ru: 'Step Up: студенческая версия', kk: 'Step Up: студенттік нұсқа' },
  'Wild West Dance Camp': { ru: 'Танцевальный лагерь Wild West', kk: 'Wild West би лагері' },
  'Astana Rhythm Weekend': { ru: 'Ритм-уикенд в Астане', kk: 'Астана ритм демалысы' },
  'Astana Crew Clash': { ru: 'Crew Clash в Астане', kk: 'Астана Crew Clash' },
  'Stage Presence Intensive': { ru: 'Интенсив сценического присутствия', kk: 'Сахналық сенімділік интенсиві' },
  'Bachata Flow Lab': { ru: 'Лаборатория Bachata Flow', kk: 'Bachata Flow лабораториясы' },
  'Breaking Power Workshop': { ru: 'Воркшоп Breaking Power', kk: 'Breaking Power воркшобы' },
  'Winter Intensive: Astana': { ru: 'Зимний интенсив: Астана', kk: 'Қысқы интенсив: Астана' },
  'Open Format Festival Lab': { ru: 'Лаборатория фестиваля open format', kk: 'Open format фестиваль лабораториясы' },
  'Rooftop Vogue Dance Session': { ru: 'Vogue-сессия на крыше', kk: 'Шатырдағы Vogue би сессиясы' },
  'Medeu Street Dance Grooves': { ru: 'Уличные танцы Медеу', kk: 'Медеудегі көше биі' },
  'Apple Garden Bachata Social Dance': { ru: 'Bachata Social в яблоневом саду', kk: 'Алма бағындағы Bachata social' },
  'Contemporary Dance Lines Lab': { ru: 'Лаборатория линий контемпорари', kk: 'Контемпорари сызықтары лабораториясы' },
  'Ballet Variations Evening': { ru: 'Вечер балетных вариаций', kk: 'Балет вариациялары кеші' },
  'Dostyk Salsa Dance Jam': { ru: 'Salsa Jam на Достык', kk: 'Достықтағы Salsa Jam' },
  'Contemporary Floorwork Dance Night': { ru: 'Ночь contemporary floorwork', kk: 'Contemporary floorwork түні' },
  'Ballroom Waltz Matinee': { ru: 'Вальсовый матине', kk: 'Вальс матинесі' },
  'Breakdance Battle Almaty': { ru: 'Брейкданс-баттл Алматы', kk: 'Алматы брейкданс баттлы' },
  'Snow Peak Ballet Gala': { ru: 'Балетное гала Snow Peak', kk: 'Snow Peak балет гала кеші' },
  'Street Dance Cypher South': { ru: 'Южный street dance cypher', kk: 'Оңтүстік street dance cypher' },
  'Silk City Salsa Dance Night': { ru: 'Ночь сальсы Silk City', kk: 'Silk City сальса түні' },
  'Nomad Contemporary Dance Stage': { ru: 'Контемпорари-сцена Nomad', kk: 'Nomad контемпорари сахнасы' },
  'South Ballet Evening': { ru: 'Южный балетный вечер', kk: 'Оңтүстік балет кеші' },
  'Shymkent Ballroom Cup': { ru: 'Кубок Шымкента по бальным танцам', kk: 'Шымкент бал биі кубогы' },
  'Arbat Street Dance Battle': { ru: 'Street dance баттл на Арбате', kk: 'Арбаттағы street dance баттлы' },
  'Latin Dance Patio Night': { ru: 'Латинская ночь на патио', kk: 'Патиодағы латын биі түні' },
  'Green Bazaar Dance Grooves': { ru: 'Танцевальные грувы Green Bazaar', kk: 'Green Bazaar би грувтары' },
  'Modern Dance Forms Showcase': { ru: 'Шоукейс современных танцевальных форм', kk: 'Заманауи би формалары шоукейсі' },
  'Swan Lake Ballet Fragments': { ru: 'Балетные фрагменты «Лебединое озеро»', kk: '«Аққу көлі» балет фрагменттері' },
  'Almaty Open Styles Dance Festival': { ru: 'Фестиваль open styles в Алматы', kk: 'Алматы open styles би фестивалі' },
  'Kok-Tobe Dance Choreo Camp': { ru: 'Хорео-лагерь Кок-Тобе', kk: 'Көк-Төбе хорео лагері' },
  'Medeu Dance Battle Summit': { ru: 'Танцевальный баттл-саммит Медеу', kk: 'Медеу би баттл саммиті' },
  'Ballet Repertoire Intensive': { ru: 'Интенсив балетного репертуара', kk: 'Балет репертуары интенсиві' },
  'Latin Dance Weekend Almaty': { ru: 'Латино-уикенд Алматы', kk: 'Алматы латын биі демалысы' },
  'Contemporary Dance Creation Lab': { ru: 'Лаборатория создания контемпорари', kk: 'Контемпорари жасау лабораториясы' },
  'Dance Crew League Almaty': { ru: 'Лига танцевальных команд Алматы', kk: 'Алматы би командалары лигасы' },
  'Mountain Dance Camp': { ru: 'Горный танцевальный лагерь', kk: 'Таудағы би лагері' },
  'Dance Stage Tech Masterweek': { ru: 'Мастер-неделя сценической техники', kk: 'Сахна техникасы мастер апталығы' },
  'Grand Spring Dance Showcase': { ru: 'Большой весенний танцевальный шоукейс', kk: 'Үлкен көктемгі би шоукейсі' },
  'Southern Dance Fest': { ru: 'Южный танцевальный фестиваль', kk: 'Оңтүстік би фестивалі' },
  'Silk Road Latin Dance Camp': { ru: 'Латино-лагерь Silk Road', kk: 'Silk Road латын биі лагері' },
  'Steppe Dance Crew Battle': { ru: 'Степной баттл танцевальных команд', kk: 'Дала би командалары баттлы' },
  'Theatre Dance Movement Intensive': { ru: 'Интенсив театрального движения', kk: 'Театрлық би қозғалысы интенсиві' },
  'South Ballroom Open': { ru: 'South Ballroom Open', kk: 'South Ballroom Open' },
  'Hip Hop Dance Judges Lab': { ru: 'Лаборатория судейства хип-хопа', kk: 'Хип-хоп төрешілік лабораториясы' },
  'Contemporary Dance Weekend South': { ru: 'Южный contemporary weekend', kk: 'Оңтүстік contemporary демалысы' },
  'Family Dance Festival': { ru: 'Семейный танцевальный фестиваль', kk: 'Отбасылық би фестивалі' },
  'Summer Dance Camp Shymkent': { ru: 'Летний танцевальный лагерь Шымкент', kk: 'Шымкент жазғы би лагері' },
  'Final Dance Stage Challenge': { ru: 'Финальный сценический танцевальный челлендж', kk: 'Финалдық сахналық би челленджі' },
};

const KNOWN_TEXT_TRANSLATIONS: Record<string, Partial<LocalizedText>> = {
  'Dancers, dance fans, students, and guests looking for a high-quality live dance experience.': {
    ru: 'Танцоры, поклонники танца, студенты и гости, которым нужен качественный живой танцевальный опыт.',
    kk: 'Сапалы жанды би тәжірибесін іздейтін бишілер, би жанкүйерлері, студенттер және қонақтар.',
  },
  'Curated program': { ru: 'Кураторская программа', kk: 'Іріктелген бағдарлама' },
  'Professional venue': { ru: 'Профессиональная площадка', kk: 'Кәсіби алаң' },
  'Community atmosphere': { ru: 'Атмосфера комьюнити', kk: 'Қауымдастық атмосферасы' },
  'Limited tickets': { ru: 'Ограниченное количество билетов', kk: 'Билеттер саны шектеулі' },
  'Main Hall': { ru: 'Главный зал', kk: 'Бас зал' },
  'Main Stage': { ru: 'Главная сцена', kk: 'Бас сахна' },
  'Main Arena': { ru: 'Главная арена', kk: 'Бас арена' },
  'Stage A': { ru: 'Сцена A', kk: 'A сахнасы' },
  'Hall A': { ru: 'Зал A', kk: 'A залы' },
  'Hall 2': { ru: 'Зал 2', kk: '2-зал' },
  'Studio A': { ru: 'Студия A', kk: 'A студиясы' },
  'Social Hall': { ru: 'Social-зал', kk: 'Social залы' },
  'VR Lab': { ru: 'VR-лаборатория', kk: 'VR лабораториясы' },
  'Lakeside Platform': { ru: 'Площадка у озера', kk: 'Көл жанындағы алаң' },
  'Open Deck': { ru: 'Открытая площадка', kk: 'Ашық алаң' },
  'Amphitheatre': { ru: 'Амфитеатр', kk: 'Амфитеатр' },
  'Host': { ru: 'Организатор', kk: 'Ұйымдастырушы' },
  'Co-organizer': { ru: 'Соорганизатор', kk: 'Қосалқы ұйымдастырушы' },
  'Kazakhstan': { ru: 'Казахстан', kk: 'Қазақстан' },
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const localizeKnownText = (value: string, language: Language) => {
  const text = String(value || '');
  if (!text || language === 'en') return text;
  return KNOWN_TEXT_TRANSLATIONS[text]?.[language] || text;
};

export const localizeEventTitle = (title: string, language: Language) => {
  const text = String(title || '');
  if (!text || language === 'en') return text;
  return EVENT_TITLE_TRANSLATIONS[text]?.[language] || text;
};

export const stripCityFromEventTitle = (title: string) => {
  const text = String(title || '').trim();
  if (!text) return text;

  const cityAlternatives = Object.values(CITY_LABELS)
    .flatMap((labels) => Object.values(labels))
    .concat(CITY_OPTIONS as unknown as string[])
    .filter(Boolean)
    .map(escapeRegExp)
    .join('|');

  return text
    .replace(new RegExp(`\\s+(?:in|в)\\s+(?:${cityAlternatives})$`, 'i'), '')
    .replace(new RegExp(`^(?:${cityAlternatives})\\s+`, 'i'), '')
    .trim() || text;
};

export const localizeLocationText = (value: string, language: Language) => {
  let text = String(value || '');
  if (!text || language === 'en') return text;

  for (const [knownText, labels] of Object.entries(KNOWN_TEXT_TRANSLATIONS)) {
    const replacement = labels[language];
    if (!replacement) continue;
    text = text.replace(new RegExp(`\\b${escapeRegExp(knownText)}\\b`, 'g'), replacement);
  }

  for (const city of CITY_OPTIONS) {
    const localizedCity = localizeCityName(city, language);
    const labels = CITY_LABELS[normalizeCity(city)] ? Object.values(CITY_LABELS[normalizeCity(city)]) : [city];
    for (const label of labels) {
      text = text.replace(new RegExp(`\\b${escapeRegExp(label)}\\b`, 'g'), localizedCity);
    }
  }

  return text;
};

const localizeEventDescription = (
  value: string,
  rawTitle: string,
  localizedTitle: string,
  language: Language,
  variant: 'short' | 'long'
) => {
  const text = String(value || '');
  if (!text || language === 'en') return text;

  const defaultShort = `${rawTitle} brings dancers together for a polished DanceTime marketplace experience.`;
  const defaultLong = `${rawTitle} is part of the curated DanceTime marketplace lineup, with professional production, clear ticketing, and a welcoming atmosphere for dancers and guests.`;

  if (variant === 'short' && text === defaultShort) {
    return language === 'kk'
      ? `${localizedTitle} DanceTime алаңында бишілерді продакшны ойластырылған, жайлы форматта біріктіреді.`
      : `${localizedTitle} объединяет танцоров в продуманном формате DanceTime с качественной организацией.`;
  }

  if (variant === 'long' && text === defaultLong) {
    return language === 'kk'
      ? `${localizedTitle} DanceTime топтамасына кіреді: кәсіби алаң, түсінікті билет жүйесі және бишілер мен қонақтарға жайлы атмосфера.`
      : `${localizedTitle} входит в подборку DanceTime: профессиональная площадка, понятная покупка билетов и дружелюбная атмосфера для танцоров и гостей.`;
  }

  return localizeKnownText(text, language);
};

const localizeActivityDescription = (value: string, rawName: string, localizedName: string, language: Language) => {
  const text = String(value || '');
  if (!text || language === 'en') return text;
  const defaultDescription = `${rawName} session with guided practice and community feedback.`;
  if (text === defaultDescription) {
    return language === 'kk'
      ? `${localizedName} сессиясы: бағытталған практика және қауымдастықтан кері байланыс.`
      : `Сессия ${localizedName}: практика с наставлением и обратная связь от сообщества.`;
  }
  return localizeKnownText(text, language);
};

export const localizeEventForDisplay = <T extends Record<string, any>>(event: T, language: Language): T => {
  if (!event) return event;

  const rawTitle = String(event.title || '');
  const localizedTitle = localizeEventTitle(rawTitle, language);
  const localizedHighlights = Array.isArray(event.highlights)
    ? event.highlights.map((item: string) => localizeKnownText(item, language))
    : event.highlights;

  return {
    ...event,
    title: localizedTitle,
    category: localizeCategoryName(event.category, language),
    date: localizeDateText(event.date, language),
    time: localizeDateText(event.time, language),
    city: localizeCityName(event.city, language),
    venue: localizeLocationText(event.venue, language),
    address: localizeLocationText(event.address, language),
    location: localizeLocationText(event.location, language),
    description: localizeEventDescription(event.description, rawTitle, localizedTitle, language, 'short'),
    longDescription: localizeEventDescription(event.longDescription, rawTitle, localizedTitle, language, 'long'),
    targetAudience: localizeKnownText(event.targetAudience, language),
    highlights: localizedHighlights,
    schedule: Array.isArray(event.schedule)
      ? event.schedule.map((item: any) => ({
          ...item,
          title: localizeEventTitle(item.title, language),
          description: localizeKnownText(item.description, language),
          location: localizeLocationText(item.location, language),
        }))
      : event.schedule,
    activities: Array.isArray(event.activities)
      ? event.activities.map((activity: any) => {
          const rawName = String(activity.name || '');
          const localizedName = localizeEventTitle(rawName, language);
          return {
            ...activity,
            name: localizedName,
            description: localizeActivityDescription(activity.description, rawName, localizedName, language),
            location: localizeLocationText(activity.location, language),
            organizer: activity.organizer
              ? {
                  ...activity.organizer,
                  role: localizeKnownText(activity.organizer.role, language),
                }
              : activity.organizer,
          };
        })
      : event.activities,
  };
};

export const getLocalizedEventSearchValues = (event: any, language: Language) => {
  const localized = localizeEventForDisplay(event || {}, language);
  const activityValues = [
    ...(event?.activities || []).flatMap((activity: any) => [
      activity.name,
      activity.type,
      activity.description,
      activity.location,
      activity.organizer?.name,
    ]),
    ...(localized?.activities || []).flatMap((activity: any) => [
      activity.name,
      localizeCategoryName(activity.type, language),
      activity.description,
      activity.location,
      activity.organizer?.name,
    ]),
  ];

  return [
    event?.title,
    event?.location,
    event?.city,
    event?.category,
    event?.date,
    event?.time,
    event?.price,
    event?.description,
    event?.longDescription,
    localized.title,
    localized.location,
    localized.city,
    localized.category,
    localized.date,
    localized.time,
    localized.description,
    localized.longDescription,
    ...(event?.highlights || []),
    ...(localized?.highlights || []),
    ...activityValues,
  ];
};
