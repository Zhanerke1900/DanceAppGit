import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'ru' | 'kk';

type TranslationValue = string | ((params?: Record<string, string | number>) => string);

const translations = {
  en: {
    common: {
      home: 'Home',
      events: 'Events',
      aboutUs: 'About us',
      forOrganizers: 'For Organizers',
      signIn: 'Sign In',
      getStarted: 'Get Started',
      logout: 'Logout',
      welcome: 'Welcome',
      exploreAllEvents: 'Explore All Events',
      noResults: 'No results found',
      language: 'Language',
      selectCity: 'Select City',
      searchCity: 'Search city...',
      searchCityKazakhstan: 'Search city in Kazakhstan...',
      ticketsFrom: 'Tickets from',
      soldOut: 'Sold out',
      ticketsLeft: ({ count }: Record<string, string | number> = {}) => `${count} tickets left`,
      buyTicket: 'Buy Ticket',
      viewDetails: 'View Details',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      startsAt: 'Starts at',
      backToLogin: 'Back to login',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      confirmPassword: 'Confirm Password',
      resetPassword: 'Reset Password',
      resendVerificationEmail: 'Resend verification email',
      backToLoginCta: 'Back to Login',
      sendInstructions: 'Send Instructions...',
      sending: 'Sending...',
      creatingAccount: 'Creating Account...',
      loggingIn: 'Logging in...',
      becomeOrganizer: 'Become an Organizer',
      myTickets: 'My Tickets',
      favorites: 'Favorites',
      purchaseHistory: 'Purchase History',
      accountSettings: 'Account Settings',
      switchToLight: 'Switch to Light',
      switchToDark: 'Switch to Dark',
      organizerDashboard: 'Organizer Dashboard',
      adminPanel: 'Admin Panel',
      myEvents: 'My Events',
      scanTicket: 'Scan Ticket',
      continue: 'Continue',
      checkInbox: 'Check your inbox',
    },
    navbar: {
      organizerDashboard: 'Organizer Dashboard',
      adminPanel: 'Admin Panel',
      myEvents: 'My Events',
      scanTicket: 'Scan Ticket',
      forOrganizers: 'For Organizers',
    },
    hero: {
      badge: 'The Biggest Dance Ticketing Platform in Kazakhstan',
      titleStart: 'Experience Every',
      titleAccent: 'Beat',
      titleEnd: 'Live',
      description: "Streamline your dance events with the world's most intuitive ticketing system. From local workshops to global festivals.",
      cta: 'Explore Events',
      joined: 'dancers already joined',
      performanceAlt: 'Dance performance',
      userAlt: 'User',
    },
    home: {
      partners: 'Empowering events in Kazakhstan',
      statsSold: 'Tickets Sold in KZ',
      statsOrganizers: 'Organizers',
      statsCities: 'Major Cities',
      statsSupport: 'Local Support',
    },
    featuredEvents: {
      title: ({ city }: Record<string, string | number> = {}) => `Events in ${city}`,
      description: ({ city }: Record<string, string | number> = {}) =>
        `Discover and book tickets for the hottest dance performances, workshops, and competitions in ${city}.`,
      emptyTitle: ({ category }: Record<string, string | number> = {}) =>
        `No ${category ? `${category} ` : ''}events found in your city`,
      emptyDescription: ({ city }: Record<string, string | number> = {}) =>
        `No events found in ${city} for this style yet. Don't worry, there's plenty of dance elsewhere in Kazakhstan!`,
      exploreOtherCities: 'Explore other cities',
      viewAllStyles: ({ city }: Record<string, string | number> = {}) => `View all styles in ${city}`,
      all: 'All',
    },
    specialPrograms: {
      eyebrow: 'Curated Experience',
      titleStart: 'Special',
      titleAccent: 'Programs',
      description: ({ city }: Record<string, string | number> = {}) =>
        `Choose activities inside this event. From intensive masterclasses to week-long dance camps in ${city}.`,
      emptyTitle: ({ category, city }: Record<string, string | number> = {}) =>
        `No ${category || 'special programs'} in ${city}`,
      emptyDescription: "We're constantly updating our programs. Check back soon or explore events in other cities.",
      all: 'All',
      festivals: 'Festivals',
      competitions: 'Competitions',
      masterclasses: 'Masterclasses',
      camps: 'Camps',
    },
    features: {
      eyebrow: 'Built for Organizers',
      title: 'Everything you need to host a sell-out dance event',
      description: 'Powerful tools designed specifically for the unique needs of the dance community.',
      items: [
        {
          title: 'Mobile First Ticketing',
          description: 'Digital tickets with unique QR codes. Easy entry management right from your phone.',
        },
        {
          title: 'Real-time Analytics',
          description: 'Track sales, attendee demographics, and marketing ROI in real-time.',
        },
        {
          title: 'Global Reach',
          description: 'Support for 20+ currencies and localized payment methods for international tours.',
        },
        {
          title: 'Secure Payments',
          description: 'PCI-compliant payment processing with fraud protection for every transaction.',
        },
        {
          title: 'Community Tools',
          description: 'Engage your audience with pre-sale access, newsletters, and loyalty rewards.',
        },
        {
          title: 'Instant Setup',
          description: 'Launch your event page in under 5 minutes with our drag-and-drop builder.',
        },
      ],
    },
    testimonials: {
      title: 'Trusted by the best in the industry',
      subtitle: '4.9/5 average rating from over 120+ organizers',
      items: [
        {
          content: 'DancePass changed how we manage our annual festival. The QR scanning is lightning fast and our attendees love the mobile tickets.',
          role: 'President of Dance Club, Astana IT University',
        },
        {
          content: 'The analytics tools are a game-changer. We can see exactly where our ticket sales are coming from and adjust our marketing on the fly.',
          role: 'Active Dancer, 10+ years of Ballroom Dancing',
        },
        {
          content: "Support is incredible. Whenever we have a question, they're there in minutes. Highly recommended for any dance event organizer.",
          role: 'Vice-President of Dance Club, Astana IT University',
        },
      ],
    },
    cta: {
      title: 'Ready to take your event to the next level?',
      description: 'Join 70+ organizers who trust DanceTime for their ticketing, marketing, and management.',
      button: 'Become an Organizer',
    },
    footer: {
      description: 'The leading ticketing platform for the global dance community. Experience the movement.',
      platform: 'Platform',
      findEvents: 'Find Events',
      pricing: 'Pricing',
      support: 'Support',
      company: 'Company',
      aboutUs: 'About Us',
      careers: 'Careers',
      press: 'Press',
      contact: 'Contact',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Policy',
      copyright: '© 2026 DanceTime Technologies Inc. All rights reserved.',
      status: 'Status',
      englishUs: 'English (US)',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      loginDescription: 'Log in to access your tickets and favorite events',
      validEmail: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      verifyEmailFirst: 'Please verify your email first. Check your inbox or resend below.',
      loginFailed: 'Login failed',
      enterFullName: 'Please enter your full name',
      passwordMin: 'Password must be at least 6 characters',
      passwordsMismatch: 'Passwords do not match',
      registrationFailed: 'Registration failed',
      emailRegistered: 'Email is already registered',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      createAccount: 'Create Account',
      joinDanceTime: 'Join DanceTime and never miss a beat',
      saveTickets: 'Save and manage your tickets',
      fasterCheckout: 'Faster checkout process',
      securePurchases: 'Secure and verified purchases',
      yourEmail: 'your@email.com',
      enterPassword: 'Enter your password',
      yourFullName: 'Your full name',
      createPassword: 'Create a password',
      repeatPassword: 'Repeat your password',
      signUp: 'Sign Up',
      enterEmailReset: 'Enter your email to receive reset instructions',
      resetPasswordButton: 'Reset Password',
      failedResetEmail: 'Failed to send reset email',
      verificationSentTo: "We've sent verification instructions to",
      verificationSentAgain: 'Verification email sent again. Check your inbox.',
      verificationResendFailed: 'Could not resend verification email',
      login: 'Log In',
    },
  },
  ru: {
    common: {
      home: 'Главная',
      events: 'События',
      aboutUs: 'О нас',
      forOrganizers: 'Организаторам',
      signIn: 'Войти',
      getStarted: 'Начать',
      logout: 'Выйти',
      welcome: 'Добро пожаловать',
      exploreAllEvents: 'Все события',
      noResults: 'Ничего не найдено',
      language: 'Язык',
      selectCity: 'Выберите город',
      searchCity: 'Поиск города...',
      searchCityKazakhstan: 'Найти город в Казахстане...',
      ticketsFrom: 'Билеты от',
      soldOut: 'Распродано',
      ticketsLeft: ({ count }: Record<string, string | number> = {}) => `Осталось билетов: ${count}`,
      buyTicket: 'Купить билет',
      viewDetails: 'Подробнее',
      addToFavorites: 'Добавить в избранное',
      removeFromFavorites: 'Убрать из избранного',
      startsAt: 'Цена от',
      backToLogin: 'Назад ко входу',
      email: 'Почта',
      password: 'Пароль',
      fullName: 'Полное имя',
      confirmPassword: 'Подтвердите пароль',
      resetPassword: 'Сброс пароля',
      resendVerificationEmail: 'Отправить письмо повторно',
      backToLoginCta: 'Вернуться ко входу',
      sendInstructions: 'Отправка...',
      sending: 'Отправка...',
      creatingAccount: 'Создание аккаунта...',
      loggingIn: 'Вход...',
      becomeOrganizer: 'Стать организатором',
      myTickets: 'Мои билеты',
      favorites: 'Избранное',
      purchaseHistory: 'История покупок',
      accountSettings: 'Настройки аккаунта',
      switchToLight: 'Светлая тема',
      switchToDark: 'Темная тема',
      organizerDashboard: 'Панель организатора',
      adminPanel: 'Админ-панель',
      myEvents: 'Мои события',
      scanTicket: 'Сканировать билет',
      continue: 'Продолжить',
      checkInbox: 'Проверьте почту',
    },
    navbar: {
      organizerDashboard: 'Панель организатора',
      adminPanel: 'Админ-панель',
      myEvents: 'Мои события',
      scanTicket: 'Сканировать билет',
      forOrganizers: 'Организаторам',
    },
    hero: {
      badge: 'Крупнейшая платформа продажи билетов на танцевальные события в Казахстане',
      titleStart: 'Почувствуй каждый',
      titleAccent: 'ритм',
      titleEnd: 'вживую',
      description: 'Упростите проведение танцевальных событий с самой удобной билетной платформой. От локальных мастер-классов до международных фестивалей.',
      cta: 'Смотреть события',
      joined: 'танцоров уже с нами',
      performanceAlt: 'Танцевальное выступление',
      userAlt: 'Пользователь',
    },
    home: {
      partners: 'Поддерживаем события по всему Казахстану',
      statsSold: 'Продано билетов в РК',
      statsOrganizers: 'Организаторов',
      statsCities: 'Крупных города',
      statsSupport: 'Локальная поддержка',
    },
    featuredEvents: {
      title: ({ city }: Record<string, string | number> = {}) => `События в ${city}`,
      description: ({ city }: Record<string, string | number> = {}) =>
        `Выбирайте и бронируйте билеты на лучшие танцевальные выступления, мастер-классы и соревнования в ${city}.`,
      emptyTitle: ({ category }: Record<string, string | number> = {}) =>
        `В вашем городе нет ${category ? `${category.toString().toLowerCase()} ` : ''}событий`,
      emptyDescription: ({ city }: Record<string, string | number> = {}) =>
        `Пока в ${city} нет событий этого направления. Но по Казахстану танцев точно хватает!`,
      exploreOtherCities: 'Посмотреть другие города',
      viewAllStyles: ({ city }: Record<string, string | number> = {}) => `Все стили в ${city}`,
      all: 'Все',
    },
    specialPrograms: {
      eyebrow: 'Особый формат',
      titleStart: 'Специальные',
      titleAccent: 'программы',
      description: ({ city }: Record<string, string | number> = {}) =>
        `Выбирайте активности внутри события: от интенсивов до недельных танцевальных лагерей в ${city}.`,
      emptyTitle: ({ category, city }: Record<string, string | number> = {}) =>
        `Нет ${category || 'специальных программ'} в ${city}`,
      emptyDescription: 'Мы постоянно обновляем программы. Загляните позже или посмотрите события в других городах.',
      all: 'Все',
      festivals: 'Фестивали',
      competitions: 'Соревнования',
      masterclasses: 'Мастер-классы',
      camps: 'Кэмпы',
    },
    features: {
      eyebrow: 'Для организаторов',
      title: 'Все, что нужно для аншлагового танцевального события',
      description: 'Инструменты, созданные специально под задачи танцевального сообщества.',
      items: [
        {
          title: 'Мобильные билеты',
          description: 'Электронные билеты с уникальными QR-кодами и удобным контролем входа прямо с телефона.',
        },
        {
          title: 'Аналитика в реальном времени',
          description: 'Отслеживайте продажи, аудиторию и эффективность маркетинга в одном месте.',
        },
        {
          title: 'Широкий охват',
          description: 'Поддержка разных валют и локальных способов оплаты для международных туров.',
        },
        {
          title: 'Безопасные платежи',
          description: 'Защищенная обработка платежей и защита от мошенничества для каждой транзакции.',
        },
        {
          title: 'Инструменты для сообщества',
          description: 'Работайте с аудиторией через предпродажи, рассылки и программы лояльности.',
        },
        {
          title: 'Быстрый запуск',
          description: 'Запускайте страницу события за считанные минуты с удобным конструктором.',
        },
      ],
    },
    testimonials: {
      title: 'Нам доверяют лучшие в индустрии',
      subtitle: 'Средняя оценка 4.9/5 от более чем 120 организаторов',
      items: [
        {
          content: 'DancePass полностью изменил то, как мы проводим ежегодный фестиваль. Сканирование QR-кодов молниеносное, а участникам нравятся мобильные билеты.',
          role: 'Президент Dance Club, Astana IT University',
        },
        {
          content: 'Инструменты аналитики действительно меняют игру. Мы видим, откуда приходят продажи, и можем быстро корректировать маркетинг.',
          role: 'Танцор с опытом более 10 лет в ballroom',
        },
        {
          content: 'Поддержка невероятная. Если возникает вопрос, ответ приходит буквально за минуты. Отличный выбор для любого организатора танцевальных событий.',
          role: 'Вице-президент Dance Club, Astana IT University',
        },
      ],
    },
    cta: {
      title: 'Готовы вывести свое событие на новый уровень?',
      description: 'Присоединяйтесь к 70+ организаторам, которые доверяют DanceTime продажи, маркетинг и управление событиями.',
      button: 'Стать организатором',
    },
    footer: {
      description: 'Ведущая билетная платформа для танцевального сообщества. Почувствуйте движение.',
      platform: 'Платформа',
      findEvents: 'Найти события',
      pricing: 'Цены',
      support: 'Поддержка',
      company: 'Компания',
      aboutUs: 'О нас',
      careers: 'Карьера',
      press: 'Пресса',
      contact: 'Контакты',
      legal: 'Правовая информация',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      cookies: 'Политика cookies',
      copyright: '© 2026 DanceTime Technologies Inc. Все права защищены.',
      status: 'Статус',
      englishUs: 'Русский',
    },
    auth: {
      welcomeBack: 'С возвращением',
      loginDescription: 'Войдите, чтобы получить доступ к билетам и избранным событиям',
      validEmail: 'Введите корректный email',
      passwordRequired: 'Пароль обязателен',
      verifyEmailFirst: 'Сначала подтвердите email. Проверьте почту или отправьте письмо повторно.',
      loginFailed: 'Не удалось войти',
      enterFullName: 'Введите полное имя',
      passwordMin: 'Пароль должен быть не короче 6 символов',
      passwordsMismatch: 'Пароли не совпадают',
      registrationFailed: 'Не удалось зарегистрироваться',
      emailRegistered: 'Этот email уже зарегистрирован',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      createAccount: 'Создать аккаунт',
      joinDanceTime: 'Присоединяйтесь к DanceTime и не пропускайте важное',
      saveTickets: 'Сохраняйте и управляйте билетами',
      fasterCheckout: 'Более быстрый процесс покупки',
      securePurchases: 'Безопасные и подтвержденные покупки',
      yourEmail: 'you@example.com',
      enterPassword: 'Введите пароль',
      yourFullName: 'Ваше полное имя',
      createPassword: 'Придумайте пароль',
      repeatPassword: 'Повторите пароль',
      signUp: 'Зарегистрироваться',
      enterEmailReset: 'Введите email для получения инструкции по сбросу',
      resetPasswordButton: 'Сбросить пароль',
      failedResetEmail: 'Не удалось отправить письмо для сброса',
      verificationSentTo: 'Мы отправили инструкции по подтверждению на',
      verificationSentAgain: 'Письмо отправлено повторно. Проверьте почту.',
      verificationResendFailed: 'Не удалось отправить письмо повторно',
      login: 'Войти',
    },
  },
  kk: {
    common: {
      home: 'Басты бет',
      events: 'Іс-шаралар',
      aboutUs: 'Біз туралы',
      forOrganizers: 'Ұйымдастырушыларға',
      signIn: 'Кіру',
      getStarted: 'Бастау',
      logout: 'Шығу',
      welcome: 'Қош келдіңіз',
      exploreAllEvents: 'Барлық іс-шаралар',
      noResults: 'Ештеңе табылмады',
      language: 'Тіл',
      selectCity: 'Қаланы таңдаңыз',
      searchCity: 'Қаланы іздеу...',
      searchCityKazakhstan: 'Қазақстан бойынша қаланы іздеу...',
      ticketsFrom: 'Билеттер бағасы',
      soldOut: 'Сатылып кетті',
      ticketsLeft: ({ count }: Record<string, string | number> = {}) => `Қалған билет саны: ${count}`,
      buyTicket: 'Билет сатып алу',
      viewDetails: 'Толығырақ',
      addToFavorites: 'Таңдаулыларға қосу',
      removeFromFavorites: 'Таңдаулылардан өшіру',
      startsAt: 'Бастапқы баға',
      backToLogin: 'Кіруге оралу',
      email: 'Электрондық пошта',
      password: 'Құпиясөз',
      fullName: 'Толық аты-жөні',
      confirmPassword: 'Құпиясөзді растау',
      resetPassword: 'Құпиясөзді қалпына келтіру',
      resendVerificationEmail: 'Растау хатын қайта жіберу',
      backToLoginCta: 'Кіруге қайту',
      sendInstructions: 'Жіберілуде...',
      sending: 'Жіберілуде...',
      creatingAccount: 'Аккаунт ашылуда...',
      loggingIn: 'Кіру...',
      becomeOrganizer: 'Ұйымдастырушы болу',
      myTickets: 'Менің билеттерім',
      favorites: 'Таңдаулылар',
      purchaseHistory: 'Сатып алу тарихы',
      accountSettings: 'Аккаунт баптаулары',
      switchToLight: 'Ашық тақырып',
      switchToDark: 'Қараңғы тақырып',
      organizerDashboard: 'Ұйымдастырушы панелі',
      adminPanel: 'Әкімші панелі',
      myEvents: 'Менің іс-шараларым',
      scanTicket: 'Билетті сканерлеу',
      continue: 'Жалғастыру',
      checkInbox: 'Поштаңызды тексеріңіз',
    },
    navbar: {
      organizerDashboard: 'Ұйымдастырушы панелі',
      adminPanel: 'Әкімші панелі',
      myEvents: 'Менің іс-шараларым',
      scanTicket: 'Билетті сканерлеу',
      forOrganizers: 'Ұйымдастырушыларға',
    },
    hero: {
      badge: 'Қазақстандағы ең үлкен би іс-шараларына билет сату платформасы',
      titleStart: 'Әрбір',
      titleAccent: 'ырғақты',
      titleEnd: 'сезін',
      description: 'Би іс-шараларын ең ыңғайлы билет жүйесімен басқарыңыз. Жергілікті шеберлік сабақтарынан халықаралық фестивальдерге дейін.',
      cta: 'Іс-шараларды көру',
      joined: 'биші бізге қосылды',
      performanceAlt: 'Би көрінісі',
      userAlt: 'Қолданушы',
    },
    home: {
      partners: 'Қазақстандағы іс-шараларды қолдаймыз',
      statsSold: 'Қазақстанда сатылған билет',
      statsOrganizers: 'Ұйымдастырушы',
      statsCities: 'Ірі қала',
      statsSupport: 'Жергілікті қолдау',
    },
    featuredEvents: {
      title: ({ city }: Record<string, string | number> = {}) => `${city} қаласындағы іс-шаралар`,
      description: ({ city }: Record<string, string | number> = {}) =>
        `${city} қаласындағы ең қызықты би қойылымдарына, мастер-класстарға және жарыстарға билеттерді таңдаңыз.`,
      emptyTitle: ({ category }: Record<string, string | number> = {}) =>
        `Сіздің қалаңызда ${category ? `${category.toString().toLowerCase()} ` : ''}іс-шаралар табылмады`,
      emptyDescription: ({ city }: Record<string, string | number> = {}) =>
        `${city} қаласында бұл бағыт бойынша іс-шара әзірге жоқ. Бірақ Қазақстанда би өмірі қызу жүріп жатыр!`,
      exploreOtherCities: 'Басқа қалаларды көру',
      viewAllStyles: ({ city }: Record<string, string | number> = {}) => `${city} қаласындағы барлық стильдер`,
      all: 'Барлығы',
    },
    specialPrograms: {
      eyebrow: 'Арнайы формат',
      titleStart: 'Арнайы',
      titleAccent: 'бағдарламалар',
      description: ({ city }: Record<string, string | number> = {}) =>
        `${city} қаласындағы интенсивтерден бастап апталық би лагерьлеріне дейінгі белсенділіктерді таңдаңыз.`,
      emptyTitle: ({ category, city }: Record<string, string | number> = {}) =>
        `${city} қаласында ${category || 'арнайы бағдарламалар'} жоқ`,
      emptyDescription: 'Бағдарламалар үнемі жаңартылып тұрады. Кейінірек кіріп көріңіз немесе басқа қалаларды қараңыз.',
      all: 'Барлығы',
      festivals: 'Фестивальдер',
      competitions: 'Жарыстар',
      masterclasses: 'Мастер-класстар',
      camps: 'Лагерьлер',
    },
    features: {
      eyebrow: 'Ұйымдастырушылар үшін',
      title: 'Аншлагпен өтетін би іс-шарасын өткізуге керек нәрсенің бәрі',
      description: 'Би қауымдастығының нақты қажеттіліктеріне арналған құралдар.',
      items: [
        {
          title: 'Мобильді билет жүйесі',
          description: 'Бірегей QR-коды бар электронды билеттер және телефоннан ыңғайлы кіру бақылауы.',
        },
        {
          title: 'Нақты уақыттағы аналитика',
          description: 'Сатылымды, аудиторияны және маркетинг тиімділігін бір жерден бақылаңыз.',
        },
        {
          title: 'Кең ауқым',
          description: 'Халықаралық турларға арналған түрлі валюталар мен жергілікті төлем тәсілдерін қолдау.',
        },
        {
          title: 'Қауіпсіз төлемдер',
          description: 'Әр транзакция үшін қорғалған төлем өңдеуі және алаяқтықтан қорғау.',
        },
        {
          title: 'Қауымдастық құралдары',
          description: 'Алдын ала сату, хаттар және адалдық бағдарламалары арқылы аудиториямен байланыс орнатыңыз.',
        },
        {
          title: 'Жылдам іске қосу',
          description: 'Ыңғайлы конструктормен іс-шара бетін бірнеше минутта іске қосыңыз.',
        },
      ],
    },
    testimonials: {
      title: 'Саладағы үздіктер бізге сенеді',
      subtitle: '120-дан астам ұйымдастырушыдан орташа баға 4.9/5',
      items: [
        {
          content: 'DancePass біздің жыл сайынғы фестивальді басқару тәсілімізді толығымен өзгертті. QR сканерлеу өте жылдам, ал қатысушыларға мобильді билеттер ұнайды.',
          role: 'Dance Club президенті, Astana IT University',
        },
        {
          content: 'Аналитика құралдары шынымен көп көмектеседі. Билет сатылымы қайдан келетінін көріп, маркетингті бірден түзете аламыз.',
          role: '10+ жылдық ballroom тәжірибесі бар биші',
        },
        {
          content: 'Қолдау қызметі керемет. Сұрақ туындаса, бірнеше минут ішінде жауап береді. Кез келген би іс-шарасын ұйымдастырушыға ұсынамын.',
          role: 'Dance Club вице-президенті, Astana IT University',
        },
      ],
    },
    cta: {
      title: 'Іс-шараңызды келесі деңгейге көтеруге дайынсыз ба?',
      description: '70-тен астам ұйымдастырушы DanceTime платформасына билет сату, маркетинг және басқару үшін сенім артады.',
      button: 'Ұйымдастырушы болу',
    },
    footer: {
      description: 'Би қауымдастығына арналған жетекші билет платформасы. Қозғалысты сезініңіз.',
      platform: 'Платформа',
      findEvents: 'Іс-шараларды табу',
      pricing: 'Бағалар',
      support: 'Қолдау',
      company: 'Компания',
      aboutUs: 'Біз туралы',
      careers: 'Мансап',
      press: 'Баспасөз',
      contact: 'Байланыс',
      legal: 'Құқықтық ақпарат',
      privacy: 'Құпиялық саясаты',
      terms: 'Қызмет көрсету шарттары',
      cookies: 'Cookie саясаты',
      copyright: '© 2026 DanceTime Technologies Inc. Барлық құқықтар қорғалған.',
      status: 'Күйі',
      englishUs: 'Қазақша',
    },
    auth: {
      welcomeBack: 'Қайта қош келдіңіз',
      loginDescription: 'Билеттер мен таңдаулы іс-шараларға қол жеткізу үшін кіріңіз',
      validEmail: 'Жарамды email енгізіңіз',
      passwordRequired: 'Құпиясөз міндетті',
      verifyEmailFirst: 'Алдымен email растаңыз. Поштаңызды тексеріңіз немесе хатты қайта жіберіңіз.',
      loginFailed: 'Кіру сәтсіз аяқталды',
      enterFullName: 'Толық атыңызды енгізіңіз',
      passwordMin: 'Құпиясөз кемінде 6 таңбадан тұруы керек',
      passwordsMismatch: 'Құпиясөздер сәйкес келмейді',
      registrationFailed: 'Тіркелу сәтсіз аяқталды',
      emailRegistered: 'Бұл email бұрыннан тіркелген',
      forgotPassword: 'Құпиясөзді ұмыттыңыз ба?',
      noAccount: 'Аккаунтыңыз жоқ па?',
      createAccount: 'Аккаунт ашу',
      joinDanceTime: 'DanceTime-ға қосылып, маңызды сәттерді жіберіп алмаңыз',
      saveTickets: 'Билеттерді сақтап, басқарыңыз',
      fasterCheckout: 'Жылдамырақ сатып алу процесі',
      securePurchases: 'Қауіпсіз және расталған сатып алулар',
      yourEmail: 'you@example.com',
      enterPassword: 'Құпиясөзіңізді енгізіңіз',
      yourFullName: 'Толық аты-жөніңіз',
      createPassword: 'Құпиясөз ойлап табыңыз',
      repeatPassword: 'Құпиясөзді қайталаңыз',
      signUp: 'Тіркелу',
      enterEmailReset: 'Қалпына келтіру нұсқаулығын алу үшін email енгізіңіз',
      resetPasswordButton: 'Құпиясөзді қалпына келтіру',
      failedResetEmail: 'Қалпына келтіру хатын жіберу мүмкін болмады',
      verificationSentTo: 'Растау нұсқаулығы мына поштаға жіберілді',
      verificationSentAgain: 'Хат қайта жіберілді. Поштаңызды тексеріңіз.',
      verificationResendFailed: 'Растау хатын қайта жіберу мүмкін болмады',
      login: 'Кіру',
    },
  },
} as const;

type TranslationTree = typeof translations.en;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const getValue = (tree: TranslationTree, key: string): TranslationValue | undefined => {
  return key.split('.').reduce<any>((acc, part) => acc?.[part], tree);
};

export const languageLabels: Record<Language, string> = {
  en: 'EN',
  ru: 'РУС',
  kk: 'ҚАЗ',
};

export const I18nProvider: React.FC<{ children: React.ReactNode; userLanguage?: Language | null }> = ({
  children,
  userLanguage,
}) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLanguage = window.localStorage.getItem('danceapp:language') as Language | null;
    const nextLanguage = storedLanguage || userLanguage || 'en';
    setLanguageState(nextLanguage);
  }, [userLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('danceapp:language', language);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (key, params) => {
      const languageTree = translations[language] || translations.en;
      const value = getValue(languageTree, key) ?? getValue(translations.en, key);
      if (typeof value === 'function') {
        return value(params);
      }
      return value ?? key;
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
