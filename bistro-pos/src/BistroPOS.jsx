import React, { useState, useEffect, useMemo } from "react";
import {
  Coffee, UtensilsCrossed, Cookie, Salad, Search, Plus, Minus, X,
  ShoppingCart, CreditCard, Wallet, Banknote, Printer, Check, Percent,
  StickyNote, Clock, Users, Store, Trash2, Receipt, CheckCircle2,
  ArrowLeft, ChevronDown, Flame
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "drinks", label: "Coffee & Drinks" },
  { id: "mains", label: "Main Dishes" },
  { id: "desserts", label: "Desserts" },
  { id: "sides", label: "Sides" },
];

const CATEGORY_STYLE = {
  drinks: { icon: Coffee, bg: "bg-amber-500", ring: "ring-amber-400/40", text: "text-amber-600" },
  mains: { icon: UtensilsCrossed, bg: "bg-rose-500", ring: "ring-rose-400/40", text: "text-rose-600" },
  desserts: { icon: Cookie, bg: "bg-fuchsia-500", ring: "ring-fuchsia-400/40", text: "text-fuchsia-600" },
  sides: { icon: Salad, bg: "bg-emerald-500", ring: "ring-emerald-400/40", text: "text-emerald-600" },
};

const MENU_ITEMS = [
  { id: 1, name: "Espresso", price: 3.25, category: "drinks", tag: "Signature" },
  { id: 2, name: "Cappuccino", price: 4.5, category: "drinks" },
  { id: 3, name: "Iced Latte", price: 4.75, category: "drinks" },
  { id: 4, name: "Matcha Latte", price: 5.25, category: "drinks" },
  { id: 5, name: "Fresh Orange Juice", price: 4.0, category: "drinks" },
  { id: 6, name: "Sparkling Water", price: 2.5, category: "drinks" },
  { id: 7, name: "Truffle Burger", price: 13.5, category: "mains", tag: "Popular" },
  { id: 8, name: "Grilled Salmon", price: 16.0, category: "mains" },
  { id: 9, name: "Margherita Pizza", price: 12.0, category: "mains" },
  { id: 10, name: "Chicken Alfredo", price: 14.25, category: "mains" },
  { id: 11, name: "Veggie Wrap", price: 9.5, category: "mains" },
  { id: 12, name: "Tiramisu", price: 6.5, category: "desserts", tag: "Popular" },
  { id: 13, name: "Chocolate Lava Cake", price: 7.0, category: "desserts" },
  { id: 14, name: "Cheesecake Slice", price: 6.25, category: "desserts" },
  { id: 15, name: "Sweet Potato Fries", price: 4.75, category: "sides" },
  { id: 16, name: "Garden Salad", price: 5.5, category: "sides" },
  { id: 17, name: "Garlic Bread", price: 3.75, category: "sides" },
  { id: 18, name: "Onion Rings", price: 4.25, category: "sides" },
];

const TAX_RATE = 0.1;
const DISCOUNT_RATE = 0.1;
const EXCHANGE_RATES = {
  USD: 1,
  PHP: 56.5,
};

const CURRENCY_LOCALES = {
  USD: "en-US",
  PHP: "en-PH",
};

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "E-Wallet", icon: Wallet },
];

const currency = (amountInUsd, currencyCode = "USD") => {
  const convertedAmount = amountInUsd * EXCHANGE_RATES[currencyCode];
  return new Intl.NumberFormat(CURRENCY_LOCALES[currencyCode], {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function BistroPOS() {
  const [orderType, setOrderType] = useState("Dine-in");
  const [tableNumber, setTableNumber] = useState(4);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [discountOn, setDiscountOn] = useState(false);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receipt, setReceipt] = useState(null);
  const [orderCounter, setOrderCounter] = useState(1042);
  const [flashItemId, setFlashItemId] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setFlashItemId(item.id);
    setTimeout(() => setFlashItemId(null), 350);
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const clearOrder = () => {
    setCart([]);
    setDiscountOn(false);
    setNote("");
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const discountAmount = discountOn ? subtotal * DISCOUNT_RATE : 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const displayMoney = (amountInUsd) => currency(amountInUsd, selectedCurrency);

  const completeSale = () => {
    const orderNumber = `BP-${orderCounter}`;
    setOrderCounter((n) => n + 1);
    setReceipt({
      orderNumber,
      timestamp: new Date(),
      orderType,
      tableNumber,
      items: cart,
      subtotal,
      discountAmount,
      tax,
      total,
      paymentMethod,
      note,
      currencyCode: selectedCurrency,
    });
    setPaymentOpen(false);
  };

  const startNewOrder = () => {
    setReceipt(null);
    clearOrder();
  };

  return (
    <div className="min-h-screen w-full bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* -------------------------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------------------------- */}
      <header className="bg-slate-950 text-stone-100 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 sm:gap-6 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center">
            <Store className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <h1 className="font-serif text-lg sm:text-xl tracking-tight">Bistro Food POS</h1>
            <p className="text-[11px] text-stone-400 -mt-0.5">Bulacan Restaurant</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 ml-0 sm:ml-4">
          {["Dine-in", "Takeout", "Delivery"].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                orderType === type
                  ? "bg-amber-500 text-slate-950"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {orderType === "Dine-in" && (
          <div className="relative">
            <button
              onClick={() => setTablePickerOpen((o) => !o)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-200 transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              Table {tableNumber}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            {tablePickerOpen && (
              <div className="absolute z-20 mt-1 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl p-2 grid grid-cols-5 gap-1">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setTableNumber(n);
                      setTablePickerOpen(false);
                    }}
                    className={`h-8 rounded-md text-xs font-medium ${
                      tableNumber === n
                        ? "bg-amber-500 text-slate-950"
                        : "text-stone-300 hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          {["USD", "PHP"].map((code) => (
            <button
              key={code}
              onClick={() => setSelectedCurrency(code)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                selectedCurrency === code
                  ? "bg-amber-500 text-slate-950"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 text-stone-300 text-xs sm:text-sm">
          <Clock className="h-4 w-4" />
          <span className="tabular-nums">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-stone-500 hidden sm:inline">
            {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </header>

      {/* -------------------------------------------------------------- */}
      {/* Body */}
      {/* -------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Menu panel */}
        <main className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat.id
                    ? "bg-slate-950 text-white border-slate-950"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const style = CATEGORY_STYLE[item.category];
              const Icon = style.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`group text-left bg-white rounded-2xl border border-stone-200 p-3.5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all ${
                    flashItemId === item.id ? "ring-2 ring-amber-400" : ""
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl ${style.bg} flex items-center justify-center shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-semibold text-stone-800 leading-snug">{item.name}</p>
                    </div>
                    {item.tag && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${style.text} mt-1`}>
                        <Flame className="h-3 w-3" /> {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">{displayMoney(item.price)}</span>
                    <span className="h-7 w-7 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-16 text-stone-400 text-sm">
                No items match "{search}".
              </div>
            )}
          </div>
        </main>

        {/* Cart panel */}
        <aside className="w-full lg:w-[380px] shrink-0 bg-slate-950 text-stone-100 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 min-h-0">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-amber-400" />
              <h2 className="font-semibold text-sm">Current Order</h2>
              <span className="text-[11px] bg-white/10 rounded-full px-2 py-0.5 text-stone-300">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={clearOrder}
              disabled={cart.length === 0}
              className="text-[11px] text-stone-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-stone-400 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 min-h-[120px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 gap-2 py-10">
                <ShoppingCart className="h-8 w-8 opacity-30" />
                <p className="text-xs">Tap a menu item to add it to the order.</p>
              </div>
            ) : (
              <ul className="space-y-2.5 pb-2">
                {cart.map((c) => (
                  <li key={c.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[11px] text-stone-400">{displayMoney(c.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-1 py-1">
                      <button
                        onClick={() => changeQty(c.id, -1)}
                        className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-xs font-semibold tabular-nums">{c.qty}</span>
                      <button
                        onClick={() => changeQty(c.id, 1)}
                        className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold w-14 text-right tabular-nums">
                      {displayMoney(c.price * c.qty)}
                    </span>
                    <button
                      onClick={() => removeItem(c.id)}
                      className="text-stone-500 hover:text-rose-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-5 pt-3 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setDiscountOn((d) => !d)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2 border transition-colors ${
                  discountOn
                    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                    : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                }`}
              >
                <Percent className="h-3.5 w-3.5" /> Discount 10%
              </button>
              <button
                onClick={() => {
                  setNoteDraft(note);
                  setNoteOpen(true);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2 border transition-colors ${
                  note
                    ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                    : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                }`}
              >
                <StickyNote className="h-3.5 w-3.5" /> {note ? "Note added" : "Add note"}
              </button>
            </div>

            <div className="space-y-1.5 text-sm border-t border-white/10 pt-3">
              <div className="flex justify-between text-stone-300">
                <span>Subtotal</span>
                <span className="tabular-nums">{displayMoney(subtotal)}</span>
              </div>
              {discountOn && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount (10%)</span>
                  <span className="tabular-nums">-{displayMoney(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-300">
                <span>Tax (10%)</span>
                <span className="tabular-nums">{displayMoney(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-1.5 border-t border-white/10 mt-1.5">
                <span>Total</span>
                <span className="tabular-nums text-amber-400">{displayMoney(total)}</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-4 shrink-0">
            <button
              onClick={() => cart.length > 0 && setPaymentOpen(true)}
              disabled={cart.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-stone-500 text-slate-950 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="h-4.5 w-4.5" /> Pay Now &middot; {displayMoney(total)}
            </button>
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Note modal */}
      {/* -------------------------------------------------------------- */}
      {noteOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <StickyNote className="h-4 w-4" /> Order note
            </h3>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="e.g. No onions, extra napkins..."
              rows={3}
              className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setNoteOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNote(noteDraft.trim());
                  setNoteOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-950 bg-amber-500 hover:bg-amber-400"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Payment modal */}
      {/* -------------------------------------------------------------- */}
      {paymentOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-semibold text-stone-900">Choose payment method</h3>
              <button onClick={() => setPaymentOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      paymentMethod === m.id
                        ? "border-amber-400 bg-amber-50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <span
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        paymentMethod === m.id ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-stone-800">{m.label}</span>
                    {paymentMethod === m.id && <Check className="h-4.5 w-4.5 text-amber-500" />}
                  </button>
                );
              })}

              <div className="flex justify-between text-sm text-stone-500 pt-2">
                <span>Amount due</span>
                <span className="font-bold text-stone-900 text-base">{displayMoney(total)}</span>
              </div>

              <button
                onClick={completeSale}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 className="h-4.5 w-4.5" /> Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Receipt modal */}
      {/* -------------------------------------------------------------- */}
      {receipt && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-dashed border-stone-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-stone-800">
                <Receipt className="h-4.5 w-4.5" />
                <h3 className="font-semibold">Digital Receipt</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Paid
              </span>
            </div>

            <div className="overflow-y-auto px-6 py-5 font-mono text-[13px] text-stone-700 leading-relaxed">
              <div className="text-center mb-4">
                <p className="font-serif text-lg font-bold text-stone-900">Bistro Food POS</p>
                <p className="text-[11px] text-stone-400">123 Market Street &middot; (555) 010-2938</p>
              </div>
              <div className="border-t border-dashed border-stone-300 my-3" />
              <div className="flex justify-between text-[12px]">
                <span>Order #</span>
                <span>{receipt.orderNumber}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span>Date</span>
                <span>{receipt.timestamp.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span>Time</span>
                <span>{receipt.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span>Service</span>
                <span>
                  {receipt.orderType}
                  {receipt.orderType === "Dine-in" ? ` · Table ${receipt.tableNumber}` : ""}
                </span>
              </div>
              <div className="border-t border-dashed border-stone-300 my-3" />
              {receipt.items.map((it) => (
                <div key={it.id} className="flex justify-between mb-1">
                  <span className="truncate pr-2">
                    {it.qty} &times; {it.name}
                  </span>
                  <span className="tabular-nums shrink-0">{currency(it.price * it.qty, receipt.currencyCode)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-stone-300 my-3" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{currency(receipt.subtotal, receipt.currencyCode)}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="tabular-nums">-{currency(receipt.discountAmount, receipt.currencyCode)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="tabular-nums">{currency(receipt.tax, receipt.currencyCode)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-sm mt-1">
                <span>Total</span>
                <span className="tabular-nums">{currency(receipt.total, receipt.currencyCode)}</span>
              </div>
              <div className="border-t border-dashed border-stone-300 my-3" />
              <div className="flex justify-between text-[12px] capitalize">
                <span>Payment method</span>
                <span>{receipt.paymentMethod}</span>
              </div>
              {receipt.note && (
                <p className="text-[11px] text-stone-500 mt-3 italic">Note: {receipt.note}</p>
              )}
              <p className="text-center text-[11px] text-stone-400 mt-5">Thank you for dining with us!</p>
            </div>

            <div className="p-4 border-t border-stone-100 flex gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <button
                onClick={startNewOrder}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-950 bg-amber-500 hover:bg-amber-400 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
