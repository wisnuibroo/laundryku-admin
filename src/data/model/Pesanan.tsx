// ❌ HAPUS import React di file model - ini bukan component!
// import { useState } from "react";

export interface Pesanan {
  id: number;
  id_owner: number;
  id_admin?: number;
  nama_pelanggan: string;
  nomor: string;
  alamat: string;
  id_layanan: number;
  layanan: string;
  berat?: number;
  banyak_satuan?: number; // NEW: Added satuan field for item quantity
  jumlah_harga?: number;
  status: "pending" | "diproses" | "selesai" | "dikembalikan" | "lunas";
  jenis_pembayaran?: "cash" | "transfer";
  catatan?: string;
  created_at: string;
  updated_at: string;
  owner?: {
    id: number;
    username: string;
    nama_laundry: string;
  };
  admin?: {
    id: number;
    username: string;
    nama_laundry: string;
  };
}

export interface Layanan {
  id: number;
  nama_layanan: string;
  harga_layanan: number;
  keterangan_layanan: string;
  tipe: "Kiloan" | "Satuan"; // Added tipe field
  waktu_pengerjaan?: number; // Added optional waktu_pengerjaan field
  id_owner: number;
  created_at?: string;
  updated_at?: string;
  status?: "aktif" | "nonaktif";
  owner?: {
    id: number;
    username: string;
    nama_laundry: string;
    email: string;
  };
}

export class PesananImpl implements Pesanan {
  constructor(
    public id: number,
    public id_owner: number,
    public nama_pelanggan: string,
    public nomor: string,
    public alamat: string,
    public id_layanan: number,
    public layanan: string,
    public status:
      | "pending"
      | "diproses"
      | "selesai"
      | "dikembalikan"
      | "lunas",
    public created_at: string,
    public updated_at: string,
    public id_admin?: number,
    public berat?: number,
    public banyak_satuan?: number,
    public jumlah_harga?: number,
    public jenis_pembayaran?: "cash" | "transfer",
    public catatan?: string,
    public owner?: {
      id: number;
      username: string;
      nama_laundry: string;
    },
    public admin?: {
      id: number;
      username: string;
      nama_laundry: string;
    }
  ) {}
  

  static fromJson(json: Record<string, any>): PesananImpl {
    return new PesananImpl(
      parseInt(json["id"].toString()),
      parseInt(json["id_owner"].toString()),
      json["nama_pelanggan"],
      json["nomor"],
      json["alamat"],
      json["id_layanan"],
      json["layanan"],
      json["status"],
      json["created_at"],
      json["updated_at"],
      json["id_admin"] ? parseInt(json["id_admin"].toString()) : undefined,
      json["berat"] ? parseFloat(json["berat"].toString()) : undefined,
      json["banyak_satuan"] ? parseInt(json["banyak_satuan"].toString()) : undefined, // NEW: Added satuan parsing
      json["jumlah_harga"]
        ? parseFloat(json["jumlah_harga"].toString())
        : undefined,
      json["jenis_pembayaran"],
      json["catatan"],
      json["owner"]
        ? {
            id: parseInt(json["owner"]["id"].toString()),
            username: json["owner"]["username"],
            nama_laundry: json["owner"]["nama_laundry"],
          }
        : undefined,
      json["admin"]
        ? {
            id: parseInt(json["admin"]["id"].toString()),
            username: json["admin"]["username"],
            nama_laundry: json["admin"]["nama_laundry"],
          }
        : undefined
    );
  }

  toJson(): Record<string, any> {
    return {
      id: this.id,
      id_owner: this.id_owner,
      id_admin: this.id_admin,
      nama_pelanggan: this.nama_pelanggan,
      nomor: this.nomor,
      alamat: this.alamat,
      layanan: this.layanan,
      berat: this.berat,
      banyak_satuan: this.banyak_satuan, // NEW: Added satuan to JSON output
      jumlah_harga: this.jumlah_harga,
      status: this.status,
      jenis_pembayaran: this.jenis_pembayaran,
      created_at: this.created_at,
      updated_at: this.updated_at,
      owner: this.owner,
      admin: this.admin,
    };
  }
}
