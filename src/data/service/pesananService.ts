import axiosInstance from "../../lib/axios";
import { Pesanan } from "../model/Pesanan";

// Interface untuk menambah pesanan sesuai dengan PesananController
export interface AddPesananInput {
  id_owner?: number;
  id_admin?: number;
  name?: string; // akan dipetakan ke nama_pelanggan
  phone?: string; // akan dipetakan ke nomor
  nama_pelanggan?: string; // field langsung
  nomor?: string; // field langsung
  alamat: string;
  id_layanan?: number; // ID layanan (required by API)
  layanan?: string; // Nama layanan (optional)
  berat?: number;
  satuan?: number; // Frontend field for quantity
  banyak_satuan?: number; // Backend field name
  total_harga?: number; // akan dipetakan ke jumlah_harga
  jumlah_harga?: number; // field langsung
  jenis_pembayaran?: "cash" | "transfer";
  catatan?: string;
  status?: "pending" | "diproses" | "selesai" | "lunas";
}

export const addPesanan = async (data: AddPesananInput): Promise<Pesanan> => {
  try {
    console.log("Raw data received in addPesanan:", data);
    console.log("Data type check:", {
      id_owner: typeof data.id_owner,
      id_admin: typeof data.id_admin,
      nama_pelanggan: typeof data.nama_pelanggan,
      nomor: typeof data.nomor,
      alamat: typeof data.alamat,
      id_layanan: typeof data.id_layanan,
      layanan: typeof data.layanan,
      catatan: typeof data.catatan,
    });

    // Map data sesuai dengan field yang dibutuhkan PesananController
    const payload = {
      id_owner: Number(data.id_owner),
      id_admin: data.id_admin ? Number(data.id_admin) : undefined,
      nama_pelanggan: (data.nama_pelanggan || data.name || "").trim(),
      nomor: (data.nomor || data.phone || "").trim(),
      alamat: data.alamat.trim(),
      id_layanan: Number(data.id_layanan), // Required by API
      layanan: data.layanan ? data.layanan.trim() : undefined, // Optional
      berat: Number(data.berat || 0),
      // Map satuan to banyak_satuan for backend compatibility
      banyak_satuan: data.satuan
        ? Number(data.satuan)
        : data.banyak_satuan
        ? Number(data.banyak_satuan)
        : undefined,
      jumlah_harga: Number(data.jumlah_harga || data.total_harga || 0),
      status: data.status || "pending",
      jenis_pembayaran:
        data.jenis_pembayaran?.toLowerCase() === "tunai"
          ? "cash"
          : data.jenis_pembayaran?.toLowerCase(),
      catatan: data.catatan    
    };

    console.log("Mapped payload for API:", payload);
    console.log("API endpoint: /pesanan");
    console.log("Payload type check:", {
      id_owner: typeof payload.id_owner,
      id_admin: typeof payload.id_admin,
      nama_pelanggan: typeof payload.nama_pelanggan,
      nomor: typeof payload.nomor,
      alamat: typeof payload.alamat,
      id_layanan: typeof payload.id_layanan,
      layanan: typeof payload.layanan,
      banyak_satuan: typeof payload.banyak_satuan,
    });

    const response = await axiosInstance.post("/pesanan", payload);

    console.log("API response:", response.data);

    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && response.data.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error: any) {
    console.error("Error in addPesanan:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.message);

    // Log detail error jika ada
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }

    let errorMessage = "Gagal menambahkan pesanan";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Handle validation errors from API
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

    throw new Error(errorMessage);
  }
};

export const getPesanan = async (id_owner?: number): Promise<Pesanan[]> => {
  try {
    if (!id_owner) {
      throw new Error("ID Owner tidak ditemukan");
    }

    console.log("Fetching pesanan with id_owner:", id_owner);
    const response = await axiosInstance.get(`/pesanan?id_owner=${id_owner}`);
    console.log("API Response:", response.data);

    // Handle response sesuai dengan structure PesananController
    if (
      response.data &&
      response.data.status &&
      Array.isArray(response.data.data)
    ) {
      console.log("Returning pesanan data array:", response.data.data);
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log("Returning direct array:", response.data);
      return response.data;
    }

    console.log("No valid pesanan data found, returning empty array");
    return [];
  } catch (error: any) {
    console.error("Error in getPesanan:", error);
    throw new Error(error.message || "Gagal mengambil data pesanan");
  }
};

export const updatePesanan = async (
  id: number,
  data: Partial<AddPesananInput>
): Promise<Pesanan> => {
  console.log("🔧 Starting updatePesanan...");
  console.log("📝 Pesanan ID:", id);
  console.log("📊 Raw update data:", data);

  try {
    // Map data sesuai dengan field yang dibutuhkan PesananController
    const payload: any = {};

    if (data.name) payload.nama_pelanggan = data.name;
    if (data.nama_pelanggan) payload.nama_pelanggan = data.nama_pelanggan;
    if (data.phone) payload.nomor = data.phone;
    if (data.nomor) payload.nomor = data.nomor;
    if (data.alamat) payload.alamat = data.alamat;
    if (data.layanan) payload.layanan = data.layanan;
    if (data.id_layanan) payload.id_layanan = Number(data.id_layanan);
    if (data.id_owner) payload.id_owner = Number(data.id_owner);
    if (data.berat !== undefined) payload.berat = Number(data.berat);

    // Handle quantity mapping - prioritize satuan over banyak_satuan
    if (data.satuan !== undefined) {
      payload.banyak_satuan = Number(data.satuan);
    } else if (data.banyak_satuan !== undefined) {
      payload.banyak_satuan = Number(data.banyak_satuan);
    }

    if (data.total_harga !== undefined)
      payload.jumlah_harga = Number(data.total_harga);
    if (data.jumlah_harga !== undefined)
      payload.jumlah_harga = Number(data.jumlah_harga);
    if (data.status) payload.status = data.status;
    
    if (data.jenis_pembayaran) {
      payload.jenis_pembayaran =
        data.jenis_pembayaran.toLowerCase() === "tunai"
          ? "cash"
          : data.jenis_pembayaran.toLowerCase();
    }
    if (data.catatan) payload.catatan = data.catatan;
    console.log("📊 Mapped payload for API:", payload);

    const response = await axiosInstance.put(`/pesanan/${id}`, payload);

    console.log("📡 Response status:", response.status);
    console.log("📊 API response:", response.data);

    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && response.data.data) {
      console.log(
        "✅ updatePesanan completed successfully - returning data.data"
      );
      return response.data.data;
    }

    console.log(
      "✅ updatePesanan completed successfully - returning response.data"
    );
    return response.data;
  } catch (error: any) {
    console.error("🚨 Error in updatePesanan:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      "Gagal mengupdate pesanan";

    console.error("❌ Final error message:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const deletePesanan = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete(`/pesanan/${id}`);
    return response.status === 200;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gagal menghapus pesanan";
    throw new Error(errorMessage);
  }
};

export const getPesananById = async (id: number): Promise<Pesanan> => {
  try {
    const response = await axiosInstance.get(`/pesanan/${id}`);

    // Handle response sesuai dengan structure PesananController
    if (response.data && response.data.status && response.data.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Pesanan tidak ditemukan";
    throw new Error(errorMessage);
  }
};
