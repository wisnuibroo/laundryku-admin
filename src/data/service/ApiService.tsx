import axiosInstance from "../../lib/axios";
import { Layanan, Pesanan } from "../model/Pesanan";

// Pastikan ada konstanta untuk base URL
const API_BASE_URL = "https://laundryku.rplrus.com/api";

export interface Person {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  join_date: string;
  status: string;
  avatar: string;
  id_owner: number;
}

export const getKaryawan = async (id_owner: number): Promise<Person[]> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    const response = await axiosInstance.get(`/person?id_owner=${id_owner}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil data karyawan");
  }
};

export const getUrl = async (
  setPesanan: React.Dispatch<React.SetStateAction<Pesanan[]>>,
  id_owner?: number
) => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    const response = await axiosInstance.get(`/pesanan?id_owner=${id_owner}`);

    if (
      response.data &&
      response.data.status &&
      Array.isArray(response.data.data)
    ) {
      setPesanan(response.data.data);
    } else if (Array.isArray(response.data)) {
      setPesanan(response.data);
    } else {
      console.error("Data pesanan bukan array:", response.data);
      setPesanan([]);
    }
  } catch (error: any) {
    setPesanan([]);
    throw new Error(error.message || "Gagal mengambil data pesanan");
  }
};

export const updateStatusPesanan = async (
  id: number,
  status: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put(`/pesanan/${id}`, { status });
    return response.status === 200;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gagal merubah status pesanan";
    throw new Error(errorMessage);
  }
};

export const updateHargaPesanan = async (
  id: number,
  jumlah_harga: number
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put(`/pesanan/${id}`, {
      jumlah_harga,
    });
    return response.status === 200;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gagal merubah harga pesanan";
    throw new Error(errorMessage);
  }
};

export interface StatistikData {
  total_pendapatan: number;
  total_pesanan: number;
  total_pelanggan: number;
  pesanan_per_bulan: Array<{ bulan: string; jumlah: number }>;
  pendapatan_per_bulan: Array<{ bulan: string; jumlah: number }>;
}

export const getStatistik = async (
  id_owner: number
): Promise<StatistikData> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }
    const response = await axiosInstance.get(`/statistik?id_owner=${id_owner}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengambil data statistik");
  }
};

interface TambahPesananInput {
  id_owner: number;
  id_admin?: number;
  nama_pelanggan: string;
  nomor: string;
  alamat: string;
  layanan: string;
  id_layanan: number; // Tambahkan ini
  berat?: number;
  jumlah_harga?: number;
  status?: "pending" | "diproses" | "selesai" | "lunas";
  jenis_pembayaran?: "cash" | "transfer";
  catatan: string;
}

export const tambahPesanan = async (
  data: TambahPesananInput
): Promise<void> => {
  try {
    const response = await axiosInstance.post("/pesanan", data);
    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Gagal menambahkan pesanan");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gagal menambahkan pesanan";
    throw new Error(errorMessage);
  }
};

// PERBAIKAN: Fungsi getLayanan yang konsisten
export const getLayanan = async (id_owner?: number): Promise<Layanan[]> => {
  try {
    console.log("🔍 getLayanan called with id_owner:", id_owner);

    // Gunakan axiosInstance untuk konsistensi
    const url = id_owner ? `/layanan?id_owner=${id_owner}` : "/layanan";
    console.log("📡 Request URL:", url);

    const response = await axiosInstance.get(url);
    console.log("📊 getLayanan response status:", response.status);
    console.log("📊 getLayanan response data:", response.data);

    let layananList: Layanan[] = [];

    // Handle berbagai format response
    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.data)
    ) {
      console.log("✅ Response format: { success: true, data: [] }");
      layananList = response.data.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log("✅ Response format: { data: [] }");
      layananList = response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log("✅ Response format: array");
      layananList = response.data;
    } else if (response.data && Array.isArray(response.data.layanan)) {
      console.log("✅ Response format: { layanan: [] }");
      layananList = response.data.layanan;
    } else {
      console.warn("⚠️ Unexpected response format:", response.data);
      layananList = [];
    }

    // PERBAIKAN: Filter berdasarkan owner jika id_owner diberikan
    if (id_owner && layananList.length > 0) {
      const originalCount = layananList.length;
      layananList = layananList.filter(
        (layanan) => layanan.id_owner === id_owner
      );
      console.log(
        `🔍 Filtered layanan: ${originalCount} -> ${layananList.length} items for owner ${id_owner}`
      );
    }

    console.log("✅ Final layanan list:", layananList.length, "items");
    return layananList;
  } catch (error: any) {
    console.error("🚨 Error in getLayanan:", error);
    console.error("🚨 Error response:", error.response?.data);
    console.error("🚨 Error status:", error.response?.status);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Gagal mengambil layanan"
    );
  }
};

// PERBAIKAN: Fungsi getLayananByOwner yang lebih robust
export const getLayananByOwner = async (
  ownerId: number
): Promise<Layanan[]> => {
  try {
    console.log("🔍 getLayananByOwner called with ID:", ownerId);

    if (!ownerId || ownerId <= 0) {
      throw new Error("Owner ID tidak valid");
    }

    // Coba dengan axiosInstance terlebih dahulu (lebih konsisten)
    try {
      console.log("📡 Trying with axiosInstance...");
      const response = await axiosInstance.get(`/layanan?id_owner=${ownerId}`);
      console.log("✅ axiosInstance success:", response.data);

      let layananList: Layanan[] = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        layananList = response.data.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        layananList = response.data.data;
      } else if (Array.isArray(response.data)) {
        layananList = response.data;
      } else {
        throw new Error("Format response tidak sesuai");
      }

      // Filter sekali lagi untuk memastikan
      layananList = layananList.filter(
        (layanan) => layanan.id_owner === ownerId
      );

      console.log(
        "✅ Final filtered layanan via axiosInstance:",
        layananList.length,
        "items for owner",
        ownerId
      );
      return layananList;
    } catch (axiosError) {
      console.warn("⚠️ axiosInstance failed, trying manual fetch:", axiosError);

      // Fallback ke manual fetch
      const token =
        localStorage.getItem("ACCESS_TOKEN") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const url = `${API_BASE_URL}/layanan?id_owner=${ownerId}`;
      console.log("📡 Manual fetch URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("📊 Manual fetch response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Manual fetch API Error:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Manual fetch API Response:", data);

      let layananList: Layanan[] = [];

      if (data.success && Array.isArray(data.data)) {
        layananList = data.data;
      } else if (Array.isArray(data)) {
        layananList = data;
      } else {
        throw new Error("Format response tidak sesuai");
      }

      // Filter sekali lagi untuk memastikan
      layananList = layananList.filter(
        (layanan) => layanan.id_owner === ownerId
      );

      console.log(
        "✅ Final filtered layanan via manual fetch:",
        layananList.length,
        "items for owner",
        ownerId
      );
      return layananList;
    }
  } catch (error) {
    console.error("🚨 Error in getLayananByOwner:", error);
    throw error;
  }
};

interface TambahLayananInput {
  id_owner: number;
  nama_layanan: string;
  harga_layanan: string; // String sesuai dengan validasi PHP
  keterangan_layanan: string;
}

export const tambahLayanan = async (
  data: TambahLayananInput
): Promise<void> => {
  try {
    console.log("🚀 tambahLayanan called with data:", data);

    // Pastikan format data sesuai dengan validasi controller PHP
    const formattedData = {
      nama_layanan: data.nama_layanan.trim(),
      harga_layanan: data.harga_layanan.toString(), // Pastikan string
      keterangan_layanan: data.keterangan_layanan.trim(),
      id_owner: Number(data.id_owner), // Pastikan number
    };

    console.log("📝 Formatted data for API:", formattedData);

    // Validasi sebelum kirim
    if (!formattedData.nama_layanan) {
      throw new Error("Nama layanan tidak boleh kosong");
    }
    if (!formattedData.harga_layanan || formattedData.harga_layanan === "0") {
      throw new Error("Harga layanan harus diisi dan lebih dari 0");
    }
    if (!formattedData.keterangan_layanan) {
      throw new Error("Keterangan layanan tidak boleh kosong");
    }
    if (!formattedData.id_owner || formattedData.id_owner <= 0) {
      throw new Error("ID Owner tidak valid");
    }

    const response = await axiosInstance.post("/layanan", formattedData);

    console.log("✅ tambahLayanan response:", response.status, response.data);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Gagal menambahkan layanan");
    }
  } catch (error: any) {
    console.error("🚨 Error in tambahLayanan:", error);
    console.error("🚨 Error response:", error.response?.data);

    if (error.response?.data?.errors) {
      // Handle validation errors dari Laravel
      const errorMessages = Object.entries(error.response.data.errors)
        .map(
          ([field, messages]) =>
            `${field}: ${(messages as string[]).join(", ")}`
        )
        .join("; ");
      throw new Error(`Validasi gagal: ${errorMessages}`);
    }

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gagal menambahkan layanan";
    throw new Error(errorMessage);
  }
};
