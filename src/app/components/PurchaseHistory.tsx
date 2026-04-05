import React from 'react';
import { ShoppingBag, Calendar, MapPin, CreditCard, Download, CheckCircle2, Clock } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
          <ShoppingBag className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">No Purchase History</h2>
        <p className="text-gray-400 mb-8">
          You haven't purchased any tickets yet. Start exploring amazing dance events!
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Purchase History</h1>
          <p className="text-gray-400">{purchases.length} order{purchases.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-6">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-800/50 px-6 py-4 border-b border-purple-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-gray-400 text-sm">Order ID</p>
                <p className="text-white font-mono font-medium">{purchase.id}</p>
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
                <h3 className="text-xl font-bold text-white mb-4">{purchase.event}</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Event Date</span>
                    </div>
                    <p className="text-white">{formatDate(purchase.date)}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Venue</span>
                    </div>
                    <p className="text-white">{purchase.venue}, {purchase.city}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Purchase Date</span>
                    </div>
                    <p className="text-white">{formatDate(purchase.purchaseDate)}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Tickets</span>
                    </div>
                    <p className="text-white">{purchase.tickets}x {purchase.ticketType}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-white">{formatPrice(purchase.total)}</p>
                  </div>
                  <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                    <Download className="w-4 h-4" />
                    Download Receipt
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
