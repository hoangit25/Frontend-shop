
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

type PaymentMethod = "CARD" | "COD";

const initialItems: CartItem[] = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "Noise Cancelling Edition",
    price: 249,
    quantity: 1,
    image:
      "http://localhost:5173/local-assets/asset_6afbe1e634bcc910af95397e.png",
  },
  {
    id: 2,
    name: "Slim Protective Carry Case",
    description: "Matte Black",
    price: 29,
    quantity: 1,
    image:
      "http://localhost:5173/local-assets/asset_25d1254d27a1a2f9539bedde.png",
  },
];

const initialForm: ShippingForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [saveAddress, setSaveAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CARD");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = 12;
  const tax = 20.85;

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const total = subtotal + shipping + tax;

  // Update product quantity
  const updateQuantity = (id: number, delta: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item
      )
    );
  };

  // Handle shipping form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkout
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (items.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const orderPayload = {
        shippingInfo: form,
        items,
        paymentMethod,
        saveAddress,
        subtotal,
        shipping,
        tax,
        total,
      };

      console.log("Order payload:", orderPayload);

      /*
        TODO:
        Gọi API tạo đơn hàng tại đây.

        Ví dụ:

        const response = await createOrderMutation.mutateAsync(
          orderPayload
        );

        const orderId = response.data.order._id;
      */

      // ID demo - thay bằng ID trả về từ backend.
      const orderId = "YOUR_ORDER_ID";

      // Redirect based on payment method
      if (paymentMethod === "CARD") {
        navigate(`/payment/${orderId}`);
      } else {
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/70 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5";

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      {/* Header */}
      <header className="mx-auto mb-8 flex w-full max-w-7xl items-center justify-between">

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <span className="text-lg">←</span>
          <span className="hidden sm:inline">Back to Cart</span>
          <span className="sm:hidden">Cart</span>
        </Link>

        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="http://localhost:5173/local-assets/asset_f0734f5f6778c82a1ae802ad.png"
            alt="Checkoutly"
            className="h-10 w-10 rounded-xl object-cover"
          />

          <span className="text-xl font-bold tracking-tight text-gray-900">
            Checkoutly
          </span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:text-sm">
          <span className="hidden sm:inline">Secure Checkout</span>
          <span className="text-green-600">✓</span>
        </div>
      </header>

      {/* Page title */}
      <div className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Checkout
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Complete your information to place your order.
        </p>
      </div>

      {/* Main content */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8"
      >

        {/* ================= SHIPPING INFORMATION ================= */}
        <section className="flex min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7 lg:p-8">

          {/* Section heading */}
          <div className="mb-7 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  📦
                </span>

                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Shipping Information
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Enter your delivery details below.
              </p>
            </div>

            <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 sm:block">
              Step 1 of 2
            </span>
          </div>

          <div className="mb-7 h-px w-full bg-gray-100" />

          {/* Shipping Form Fields */}
          <div className="space-y-5">

            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* Email and phone */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="min-w-0">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+84 123 456 789"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Street Address <span className="text-red-500">*</span>
              </label>

              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                placeholder="House number, street name..."
                value={form.address}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* City and postal code */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  City / Province <span className="text-red-500">*</span>
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Postal Code
                </label>

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="Enter postal code"
                  value={form.postalCode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ================= PAYMENT METHOD ================= */}
          <div className="mt-8 border-t border-gray-100 pt-7">

            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  💳
                </span>

                <h3 className="text-base font-bold text-gray-900">
                  Payment Method
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Choose your preferred payment method.
              </p>
            </div>

            <div className="space-y-3">

              {/* Credit / Debit Card */}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200 sm:gap-4 ${
                  paymentMethod === "CARD"
                    ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="h-4 w-4 shrink-0 accent-gray-900"
                />

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  💳
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Credit / Debit Card
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Secure payment using your credit or debit card.
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-blue-800">
                      VISA
                    </span>

                    <span className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-red-600">
                      MASTER
                    </span>
                  </div>
                </div>

                {paymentMethod === "CARD" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                    ✓
                  </span>
                )}
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200 sm:gap-4 ${
                  paymentMethod === "COD"
                    ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="h-4 w-4 shrink-0 accent-gray-900"
                />

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                  🚚
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Cash on Delivery (COD)
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Pay with cash when your order is delivered.
                  </p>
                </div>

                {paymentMethod === "COD" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                    ✓
                  </span>
                )}
              </label>

            </div>
          </div>

          {/* Save address */}
          <div className="mt-7 border-t border-gray-100 pt-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-gray-900"
              />

              <span className="text-sm leading-5 text-gray-600">
                Save this address for future purchases
              </span>
            </label>
          </div>

          {/* Security note */}
          <div className="mt-auto pt-8">
            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <span className="text-lg">🔒</span>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Your information is secure
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your personal information is protected and will only
                  be used to process your order.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ORDER SUMMARY ================= */}
        <section className="flex min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7 lg:p-8">

          {/* Section heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg">
                🛒
              </span>

              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Order Summary
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Review your items before payment.
            </p>
          </div>

          <div className="mb-6 h-px w-full bg-gray-100" />

          {/* Cart items */}
          <div className="mb-7 space-y-5">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Your Items
              </h3>

              <span className="text-xs font-medium text-gray-400">
                {items.length} products
              </span>
            </div>

            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-0 gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0 sm:gap-4"
                >
                  {/* Product image */}
                  <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
                          {item.name}
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 items-center overflow-hidden rounded-lg border border-gray-200">

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="flex h-full w-8 items-center justify-center text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-full w-8 items-center justify-center text-gray-500 transition hover:bg-gray-100"
                        >
                          +
                        </button>

                      </div>

                      <span className="text-xs text-gray-400">
                        Total: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                Your cart is empty.
              </p>
            )}

          </div>

          {/* Price details */}
          <div className="space-y-4 border-t border-gray-100 pt-6">

            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              Payment Details
            </h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>

              <span className="font-semibold text-gray-800">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Shipping Fee</span>

              <span className="font-semibold text-gray-800">
                {formatPrice(shipping)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tax</span>

              <span className="font-semibold text-gray-800">
                {formatPrice(tax)}
              </span>
            </div>

          </div>

          {/* Total */}
          <div className="mt-6 flex items-center justify-between border-t border-dashed border-gray-200 pt-6">
            <div>
              <p className="text-base font-bold text-gray-900">
                Total Amount
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Including all taxes and fees
              </p>
            </div>

            <span className="text-2xl font-bold tracking-tight text-gray-900">
              {formatPrice(total)}
            </span>
          </div>

          {/* Checkout button */}
          <div className="mt-7">
            <button
              type="submit"
              disabled={items.length === 0 || isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : paymentMethod === "CARD"
                  ? "Continue to Payment"
                  : "Place Order (COD)"}

              {!isSubmitting && (
                <span className="text-lg">→</span>
              )}
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
              <span>🔒</span>

              {paymentMethod === "CARD"
                ? "Secure and encrypted checkout"
                : "Pay when your order arrives"}
            </p>
          </div>

        </section>
      </form>

      {/* Footer */}
      <footer className="mx-auto mt-10 max-w-7xl border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Checkoutly. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
