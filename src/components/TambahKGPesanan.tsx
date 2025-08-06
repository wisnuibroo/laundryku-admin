import { useState } from "react";
import { Icon } from "@iconify/react";
import Notification from "./Notification";

interface WeightPriceModalProps {
  show: boolean;
  pesananId: number;
  namaPelanggan: string;
  layananHarga: number; // Harga per kg for Kiloan or per item for Satuan
  layananNama: string;
  layananTipe: "Kiloan" | "Satuan"; // New prop to determine service type
  onClose: () => void;
  onConfirm: (beratOrQuantity: number, totalHarga: number) => void;
}

export default function WeightPriceModal({
  show,
  pesananId,
  namaPelanggan,
  layananHarga,
  layananNama,
  layananTipe,
  onClose,
  onConfirm,
}: WeightPriceModalProps) {
  const [beratOrQuantity, setBeratOrQuantity] = useState<string>(
    layananTipe === "Satuan" ? "1" : ""
  );
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
    const valueNum = parseFloat(beratOrQuantity);
    if (isNaN(valueNum) || valueNum <= 0) return 0;
    return valueNum * layananHarga;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valueNum = parseFloat(beratOrQuantity);

    if (isNaN(valueNum) || valueNum <= 0) {
      setNotification({
        show: true,
        message: `${
          layananTipe === "Kiloan" ? "Berat" : "Jumlah"
        } harus diisi dengan nilai yang valid (lebih dari 0)`,
        type: "error",
      });
      return;
    }

    if (layananTipe === "Kiloan" && valueNum > 100) {
      setNotification({
        show: true,
        message: "Berat tidak boleh lebih dari 100 kg",
        type: "error",
      });
      return;
    }

    if (layananTipe === "Satuan" && valueNum > 999) {
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
    onConfirm(valueNum, totalHarga);
  };

  const handleClose = () => {
    setBeratOrQuantity("");
    setNotification({ show: false, message: "", type: "success" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Input {layananTipe === "Kiloan" ? "Berat" : "Jumlah"} & Kalkulasi
              Harga
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
              Harga per {layananTipe === "Kiloan" ? "kg" : "item"}:{" "}
              {formatRupiah(layananHarga)}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {layananTipe === "Kiloan" ? "Berat Cucian (kg)" : "Jumlah Item"}{" "}
                *
              </label>
              {layananTipe === "Kiloan" ? (
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={beratOrQuantity}
                  onChange={(e) => setBeratOrQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: 2.5"
                  required
                  disabled={loading}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setBeratOrQuantity((prev) =>
                        Math.max(1, parseInt(prev) - 1).toString()
                      )
                    }
                    disabled={loading || parseInt(beratOrQuantity) <= 1}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:minus" width={16} />
                  </button>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="999"
                    value={beratOrQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setBeratOrQuantity(Math.max(1, value).toString());
                    }}
                    className="w-20 px-3 py-2 border rounded text-center focus:outline-none focus:border-blue-500"
                    required
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBeratOrQuantity((prev) =>
                        Math.min(999, parseInt(prev) + 1).toString()
                      )
                    }
                    disabled={loading || parseInt(beratOrQuantity) >= 999}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:plus" width={16} />
                  </button>
                  <span className="text-sm text-gray-600">
                    item(s) × {formatRupiah(layananHarga)} =
                    <span className="font-medium text-green-600 ml-1">
                      {formatRupiah(calculateTotalPrice())}
                    </span>
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {layananTipe === "Kiloan"
                  ? "Minimal 0.1 kg, maksimal 100 kg"
                  : "Minimal 1 item, maksimal 999 item"}
              </div>
            </div>

            {beratOrQuantity &&
              !isNaN(parseFloat(beratOrQuantity)) &&
              parseFloat(beratOrQuantity) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Kalkulasi Harga:
                  </div>
                  <div className="text-sm text-blue-700">
                    {parseFloat(beratOrQuantity)}{" "}
                    {layananTipe === "Kiloan" ? "kg" : "item"} ×{" "}
                    {formatRupiah(layananHarga)} =
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
                  !beratOrQuantity ||
                  isNaN(parseFloat(beratOrQuantity)) ||
                  parseFloat(beratOrQuantity) <= 0
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
