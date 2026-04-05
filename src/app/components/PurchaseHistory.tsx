import React from 'react';
import { ShoppingBag, Calendar, MapPin, CreditCard, Download, CheckCircle2, Clock } from 'lucide-react';
import { useI18n } from '../i18n';

type PurchaseItem = {
  id: string;
  event: string;
  date: string;
  venue: string;
  city: string;
  tickets: number;
  ticketType: string;
  total: number;
  purchaseDate: string;
  status: string;
  image: string;
};

interface PurchaseHistoryProps {
  purchases: PurchaseItem[];
}

export const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ purchases }) => {
  const { language } = useI18n();
  const copy = {
    emptyTitle: language === 'ru' ? 'История покупок пуста' : language === 'kk' ? 'Сатып алу тарихы бос' : 'No Purchase History',
    emptyText: language === 'ru' ? 'Вы еще не покупали билеты. Начните изучать танцевальные события!' : language === 'kk' ? 'Сіз әлі билет сатып алған жоқсыз. Би іс-шараларын қарап шығыңыз!' : "You haven't purchased any tickets yet. Start exploring amazing dance events!",
    browse: language === 'ru' ? 'Смотреть события' : language === 'kk' ? 'Іс-шараларды көру' : 'Browse Events',
    title: language === 'ru' ? 'История покупок' : language === 'kk' ? 'Сатып алу тарихы' : 'Purchase History',
    orders: language === 'ru' ? 'заказов' : language === 'kk' ? 'тапсырыс' : 'orders',
    orderId: language === 'ru' ? 'Номер заказа' : language === 'kk' ? 'Тапсырыс нөмірі' : 'Order ID',
    eventDate: language === 'ru' ? 'Дата события' : language === 'kk' ? 'Іс-шара күні' : 'Event Date',
    venue: language === 'ru' ? 'Место' : language === 'kk' ? 'Өтетін орны' : 'Venue',
    purchaseDate: language === 'ru' ? 'Дата покупки' : language === 'kk' ? 'Сатып алу күні' : 'Purchase Date',
    tickets: language === 'ru' ? 'Билеты' : language === 'kk' ? 'Билеттер' : 'Tickets',
    totalAmount: language === 'ru' ? 'Общая сумма' : language === 'kk' ? 'Жалпы сома' : 'Total Amount',
    receipt: language === 'ru' ? 'Скачать чек' : language === 'kk' ? 'Чекті жүктеу' : 'Download Receipt',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (purchases.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-[rgba(108,82,193,0.16)] dark:bg-purple-600/20">
          <ShoppingBag className="w-10 h-10 text-primary dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4 dark:text-white">{copy.emptyTitle}</h2>
        <p className="text-muted-foreground mb-8 dark:text-gray-400">
          {copy.emptyText}
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40">
          {copy.browse}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 dark:text-white">{copy.title}</h1>
          <p className="text-muted-foreground dark:text-gray-400">{purchases.length} {copy.orders}</p>
        </div>
      </div>

      <div className="space-y-6">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="surface-card rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border bg-[rgba(94,72,166,0.12)] px-6 py-4 sm:flex-row sm:items-center dark:border-purple-500/20 dark:bg-gray-800/50">
              <div>
                <p className="text-muted-foreground text-sm dark:text-gray-400">{copy.orderId}</p>
                <p className="text-foreground font-mono font-medium dark:text-white">{purchase.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium capitalize">{purchase.status}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
                <img
                  src={purchase.image}
                  alt={purchase.event}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 dark:text-white">{purchase.event}</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-primary dark:text-purple-400" />
                      <span className="text-sm">{copy.eventDate}</span>
                    </div>
                    <p className="text-foreground dark:text-white">{formatDate(purchase.date)}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-primary dark:text-purple-400" />
                      <span className="text-sm">{copy.venue}</span>
                    </div>
                    <p className="text-foreground dark:text-white">{purchase.venue}, {purchase.city}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 dark:text-gray-400">
                      <CreditCard className="w-4 h-4 text-primary dark:text-purple-400" />
                      <span className="text-sm">{copy.purchaseDate}</span>
                    </div>
                    <p className="text-foreground dark:text-white">{formatDate(purchase.purchaseDate)}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-primary dark:text-purple-400" />
                      <span className="text-sm">{copy.tickets}</span>
                    </div>
                    <p className="text-foreground dark:text-white">{purchase.tickets}x {purchase.ticketType}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center dark:border-gray-800">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1 dark:text-gray-400">{copy.totalAmount}</p>
                    <p className="text-2xl font-bold text-foreground dark:text-white">{formatPrice(purchase.total)}</p>
                  </div>
                  <button className="flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-300 bg-[rgba(94,72,166,0.12)] text-foreground hover:bg-[rgba(94,72,166,0.18)] dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                    <Download className="w-4 h-4" />
                    {copy.receipt}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
