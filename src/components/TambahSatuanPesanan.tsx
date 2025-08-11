import { useState } from "react";
import { Icon } from "@iconify/react";
import Notification from "./Notification";

interface QuantityModalProps {
  show: boolean;
  pesananId: number;
  namaPelanggan: string;
  layananHarga: number; // Harga per item
  layananNama: string;
  onClose: () => void;
  onConfirm: (quantity: number, totalHarga: number) => void;
}

export default function QuantityModal({
  show,
  pesananId,
  namaPelanggan,
  layananHarga,
  layananNama,
  onClose,
  onConfirm,
}: QuantityModalProps) {
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, show: false }));

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateTotalPrice = () => {
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) return 0;
    return quantityNum * layananHarga;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantityNum = parseInt(quantity);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      setNotification({
        show: true,
        message: "Jumlah harus diisi dengan nilai yang valid (lebih dari 0)",
        type: "error",
      });
      return;
    }

    if (quantityNum > 999) {
      setNotification({
        show: true,
        message: "Jumlah tidak boleh lebih dari 999 item",
        type: "error",
      });
      return;
    }

    const totalHarga = calculateTotalPrice();
    setLoading(true);

    // Call the parent function to handle the actual update
    onConfirm(quantityNum, totalHarga);
  };

  const handleClose = () => {
    setQuantity("1");
    setNotification({ show: false, message: "", type: "success" });
    onClose();
  };

  const incrementQuantity = () => {
    const current = parseInt(quantity) || 1;
    if (current < 999) {
      setQuantity((current + 1).toString());
    }
  };

  const decrementQuantity = () => {
    const current = parseInt(quantity) || 1;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(999, value)).toString());
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Input Jumlah & Kalkulasi Harga
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <Icon icon="mdi:close" width={24} />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Pesanan:</div>
            <div className="font-medium">{namaPelanggan}</div>
            <div className="text-sm text-gray-600 mt-1">
              Layanan: {layananNama}
            </div>
            <div className="text-sm text-gray-600">
              Harga per item: {formatRupiah(layananHarga)}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Item *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={loading || parseInt(quantity) <= 1}
                  className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon icon="mdi:minus" width={18} />
                </button>
                
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="999"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                  autoFocus
                />
                
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={loading || parseInt(quantity) >= 999}
                  className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon icon="mdi:plus" width={18} />
                </button>
                
                <div className="flex-1 text-sm text-gray-600">
                  = <span className="font-medium text-green-600">
                    {formatRupiah(calculateTotalPrice())}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Minimal 1 item, maksimal 999 item
              </div>
            </div>

            {quantity &&
              !isNaN(parseInt(quantity)) &&
              parseInt(quantity) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Kalkulasi Harga:
                  </div>
                  <div className="text-sm text-blue-700">
                    {parseInt(quantity)} item × {formatRupiah(layananHarga)} =
                    <span className="font-bold ml-1">
                      {formatRupiah(calculateTotalPrice())}
                    </span>
                  </div>
                </div>
              )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  loading ||
                  !quantity ||
                  isNaN(parseInt(quantity)) ||
                  parseInt(quantity) <= 0
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Icon
                      icon="eos-icons:loading"
                      width={20}
                      className="mr-2"
                    />
                    Memproses...
                  </span>
                ) : (
                  "Selesaikan Pesanan"
                )}
              </button>
            </div>
          </form>

          {notification.show && (
            <div className="mt-4">
              <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}