"use client";
import WeightModal from "../../../components/TambahKGPesanan";
import QuantityModal from "../../../components/TambahSatuanPesanan";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CardStat from "../../../components/CardStat";
import DeleteModal from "../../../components/DeleteModal";
import Notification from "../../../components/Notification";
import logo from "/logo.png";
import { updateStatusPesanan } from "../../../data/service/ApiService";
import { useStateContext } from "../../../contexts/ContextsProvider";
import { Pesanan } from "../../../data/model/Pesanan";
import {
  getPesanan,
  deletePesanan,
} from "../../../data/service/pesananService";
import TambahPesananPopup from "../../../components/TambahPesananPopup";
import EditPesananPopup from "../../../components/EditPesananPopup";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [dateRange, setDateRange] = useState(() => {
    return {
      start: "",
      end: "",
    };
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: 0,
    namaPelanggan: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPesananId, setEditPesananId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, token } = useStateContext();

  // Separate states for Weight and Quantity modals
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedPesananForWeight, setSelectedPesananForWeight] = useState<{
    id: number;
    nama_pelanggan: string;
    layanan_harga: number;
    layanan_nama: string;
  } | null>(null);
  const [selectedPesananForQuantity, setSelectedPesananForQuantity] = useState<{
    id: number;
    nama_pelanggan: string;
    layanan_harga: number;
    layanan_nama: string;
  } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // Grouping states
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);
  // Photo modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Group orders by customer name
  const groupOrdersByCustomer = (orders: Pesanan[]) => {
    const grouped = orders.reduce((acc: any, order) => {
      const customerKey = `${order.nama_pelanggan}_${order.nomor}`;
      if (!acc[customerKey]) {
        acc[customerKey] = {
          customerName: order.nama_pelanggan,
          customerPhone: order.nomor,
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
        };
      }
      acc[customerKey].orders.push(order);
      acc[customerKey].totalOrders += 1;
      acc[customerKey].totalAmount += order.jumlah_harga || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const toggleCustomerRow = (customerKey: string) => {
    setOpenCustomerId(openCustomerId === customerKey ? null : customerKey);
  };

  // Photo modal functions
  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // Helper function to get full photo URL
  const getPhotoUrl = (lampiran: string | undefined) => {
    if (!lampiran) return null;
    if (lampiran.startsWith("http")) return lampiran;

    console.log("Original lampiran value:", lampiran);

    // Extract filename dari "pesanan/filename.jpg"
    const filename = lampiran.replace("pesanan/", "");

    // Akses via route public
    return `https://laundryku.rplrus.com/file/pesanan/${filename}`;
  };

  useEffect(() => {
    const fetchPesanan = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const localToken = localStorage.getItem("token");
        if (!localToken && !token) {
          navigate("/login");
          return;
        }

        if (!user?.id) {
          setError("ID Admin tidak ditemukan");
          if (showLoader) setLoading(false);
          navigate("/login");
          return;
        }

        if (!user.id_owner) {
          setError("ID Owner tidak ditemukan untuk admin ini");
          if (showLoader) setLoading(false);
          return;
        }

        console.log("Fetching pesanan for admin with owner ID:", user.id_owner);
        const data = await getPesanan(Number(user.id_owner));
        console.log("Fetched pesanan:", data);
        setPesanan(data);
        setError("");
      } catch (error: any) {
        console.error("Error fetching pesanan:", error);
        setError(error.message || "Gagal mengambil data pesanan");
        setPesanan([]);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchPesanan(true);

    const intervalId = setInterval(() => {
      fetchPesanan(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token, navigate, user?.id, user?.id_owner]);

  const allowedStatuses = ["pending", "diproses", "selesai"];
  const filteredPesanan = Array.isArray(pesanan)
    ? pesanan.filter((p) => {
        try {
          console.log("Filtering pesanan:", p);

          if (!p.created_at) {
            console.log("Pesanan tidak memiliki created_at:", p);
            return false;
          }

          const orderDate = new Date(p.created_at);

          if (isNaN(orderDate.getTime())) {
            console.log("Invalid order date:", p.created_at);
            return false;
          }

          if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start + "T00:00:00");
            const endDate = new Date(dateRange.end + "T23:59:59");

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.log("Invalid filter dates:", {
                start: dateRange.start,
                end: dateRange.end,
              });
              return false;
            }

            const matchesDate = orderDate >= startDate && orderDate <= endDate;
            if (!matchesDate) {
              console.log("Pesanan tidak masuk range tanggal:", {
                orderDate: orderDate.toISOString(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
              });
              return false;
            }
          }

          const matchesStatus = filterStatus
            ? p.status.toLowerCase() === filterStatus.toLowerCase()
            : true;

          const keyword = searchKeyword.toLowerCase();
          const matchesKeyword =
            !searchKeyword ||
            p.nama_pelanggan?.toLowerCase().includes(keyword) ||
            p.alamat?.toLowerCase().includes(keyword) ||
            p.nomor?.toLowerCase().includes(keyword) ||
            p.layanan?.toLowerCase().includes(keyword);

          const matchesAllowedStatus = allowedStatuses.includes(
            p.status.toLowerCase()
          );

          return matchesStatus && matchesKeyword && matchesAllowedStatus;
        } catch (error) {
          console.error("Error filtering pesanan:", error, p);
          return false;
        }
      })
    : [];

  // Group orders by customer
  const groupedOrders = groupOrdersByCustomer(filteredPesanan);

  // Pagination logic for grouped data
  const totalItems = groupedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroupedOrders = groupedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "pending" | "diproses" | "selesai",
    pesananData?: Pesanan
  ) => {
    try {
      if (newStatus === "selesai") {
        const pesananItem = pesananData || pesanan.find((p) => p.id === id);
        if (!pesananItem) {
          setNotification({
            show: true,
            message: "Data pesanan tidak ditemukan",
            type: "error",
          });
          return;
        }

        // Check if quantity and price already exist
        const hasQuantity =
          (pesananItem.berat ?? 0) > 0 || (pesananItem.banyak_satuan ?? 0) > 0;
        const hasPrice = (pesananItem.jumlah_harga ?? 0) > 0;

        if (hasQuantity && hasPrice) {
          // Directly complete the order without showing modal
          await updateStatusPesanan(id, newStatus);
          setPesanan((prev) => {
            if (Array.isArray(prev)) {
              return prev.map((item) =>
                item.id === id ? { ...item, status: newStatus } : item
              );
            }
            return [];
          });

          setNotification({
            show: true,
            message: `Pesanan ${pesananItem.nama_pelanggan} berhasil diselesaikan`,
            type: "success",
          });

          setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }));
          }, 3000);
          return;
        }

        // If no quantity/price, proceed with modal logic
        let layananHarga = 0;
        let layananNama = "";
        let layananTipe: "Kiloan" | "Satuan" = "Kiloan";

        if (
          typeof pesananItem.layanan === "object" &&
          (pesananItem.layanan as any)?.tipe
        ) {
          layananNama =
            (pesananItem.layanan as any)?.nama_layanan ||
            "Layanan tidak tersedia";
          layananHarga = (pesananItem.layanan as any)?.harga_layanan || 0;
          layananTipe = (pesananItem.layanan as any)?.tipe || "Kiloan";
        } else {
          layananNama =
            typeof pesananItem.layanan === "string"
              ? pesananItem.layanan
              : "Layanan tidak tersedia";

          try {
            const token =
              localStorage.getItem("ACCESS_TOKEN") ||
              localStorage.getItem("token");
            const ownerId = user?.id_owner || user?.id;
            const layananResponse = await fetch(
              `https://laundryku.rplrus.com/api/layanan?id_owner=${ownerId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );

            if (layananResponse.ok) {
              const layananData = await layananResponse.json();
              const layananList = layananData.success
                ? layananData.data
                : layananData;

              const matchedLayanan = layananList.find(
                (l: any) =>
                  l.nama_layanan.toLowerCase() === layananNama.toLowerCase() ||
                  l.id === pesananItem.id_layanan
              );

              if (matchedLayanan) {
                layananHarga = matchedLayanan.harga_layanan || 0;
                layananNama = matchedLayanan.nama_layanan;
                layananTipe = matchedLayanan.tipe || "Kiloan";
              }
            }
          } catch (error) {
            console.error("Error fetching layanan data:", error);
            setNotification({
              show: true,
              message: "Gagal mengambil data layanan",
              type: "error",
            });
            return;
          }
        }

        if (layananHarga <= 0) {
          setNotification({
            show: true,
            message:
              "Harga layanan tidak ditemukan. Tidak bisa menghitung total harga.",
            type: "error",
          });
          return;
        }

        if (layananTipe === "Kiloan") {
          setSelectedPesananForWeight({
            id: pesananItem.id,
            nama_pelanggan: pesananItem.nama_pelanggan,
            layanan_harga: layananHarga,
            layanan_nama: layananNama,
          });
          setShowWeightModal(true);
        } else {
          setSelectedPesananForQuantity({
            id: pesananItem.id,
            nama_pelanggan: pesananItem.nama_pelanggan,
            layanan_harga: layananHarga,
            layanan_nama: layananNama,
          });
          setShowQuantityModal(true);
        }
        return;
      }

      // Handle other status changes (pending -> diproses)
      await updateStatusPesanan(id, newStatus);
      setPesanan((prev) => {
        if (Array.isArray(prev)) {
          return prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          );
        }
        return [];
      });

      setNotification({
        show: true,
        message: `Status pesanan berhasil diubah ke ${newStatus}`,
        type: "success",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.message || "Gagal mengubah status",
        type: "error",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const handleDeletePesanan = (id: number, namaPelanggan: string) => {
    setDeleteModal({
      show: true,
      id,
      namaPelanggan,
    });
  };

  const confirmDeletePesanan = async () => {
    const { id, namaPelanggan } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, show: false }));
    setLoading(true);

    try {
      const success = await deletePesanan(id);
      if (success) {
        setPesanan((prev) => {
          if (Array.isArray(prev)) {
            return prev.filter((item) => item.id !== id);
          }
          return [];
        });
        setNotification({
          show: true,
          message: `Pesanan ${namaPelanggan} berhasil dihapus`,
          type: "success",
        });

        // Reset to first page if current page is empty after deletion
        if (paginatedGroupedOrders.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
        }, 3000);
      } else {
        throw new Error("Gagal menghapus pesanan");
      }
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.message || "Gagal menghapus pesanan",
        type: "error",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Weight modal handlers
  const handleWeightModalClose = () => {
    setShowWeightModal(false);
    setSelectedPesananForWeight(null);
  };

  const handleWeightConfirm = async (berat: number, totalHarga: number) => {
    if (!selectedPesananForWeight) return;

    try {
      setLoading(true);

      // ✅ FIX: Use correct field mapping for backend
      const updatedData = {
        berat: berat,
        banyak_satuan: 0, // ✅ CORRECT: For Kiloan services, set banyak_satuan to 0
        jumlah_harga: totalHarga,
        status: "selesai",
      };

      console.log("📊 Sending update data to backend:", updatedData);

      const token =
        localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("token");
      const response = await fetch(
        `https://laundryku.rplrus.com/api/pesanan/${selectedPesananForWeight.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Backend error response:", errorData);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("✅ Backend response:", responseData);

      // Update local state
      setPesanan((prev) => {
        if (Array.isArray(prev)) {
          return prev.map((item) =>
            item.id === selectedPesananForWeight.id
              ? {
                  ...item,
                  status: "selesai",
                  berat: berat,
                  banyak_satuan: 0, // ✅ Reset banyak_satuan for kiloan service
                  jumlah_harga: totalHarga,
                }
              : item
          );
        }
        return [];
      });

      setNotification({
        show: true,
        message: `Pesanan ${
          selectedPesananForWeight.nama_pelanggan
        } berhasil diselesaikan dengan berat ${berat} kg dan total harga Rp ${totalHarga.toLocaleString()}`,
        type: "success",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);

      handleWeightModalClose();
    } catch (error: any) {
      console.error("❌ Error updating pesanan:", error);
      setNotification({
        show: true,
        message: error.message || "Gagal menyelesaikan pesanan",
        type: "error",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Quantity modal handlers
  const handleQuantityModalClose = () => {
    setShowQuantityModal(false);
    setSelectedPesananForQuantity(null);
  };

  const handleQuantityConfirm = async (
    quantity: number,
    totalHarga: number
  ) => {
    if (!selectedPesananForQuantity) return;

    try {
      setLoading(true);

      // ✅ FIX: Use correct field mapping for backend
      const updatedData = {
        berat: 0, // For Satuan services, set berat to 0
        banyak_satuan: quantity, // ✅ CORRECT: Use banyak_satuan field name
        jumlah_harga: totalHarga,
        status: "selesai",
      };

      console.log("📊 Sending update data to backend:", updatedData);

      const token =
        localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("token");
      const response = await fetch(
        `https://laundryku.rplrus.com/api/pesanan/${selectedPesananForQuantity.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Backend error response:", errorData);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("✅ Backend response:", responseData);

      // Update local state
      setPesanan((prev) => {
        if (Array.isArray(prev)) {
          return prev.map((item) =>
            item.id === selectedPesananForQuantity.id
              ? {
                  ...item,
                  status: "selesai",
                  berat: 0,
                  banyak_satuan: quantity, // ✅ Update banyak_satuan field
                  jumlah_harga: totalHarga,
                }
              : item
          );
        }
        return [];
      });

      setNotification({
        show: true,
        message: `Pesanan ${
          selectedPesananForQuantity.nama_pelanggan
        } berhasil diselesaikan dengan jumlah ${quantity} item dan total harga Rp ${totalHarga.toLocaleString()}`,
        type: "success",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);

      handleQuantityModalClose();
    } catch (error: any) {
      console.error("❌ Error updating pesanan:", error);
      setNotification({
        show: true,
        message: error.message || "Gagal menyelesaikan pesanan",
        type: "error",
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeletePesanan = () => {
    setDeleteModal({
      show: false,
      id: 0,
      namaPelanggan: "",
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const getLayananTypeAndDisplay = (item: Pesanan) => {
    // Check if quantity exists
    const hasKiloQuantity = item.berat && item.berat > 0;
    const hasSatuanQuantity = item.banyak_satuan && item.banyak_satuan > 0;

    // If layanan is object with tipe
    if (typeof item.layanan === "object" && (item.layanan as any)?.tipe) {
      const tipe = (item.layanan as any).tipe;
      if (tipe === "Satuan") {
        return {
          tipe: "Satuan",
          display: hasSatuanQuantity
            ? `${item.banyak_satuan} item`
            : "Belum diinput",
          value: item.banyak_satuan || 0,
          hasQuantity: hasSatuanQuantity,
        };
      } else {
        return {
          tipe: "Kiloan",
          display: hasKiloQuantity ? `${item.berat} kg` : "Belum diinput",
          value: item.berat || 0,
          hasQuantity: hasKiloQuantity,
        };
      }
    }

    // Default to Kiloan if no type info
    return {
      tipe: "Kiloan",
      display: hasKiloQuantity ? `${item.berat} kg` : "Belum diinput",
      value: item.berat || 0,
      hasQuantity: hasKiloQuantity,
    };
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const totalPesanan = Array.isArray(filteredPesanan)
    ? filteredPesanan.length
    : 0;
  const menungguKonfirmasi = Array.isArray(filteredPesanan)
    ? filteredPesanan.filter((p) => p.status === "pending").length
    : 0;
  const dalamProses = Array.isArray(filteredPesanan)
    ? filteredPesanan.filter((p) => p.status === "diproses").length
    : 0;
  const selesai = Array.isArray(filteredPesanan)
    ? filteredPesanan.filter((p) => p.status === "selesai").length
    : 0;

  const refreshPesanan = async () => {
    console.log("🔄 Refreshing pesanan data...");

    if (!user?.id_owner) {
      console.error("❌ No owner ID available for refresh");
      return;
    }

    try {
      // Don't show loading overlay for refresh, just update data
      const data = await getPesanan(Number(user.id_owner));
      console.log("✅ Refreshed pesanan data:", data);
      console.log("📊 Previous pesanan count:", pesanan.length);
      console.log(
        "📊 New pesanan count:",
        Array.isArray(data) ? data.length : 0
      );

      // Force React to re-render by creating new array reference
      setPesanan([...data]);
      setError("");

      // Reset to first page if current page is empty after refresh
      const filteredCount = Array.isArray(data)
        ? data.filter((p) => {
            const matchesStatus = filterStatus
              ? p.status.toLowerCase() === filterStatus.toLowerCase()
              : true;
            const keyword = searchKeyword.toLowerCase();
            const matchesKeyword =
              !searchKeyword ||
              p.nama_pelanggan?.toLowerCase().includes(keyword) ||
              p.alamat?.toLowerCase().includes(keyword) ||
              p.nomor?.toLowerCase().includes(keyword) ||
              p.layanan?.toLowerCase().includes(keyword);
            return matchesStatus && matchesKeyword;
          }).length
        : 0;

      const newTotalPages = Math.ceil(filteredCount / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }

      console.log("🎯 Refresh completed successfully");
    } catch (error: any) {
      console.error("❌ Error refreshing pesanan:", error);
      setError(error.message || "Gagal memuat ulang data pesanan");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Laundry Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="text-lg font-bold text-gray-900">
              Laundry Admin
            </span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-xs text-gray-700 rounded">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                className="flex items-center gap-2 focus:outline-none rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={showOwnerMenu}
                aria-label="User menu"
              >
                <Icon
                  icon="mdi:account-circle-outline"
                  width={24}
                  className="text-gray-700"
                />
                <span className="text-sm font-semibold text-gray-700">
                  {user?.name || "Admin"}
                </span>
                <Icon
                  icon={showOwnerMenu ? "mdi:chevron-up" : "mdi:chevron-down"}
                  width={20}
                  className="text-gray-500"
                />
              </button>

              {showOwnerMenu && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="User menu"
                >
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md transition-colors"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <CardStat
                icon={<Icon icon="solar:box-linear" width={24} />}
                label="Total Pesanan"
                value={totalPesanan.toString()}
                subtitle="Pesanan yang masuk"
                iconColor="#222831"
              />
              <CardStat
                icon={<Icon icon="mdi:clock-outline" width={24} />}
                label="Menunggu Diproses"
                value={menungguKonfirmasi.toString()}
                subtitle="Perlu dikerjakan"
                iconColor="#F2994A"
              />
              <CardStat
                icon={<Icon icon="mdi:progress-clock" width={24} />}
                label="Dalam Proses"
                value={dalamProses.toString()}
                subtitle="Sedang dikerjakan"
                iconColor="#2D9CDB"
              />
              <CardStat
                icon={<Icon icon="mdi:check-circle-outline" width={24} />}
                label="Selesai"
                value={selesai.toString()}
                subtitle="Siap diambil"
                iconColor="#27AE60"
              />
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 border">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-black">
                    Manajemen Pesanan
                  </h1>
                  <p className="text-gray-500">
                    Kelola semua pesanan laundry pelanggan
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2 w-full max-w-xl">
                  <input
                    type="text"
                    placeholder="Cari pesanan..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="border rounded px-3 py-2 w-full text-sm"
                  />
                  <div className="relative">
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-all duration-200 shadow-sm"
                    >
                      <Icon icon="mdi:filter-outline" className="w-4 h-4" />
                      <span>Filter</span>
                      <Icon
                        icon={
                          showFilter ? "mdi:chevron-up" : "mdi:chevron-down"
                        }
                        className="w-4 h-4 ml-1"
                      />
                    </button>
                    {showFilter && (
                      <div className="absolute mt-2 bg-white border rounded-md shadow-lg z-10 p-4 w-56 transition-all duration-200 ease-in-out transform origin-top-right">
                        <div className="mb-3 font-semibold text-sm text-gray-700 flex items-center">
                          <Icon
                            icon="mdi:filter-variant"
                            className="w-4 h-4 mr-2 text-blue-500"
                          />
                          Filter Status
                        </div>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                          value={filterStatus}
                          onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setShowFilter(false);
                            setCurrentPage(1); // Reset to first page on filter change
                          }}
                        >
                          <option value="">Semua Status</option>
                          <option value="pending">Menunggu Konfirmasi</option>
                          <option value="diproses">Diproses</option>
                          <option value="selesai">Selesai</option>
                        </select>

                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setFilterStatus("");
                              setSearchKeyword("");
                              setDateRange({ start: "", end: "" });
                              setShowFilter(false);
                              setCurrentPage(1); // Reset to first page on filter reset
                            }}
                            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-all duration-200"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#1f1f1f] hover:bg-[#3d3d3d] text-white px-4 py-2 rounded shadow text-sm font-semibold"
                >
                  + Pesanan Baru
                </button>
                {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
                      <TambahPesananPopup
                        isModal={true}
                        onClose={() => {
                          console.log("🚪 Closing add modal");
                          setShowModal(false);
                        }}
                        onAdded={async () => {
                          console.log("✅ Add completed, refreshing data");
                          setShowModal(false);
                          // Force refresh after successful add
                          await refreshPesanan();

                          // Show success message
                          setNotification({
                            show: true,
                            message: "Pesanan berhasil ditambahkan!",
                            type: "success",
                          });

                          setTimeout(() => {
                            setNotification((prev) => ({
                              ...prev,
                              show: false,
                            }));
                          }, 3000);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                      <p className="text-gray-600">Memuat pesanan...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Icon
                        icon="mdi:alert-circle-outline"
                        className="w-12 h-12 text-red-500"
                      />
                      <p className="text-red-500">{error}</p>
                    </div>
                  </div>
                ) : paginatedGroupedOrders.length > 0 ? (
                  <div className="space-y-3 p-4">
                    {paginatedGroupedOrders.map((customerGroup: any) => {
                      const customerKey = `${customerGroup.customerName}_${customerGroup.customerPhone}`;
                      const isExpanded = openCustomerId === customerKey;

                      return (
                        <div
                          key={customerKey}
                          className="bg-white rounded-lg border hover:shadow-sm transition-shadow"
                        >
                          {/* Customer Header */}
                          <div
                            className="bg-blue-50 border-l-4 border-blue-400 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => toggleCustomerRow(customerKey)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <Icon
                                    icon="mdi:account-circle"
                                    className="w-6 h-6 text-blue-500"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    {customerGroup.customerName}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Icon
                                        icon="mdi:phone"
                                        className="w-3 h-3"
                                      />
                                      <span>{customerGroup.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Icon
                                        icon="mdi:package-variant"
                                        className="w-3 h-3"
                                      />
                                      <span>
                                        {customerGroup.totalOrders} pesanan
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                                    Rp{" "}
                                    {customerGroup.totalAmount.toLocaleString(
                                      "id-ID"
                                    )}
                                  </div>
                                </div>

                                <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                                  <Icon
                                    icon={
                                      isExpanded
                                        ? "mdi:chevron-up"
                                        : "mdi:chevron-down"
                                    }
                                    className="w-4 h-4"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50">
                              <div className="p-4">
                                <h4 className="text-gray-700 mb-3 flex items-center gap-2">
                                  <Icon
                                    icon="mdi:format-list-bulleted"
                                    className="w-4 h-4"
                                  />
                                  Detail Pesanan ({customerGroup.orders.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          ID
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Alamat
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Layanan
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Catatan
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Bukti
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Kuantitas
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Harga
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Status
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Tanggal
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Aksi
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {customerGroup.orders.map(
                                        (item: Pesanan) => {
                                          console.log(
                                            "Item lampiran data:",
                                            item.lampiran
                                          ); // Tambah di sini
                                          return (
                                            <tr
                                              key={item.id}
                                              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                                            >
                                              <td className="px-3 py-2">
                                                ORD-
                                                {String(item.id).padStart(
                                                  3,
                                                  "0"
                                                )}
                                              </td>
                                              <td className="px-3 py-2">
                                                {item.alamat}
                                              </td>
                                              <td className="px-3 py-2">
                                                {typeof item.layanan ===
                                                "string"
                                                  ? item.layanan
                                                  : (item.layanan as any)
                                                      ?.nama_layanan ||
                                                    "Layanan tidak tersedia"}
                                              </td>
                                              <td className="px-3 py-2">
                                                {item.catatan}
                                              </td>
                                              <td className="px-3 py-2">
                                                {(item as any).lampiran ? (
                                                  <button
                                                    onClick={() =>
                                                      openPhotoModal(
                                                        getPhotoUrl(
                                                          (item as any).lampiran
                                                        )!
                                                      )
                                                    }
                                                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-xs"
                                                    title="Lihat Bukti"
                                                  >
                                                    <Icon
                                                      icon="mdi:image"
                                                      width="14"
                                                    />
                                                    Lihat
                                                  </button>
                                                ) : (
                                                  <span className="text-gray-400 text-xs">
                                                    Tidak ada
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2">
                                                {
                                                  getLayananTypeAndDisplay(item)
                                                    .display
                                                }
                                              </td>
                                              <td className="px-3 py-2">
                                                Rp{" "}
                                                {item.jumlah_harga
                                                  ? Math.round(
                                                      item.jumlah_harga
                                                    ).toLocaleString()
                                                  : "0"}
                                              </td>
                                              <td className="px-3 py-2">
                                                {item.status === "selesai" ? (
                                                  <span
                                                    className="px-3 py-1 rounded-md text-sm font-medium inline-flex items-center"
                                                    style={{
                                                      backgroundColor:
                                                        "#D1FAE5",
                                                      color: "#065F46",
                                                      border:
                                                        "1px solid #10B981",
                                                    }}
                                                  >
                                                    <Icon
                                                      icon="mdi:check-circle"
                                                      className="w-4 h-4 mr-1"
                                                    />
                                                    Selesai
                                                  </span>
                                                ) : (
                                                  <select
                                                    value={item.status}
                                                    disabled={loading}
                                                    onChange={(e) => {
                                                      const newStatus = e.target
                                                        .value as
                                                        | "pending"
                                                        | "diproses"
                                                        | "selesai";
                                                      handleStatusChange(
                                                        item.id,
                                                        newStatus,
                                                        item
                                                      );
                                                    }}
                                                    className="border px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    style={{
                                                      backgroundColor:
                                                        item.status ===
                                                        "pending"
                                                          ? "#FEF3C7"
                                                          : item.status ===
                                                            "diproses"
                                                          ? "#DBEAFE"
                                                          : "",
                                                      borderColor:
                                                        item.status ===
                                                        "pending"
                                                          ? "#F59E0B"
                                                          : item.status ===
                                                            "diproses"
                                                          ? "#3B82F6"
                                                          : "",
                                                      color:
                                                        item.status ===
                                                        "pending"
                                                          ? "#92400E"
                                                          : item.status ===
                                                            "diproses"
                                                          ? "#1E40AF"
                                                          : "",
                                                    }}
                                                  >
                                                    {item.status ===
                                                      "pending" && (
                                                      <>
                                                        <option value="pending">
                                                          Pending
                                                        </option>
                                                        <option value="diproses">
                                                          Proses
                                                        </option>
                                                      </>
                                                    )}
                                                    {item.status ===
                                                      "diproses" && (
                                                      <>
                                                        <option value="diproses">
                                                          Proses
                                                        </option>
                                                        <option value="selesai">
                                                          Selesai
                                                        </option>
                                                      </>
                                                    )}
                                                  </select>
                                                )}
                                              </td>
                                              <td className="px-3 py-2">
                                                {item.created_at
                                                  ? new Date(
                                                      item.created_at
                                                    ).toLocaleDateString(
                                                      "id-ID",
                                                      {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                      }
                                                    )
                                                  : "-"}
                                              </td>
                                              <td className="px-3 py-2">
                                                <div className="flex space-x-2">
                                                  {item.status ===
                                                    "pending" && (
                                                    <button
                                                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                                                      title="Edit Pesanan"
                                                      onClick={() => {
                                                        setEditPesananId(
                                                          item.id
                                                        );
                                                        setShowEditModal(true);
                                                      }}
                                                    >
                                                      <Icon
                                                        icon="mdi:pencil"
                                                        width="18"
                                                      />
                                                    </button>
                                                  )}
                                                  <button
                                                    className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                                                    title="Hapus Pesanan"
                                                    onClick={() =>
                                                      handleDeletePesanan(
                                                        item.id,
                                                        item.nama_pelanggan
                                                      )
                                                    }
                                                  >
                                                    <Icon
                                                      icon="mdi:trash"
                                                      width="18"
                                                    />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Summary Section */}
                                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        icon="mdi:calculator"
                                        className="w-4 h-4 text-blue-500"
                                      />
                                      <span className="text-blue-700">
                                        Total Pesanan
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xl text-blue-600">
                                        Rp{" "}
                                        {customerGroup.totalAmount.toLocaleString(
                                          "id-ID"
                                        )}
                                      </p>
                                      <p className="text-sm text-blue-500">
                                        {customerGroup.totalOrders} pesanan
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Icon
                        icon="mdi:package-variant-remove"
                        width="40"
                        className="text-gray-400"
                      />
                      <p className="text-gray-500 font-medium">
                        Tidak ada pesanan ditemukan
                      </p>
                      <p className="text-gray-400 text-sm">
                        Coba ubah filter atau tambahkan pesanan baru
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan {startIndex + 1} -{" "}
                    {Math.min(endIndex, totalItems)} dari {totalItems} pelanggan
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      🢀
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                      )
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-200 ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      🢂
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        show={deleteModal.show}
        title="Konfirmasi Hapus Pesanan"
        message={
          <>
            Apakah Anda yakin ingin menghapus pesanan{" "}
            <span className="font-semibold">{deleteModal.namaPelanggan}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </>
        }
        onCancel={cancelDeletePesanan}
        onConfirm={confirmDeletePesanan}
      />

      {showEditModal && editPesananId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <EditPesananPopup
              pesananId={editPesananId}
              isModal={true}
              onClose={() => {
                console.log("🚪 Closing edit modal without save");
                setShowEditModal(false);
                setEditPesananId(null);
              }}
              onUpdated={async () => {
                console.log(
                  "🎯 EditPesananPopup onUpdated callback triggered!"
                );
                console.log("📝 Edit pesanan ID was:", editPesananId);

                // Close modal first
                setShowEditModal(false);
                setEditPesananId(null);

                // Then refresh data
                console.log("🔄 About to call refreshPesanan...");
                await refreshPesanan();
                console.log("✅ refreshPesanan completed from onUpdated");

                // Show a brief success message
                setNotification({
                  show: true,
                  message: "Data pesanan berhasil diperbarui dan dimuat ulang!",
                  type: "success",
                });

                setTimeout(() => {
                  setNotification((prev) => ({ ...prev, show: false }));
                }, 3000);
              }}
            />
          </div>
        </div>
      )}

      {/* Weight Modal for Kiloan Services */}
      {showWeightModal && selectedPesananForWeight && (
        <WeightModal
          show={showWeightModal}
          pesananId={selectedPesananForWeight.id}
          namaPelanggan={selectedPesananForWeight.nama_pelanggan}
          layananHarga={selectedPesananForWeight.layanan_harga}
          layananNama={selectedPesananForWeight.layanan_nama}
          onClose={handleWeightModalClose}
          onConfirm={handleWeightConfirm}
        />
      )}

      {/* Quantity Modal for Satuan Services */}
      {showQuantityModal && selectedPesananForQuantity && (
        <QuantityModal
          show={showQuantityModal}
          namaPelanggan={selectedPesananForQuantity.nama_pelanggan}
          layananHarga={selectedPesananForQuantity.layanan_harga}
          layananNama={selectedPesananForQuantity.layanan_nama}
          onClose={handleQuantityModalClose}
          onConfirm={handleQuantityConfirm}
        />
      )}

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Bukti Pesanan
              </h3>
              <button
                onClick={closePhotoModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon icon="mdi:close" width="24" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-center">
                {selectedPhoto.toLowerCase().includes(".pdf") ? (
                  <div className="text-center">
                    <Icon
                      icon="mdi:file-pdf-box"
                      width="64"
                      className="text-red-500 mx-auto mb-4"
                    />
                    <p className="text-gray-600 mb-4">
                      File PDF - Klik untuk membuka
                    </p>
                    <a
                      href={selectedPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Icon icon="mdi:open-in-new" width="16" />
                      Buka PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedPhoto}
                    alt="Bukti Pesanan"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                           <div class="text-center p-8">
                             <div class="text-gray-400 mb-4">
                               <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                 <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                               </svg>
                             </div>
                             <p class="text-gray-500">Gagal memuat gambar</p>
                             <a href="${selectedPhoto}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                               <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                                 <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path>
                               </svg>
                               Buka di tab baru
                             </a>
                           </div>
                         `;
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
