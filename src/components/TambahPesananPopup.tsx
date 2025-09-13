import { useState, useCallback, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useStateContext } from "../contexts/ContextsProvider";
import Notification from "./Notification";

import {
  addPesanan,
  AddPesananInput,
  getPesanan,
} from "../data/service/pesananService";
import {
  getPelangganList,
  PelangganData,
} from "../data/service/pelangganService";
import { Layanan, Pesanan } from "../data/model/Pesanan";

interface TambahPesananPopupProps {
  onClose?: () => void;
  onAdded?: () => void;
  isModal?: boolean;
}

export default function TambahPesananPopup({
  onClose,
  onAdded,
  isModal = false,
}: TambahPesananPopupProps) {
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [alamat, setAlamat] = useState("");
  const [layanan, setLayanan] = useState("");
  const [catatan, setCatatan] = useState("");

  // States untuk kuantitas opsional
  const [inputQuantityNow, setInputQuantityNow] = useState<boolean>(false);
  const [berat, setBerat] = useState<string>("");
  const [jumlahSatuan, setJumlahSatuan] = useState<string>("");

  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [loadingLayanan, setLoadingLayanan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPelanggan, setLoadingPelanggan] = useState(false);
  const [pelangganList, setPelangganList] = useState<PelangganData[]>([]);
  const [pesananCustomerList, setPesananCustomerList] = useState<
    PelangganData[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTypingNama, setIsTypingNama] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const { user, userType } = useStateContext();

  const selectedLayananInfo = useMemo(() => {
    return layananList.find((l) => l.id.toString() === layanan);
  }, [layanan, layananList]);

  const layananByType = useMemo(() => {
    const kiloan = layananList.filter((l) => l.tipe === "Kiloan");
    const satuan = layananList.filter((l) => l.tipe === "Satuan");
    return { kiloan, satuan };
  }, [layananList]);

  // Reset quantity inputs when layanan changes
  useEffect(() => {
    setBerat("");
    setJumlahSatuan("");
    setInputQuantityNow(false);
  }, [layanan]);

  // Calculated total price
  const calculateTotalPrice = useMemo(() => {
    if (!selectedLayananInfo || !inputQuantityNow) return 0;

    if (selectedLayananInfo.tipe === "Kiloan") {
      const beratNum = parseFloat(berat);
      if (isNaN(beratNum) || beratNum <= 0) return 0;
      return beratNum * selectedLayananInfo.harga_layanan;
    } else {
      const jumlahNum = parseInt(jumlahSatuan);
      if (isNaN(jumlahNum) || jumlahNum <= 0) return 0;
      return jumlahNum * selectedLayananInfo.harga_layanan;
    }
  }, [selectedLayananInfo, inputQuantityNow, berat, jumlahSatuan]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        setLoadingLayanan(true);
        if (!user?.id) {
          setNotification({
            show: true,
            message: "User ID tidak tersedia",
            type: "error",
          });
          return;
        }

        let ownerId: number;
        if (userType === "admin") {
          if (!user.id_owner) {
            setNotification({
              show: true,
              message: "Admin/Karyawan tidak memiliki ID Owner yang valid",
              type: "error",
            });
            return;
          }
          ownerId = Number(user.id_owner);
        } else {
          ownerId = Number(user.id);
        }

        const token =
          localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("token");
        const url = `https://laundryku.rplrus.com/api/layanan?id_owner=${ownerId}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        let data: Layanan[] = [];
        if (responseData.success && Array.isArray(responseData.data)) {
          data = responseData.data;
        } else if (Array.isArray(responseData)) {
          data = responseData;
        } else {
          throw new Error("Format response tidak valid");
        }

        data = data.filter((layanan) => layanan.id_owner === ownerId);
        setLayananList(data);

        if (data.length === 0) {
          setNotification({
            show: true,
            message: `Belum ada layanan untuk owner ini.`,
            type: "error",
          });
        }
      } catch (error) {
        setNotification({
          show: true,
          message: `Gagal memuat layanan: ${(error as Error).message}`,
          type: "error",
        });
        setLayananList([]);
      } finally {
        setLoadingLayanan(false);
      }
    };

    if (user?.id) {
      fetchLayanan();
    }
  }, [user?.id, user?.id_owner, userType]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user?.id) return;

      try {
        setLoadingPelanggan(true);
        let ownerId: number;
        if (userType === "admin") {
          if (!user.id_owner) {
            setNotification({
              show: true,
              message: "Admin/Karyawan tidak memiliki ID Owner yang valid",
              type: "error",
            });
            return;
          }
          ownerId = Number(user.id_owner);
        } else {
          ownerId = Number(user.id);
        }

        const pelangganData = await getPelangganList(ownerId);
        const pesananData = await getPesanan(ownerId);
        const pesananCustomers: PelangganData[] = [];
        const uniqueCustomers = new Map<string, PelangganData>();

        pesananData.forEach((pesanan: Pesanan) => {
          const key = `${pesanan.nama_pelanggan}-${pesanan.nomor}`;
          if (!uniqueCustomers.has(key)) {
            uniqueCustomers.set(key, {
              nama_pelanggan: pesanan.nama_pelanggan,
              nomor: pesanan.nomor,
              alamat: pesanan.alamat || "",
            });
          }
        });

        uniqueCustomers.forEach((customer) => {
          pesananCustomers.push(customer);
        });

        const mergedCustomers: PelangganData[] = [...pelangganData];
        pesananCustomers.forEach((pesananCustomer) => {
          const exists = mergedCustomers.some(
            (pelanggan) =>
              pelanggan.nomor === pesananCustomer.nomor &&
              pelanggan.nama_pelanggan === pesananCustomer.nama_pelanggan
          );
          if (!exists) {
            mergedCustomers.push(pesananCustomer);
          }
        });

        setPelangganList(mergedCustomers);
        setPesananCustomerList(pesananCustomers);
      } catch (error) {
        setNotification({
          show: true,
          message: `Gagal memuat data pelanggan: ${(error as Error).message}`,
          type: "error",
        });
        setPelangganList([]);
        setPesananCustomerList([]);
      } finally {
        setLoadingPelanggan(false);
      }
    };

    fetchCustomerData();
  }, [user?.id, user?.id_owner, userType]);

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const filteredPelanggan = useMemo(() => {
    if (!searchTerm) return pelangganList;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return pelangganList.filter(
      (pelanggan) =>
        pelanggan.nama_pelanggan.toLowerCase().includes(lowerSearchTerm) ||
        pelanggan.nomor.includes(searchTerm)
    );
  }, [searchTerm, pelangganList]);

  const handleSelectPelanggan = useCallback((pelanggan: PelangganData) => {
    setNama(pelanggan.nama_pelanggan);
    setPhone(pelanggan.nomor);
    setAlamat(pelanggan.alamat);
    setShowDropdown(false);
    setSearchTerm("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.id) {
        setNotification({
          show: true,
          message: "User tidak ditemukan",
          type: "error",
        });
        return;
      }

      if (userType === "admin" && !user.id_owner) {
        setNotification({
          show: true,
          message: "Admin tidak memiliki ID Owner yang valid",
          type: "error",
        });
        return;
      }

      const validationErrors = [];

      if (!nama || nama.trim().length === 0) {
        validationErrors.push("Nama pelanggan harus diisi");
      }

      if (!phone || phone.trim().length === 0) {
        validationErrors.push("Nomor telepon harus diisi");
      } else if (!/^08[0-9]{7,11}$/.test(phone)) {
        validationErrors.push(
          "Nomor telepon harus diawali dengan 08 dan maksimal 13 digit angka"
        );
      }

      if (!alamat || alamat.trim().length === 0) {
        validationErrors.push("Alamat harus diisi");
      }

      if (!layanan || layanan.trim().length === 0) {
        validationErrors.push("Layanan harus dipilih");
      }

      // Validasi kuantitas jika user memilih untuk input sekarang
      if (inputQuantityNow && selectedLayananInfo) {
        if (selectedLayananInfo.tipe === "Kiloan") {
          const beratNum = parseFloat(berat);
          if (isNaN(beratNum) || beratNum <= 0) {
            validationErrors.push(
              "Berat harus diisi dengan nilai yang valid (lebih dari 0)"
            );
          } else if (beratNum > 100) {
            validationErrors.push("Berat tidak boleh lebih dari 100 kg");
          }
        } else {
          const jumlahNum = parseInt(jumlahSatuan);
          if (isNaN(jumlahNum) || jumlahNum <= 0) {
            validationErrors.push(
              "Jumlah harus diisi dengan nilai yang valid (lebih dari 0)"
            );
          } else if (jumlahNum > 999) {
            validationErrors.push("Jumlah tidak boleh lebih dari 999 item");
          }
        }
      }

      if (validationErrors.length > 0) {
        setNotification({
          show: true,
          message: `Validasi gagal: ${validationErrors.join(", ")}`,
          type: "error",
        });
        return;
      }

      setLoading(true);
      try {
        const selectedLayanan = layananList.find(
          (l) => l.id.toString() === layanan
        );

        if (!selectedLayanan) {
          setNotification({
            show: true,
            message: "Layanan yang dipilih tidak valid",
            type: "error",
          });
          return;
        }

        const layananName = selectedLayanan.nama_layanan;

        // Prepare quantity data
        let beratValue = 0;
        let banyakSatuanValue = 0;
        let jumlahHarga = 0;

        if (inputQuantityNow) {
          if (selectedLayanan.tipe === "Kiloan") {
            beratValue = parseFloat(berat);
            jumlahHarga = calculateTotalPrice;
          } else {
            banyakSatuanValue = parseInt(jumlahSatuan);
            jumlahHarga = calculateTotalPrice;
          }
        }

        const pesananData: AddPesananInput = {
          id_owner:
            userType === "admin" ? Number(user.id_owner) : Number(user.id),
          nama_pelanggan: nama.trim(),
          nomor: phone.trim(),
          alamat: alamat.trim(),
          id_layanan: Number(layanan),
          layanan: layananName.trim(),
          status: "pending",
          berat: beratValue,
          banyak_satuan: banyakSatuanValue,
          jumlah_harga: jumlahHarga,
          catatan: catatan.trim(),
        };

        if (userType === "admin" && user && user.id) {
          pesananData.id_admin = Number(user.id);
        }

        const finalValidationErrors = [];

        if (!pesananData.id_owner || pesananData.id_owner <= 0) {
          finalValidationErrors.push("ID Owner tidak valid");
        }

        if (
          !pesananData.nama_pelanggan ||
          pesananData.nama_pelanggan.trim().length === 0
        ) {
          finalValidationErrors.push("Nama pelanggan tidak boleh kosong");
        }

        if (!pesananData.nomor || pesananData.nomor.trim().length === 0) {
          finalValidationErrors.push("Nomor telepon tidak boleh kosong");
        }

        if (!pesananData.alamat || pesananData.alamat.trim().length === 0) {
          finalValidationErrors.push("Alamat tidak boleh kosong");
        }

        if (!pesananData.id_layanan || pesananData.id_layanan <= 0) {
          finalValidationErrors.push("ID Layanan tidak valid");
        }

        if (finalValidationErrors.length > 0) {
          setNotification({
            show: true,
            message: `Data tidak valid: ${finalValidationErrors.join(", ")}`,
            type: "error",
          });
          return;
        }

        await addPesanan(pesananData);

        const successMessage = inputQuantityNow
          ? `Pesanan berhasil ditambahkan dengan kuantitas dan total harga ${formatRupiah(
              jumlahHarga
            )}!`
          : "Pesanan berhasil ditambahkan! Kuantitas dan harga akan diinput saat pesanan diselesaikan.";

        setNotification({
          show: true,
          message: successMessage,
          type: "success",
        });

        // Reset form
        setNama("");
        setPhone("");
        setAlamat("");
        setLayanan("");
        setCatatan("");
        setBerat("");
        setJumlahSatuan("");
        setInputQuantityNow(false);

        if (onAdded) onAdded();
      } catch (error: any) {
        let errorMessage = "Gagal menambahkan pesanan";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          const validationErrors = Object.entries(error.response.data.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${(messages as string[]).join(", ")}`
            )
            .join("; ");
          errorMessage = `Validasi gagal: ${validationErrors}`;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setNotification({
          show: true,
          message: errorMessage,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      user?.id,
      userType,
      nama,
      phone,
      alamat,
      layanan,
      catatan,
      inputQuantityNow,
      berat,
      jumlahSatuan,
      selectedLayananInfo,
      layananList,
      calculateTotalPrice,
      onAdded,
    ]
  );

  const formContent = useMemo(
    () => (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Cari Pelanggan
          </label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Icon icon="mdi:magnify" width={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-10 py-2 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Cari nama atau nomor pelanggan"
              autoComplete="off"
              disabled={loading || loadingPelanggan}
            />
            {loadingPelanggan && (
              <div className="absolute right-3 top-2.5">
                <Icon icon="eos-icons:loading" width={20} />
              </div>
            )}
          </div>

          {showDropdown && searchTerm && !isTypingNama && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredPelanggan.length > 0 ? (
                filteredPelanggan.map((pelanggan, index) => (
                  <div
                    key={`${pelanggan.nomor}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectPelanggan(pelanggan)}
                  >
                    <div className="font-medium">
                      {pelanggan.nama_pelanggan}
                    </div>
                    <div className="text-sm text-gray-600">
                      {pelanggan.nomor}
                    </div>
                    {pesananCustomerList.some(
                      (p) =>
                        p.nomor === pelanggan.nomor &&
                        p.nama_pelanggan === pelanggan.nama_pelanggan
                    ) && (
                      <div className="text-xs text-blue-500">
                        (Dari riwayat pesanan)
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">
                  Tidak ada pelanggan yang ditemukan
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nama Pelanggan *
          </label>
          <input
            type="text"
            name="nama_manual"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            onFocus={() => setIsTypingNama(true)}
            onBlur={() => setTimeout(() => setIsTypingNama(false), 200)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            required
            disabled={loading}
            placeholder="Masukkan nama pelanggan"
            autoComplete="on"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nomor Hp (Whatsapp) *
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]*$/.test(value) && value.length <= 13) {
                setPhone(value);
              }
            }}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            required
            disabled={loading}
            placeholder="Contoh: 081234567890"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alamat *</label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            rows={3}
            required
            disabled={loading}
            placeholder="Masukkan alamat pelanggan"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pilih Layanan *
          </label>
          <div className="relative">
            <select
              value={layanan}
              onChange={(e) => setLayanan(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
              required
              disabled={loading || loadingLayanan}
            >
              <option value="">-- Pilih layanan --</option>
              {layananByType.kiloan.length > 0 && (
                <optgroup label="📏 Layanan Kiloan">
                  {layananByType.kiloan.map((item) => (
                    <option
                      key={`kiloan-${item.id}`}
                      value={item.id.toString()}
                    >
                      {item.nama_layanan} - Rp{" "}
                      {item.harga_layanan.toLocaleString("id-ID")}/kg
                    </option>
                  ))}
                </optgroup>
              )}
              {layananByType.satuan.length > 0 && (
                <optgroup label="🔢 Layanan Satuan">
                  {layananByType.satuan.map((item) => (
                    <option
                      key={`satuan-${item.id}`}
                      value={item.id.toString()}
                    >
                      {item.nama_layanan} - Rp{" "}
                      {item.harga_layanan.toLocaleString("id-ID")}/item
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {loadingLayanan && (
              <div className="absolute right-8 top-2">
                <Icon icon="eos-icons:loading" width={20} />
              </div>
            )}
          </div>
          {selectedLayananInfo && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedLayananInfo.tipe === "Kiloan"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedLayananInfo.tipe}
                </span>
                <span className="text-gray-600 text-xs sm:text-sm">
                  {selectedLayananInfo.keterangan_layanan}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quantity Input Section - Responsive */}
        {selectedLayananInfo && (
          <div className="p-3 sm:p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="inputQuantityNow"
                checked={inputQuantityNow}
                onChange={(e) => setInputQuantityNow(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
              />
              <label
                htmlFor="inputQuantityNow"
                className="text-sm font-medium text-gray-700"
              >
                Input{" "}
                {selectedLayananInfo.tipe === "Kiloan" ? "berat" : "jumlah"}{" "}
                sekarang
              </label>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              Jika tidak dicentang,{" "}
              {selectedLayananInfo.tipe === "Kiloan" ? "berat" : "jumlah"} akan
              diinput nanti saat pesanan diselesaikan
            </div>

            {inputQuantityNow && (
              <div className="space-y-3">
                {selectedLayananInfo.tipe === "Kiloan" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Berat Cucian (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={berat}
                      onChange={(e) => setBerat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: 2.5"
                      disabled={loading}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Minimal 0.1 kg, maksimal 100 kg
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Item *
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(jumlahSatuan) || 1;
                          if (current > 1) {
                            setJumlahSatuan((current - 1).toString());
                          }
                        }}
                        disabled={loading || parseInt(jumlahSatuan) <= 1}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        <Icon icon="mdi:minus" width={16} />
                      </button>

                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="999"
                        value={jumlahSatuan}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setJumlahSatuan(
                            Math.max(1, Math.min(999, value)).toString()
                          );
                        }}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(jumlahSatuan) || 1;
                          if (current < 999) {
                            setJumlahSatuan((current + 1).toString());
                          }
                        }}
                        disabled={loading || parseInt(jumlahSatuan) >= 999}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        <Icon icon="mdi:plus" width={16} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Minimal 1 item, maksimal 999 item
                    </div>
                  </div>
                )}

                {calculateTotalPrice > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Kalkulasi Harga:
                    </div>
                    <div className="text-sm text-blue-700">
                      <div className="flex flex-wrap items-center gap-1">
                        <span>
                          {selectedLayananInfo.tipe === "Kiloan"
                            ? `${parseFloat(berat)} kg × ${formatRupiah(
                                selectedLayananInfo.harga_layanan
                              )}`
                            : `${parseInt(jumlahSatuan)} item × ${formatRupiah(
                                selectedLayananInfo.harga_layanan
                              )}`}
                        </span>
                        <span>=</span>
                        <span className="font-bold">
                          {formatRupiah(calculateTotalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Catatan (Opsional)
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            rows={3}
            disabled={loading}
            placeholder="Masukkan catatan khusus untuk pesanan ini (jika ada)"
            autoComplete="off"
          />
        </div>

        {/* Sticky Button Area for Mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-2 border-t sm:border-t-0 sm:static sm:bg-transparent sm:pt-0 sm:pb-0">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                disabled={loading}
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white px-4 py-3 sm:py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || loadingLayanan}
            >
              {loading ? "Menyimpan..." : "Tambahkan Pesanan"}
            </button>
          </div>
        </div>
      </form>
    ),
    [
      nama,
      phone,
      alamat,
      layanan,
      catatan,
      inputQuantityNow,
      berat,
      jumlahSatuan,
      selectedLayananInfo,
      layananByType,
      layananList,
      loading,
      loadingLayanan,
      loadingPelanggan,
      isModal,
      onClose,
      handleSubmit,
      searchTerm,
      showDropdown,
      filteredPelanggan,
      isTypingNama,
      pesananCustomerList,
      calculateTotalPrice,
    ]
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              Tambah Pesanan Baru
            </h1>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
                disabled={loading}
              >
                <Icon icon="mdi:close" width={24} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">{formContent}</div>
        </div>

        {notification.show && (
          <div className="fixed top-4 right-4 z-60">
            <Notification
              show={notification.show}
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
          Tambah Pesanan Baru
        </h1>

        <div className="bg-white border rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6">{formContent}</div>
        </div>

        {notification.show && (
          <div className="fixed top-4 right-4 z-50">
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
  );
}
