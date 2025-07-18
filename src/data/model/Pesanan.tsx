import { useState } from "react";

export interface Pesanan {
  id: number;
  id_user: number;
  id_laundry: number;
  tanggal_pesanan: string;
  status: string;
  total_harga: string;
  jenis_pembayaran: string;
  tgl_langganan_berakhir: string;
  name: string;
  phone: string;
  alamat: string;
  waktu_ambil: string;
  catatan: string;
  info_pesanan: string;
  user?: {
    id: number;
    name: string;
    phone: string;
  };
}

export class PesananImpl implements Pesanan {
  constructor(
    public id: number,
    public id_user: number,
    public id_laundry: number,
    public tanggal_pesanan: string,
    public status: string,
    public total_harga: string,
    public jenis_pembayaran: string,
    public tgl_langganan_berakhir: string,
    public name: string,
    public phone: string,
    public alamat: string,
    public waktu_ambil: string,
    public catatan: string,
    public info_pesanan: string,
    public user?: {
      id: number;
      name: string;
      phone: string;
    }
  ) {}

  static fromJson(json: Record<string, any>): PesananImpl {
    return new PesananImpl(
      parseInt(json['id'].toString()),
      parseInt(json['id_user'].toString()),
      parseInt(json['id_laundry'].toString()),
      json['tanggal_pesanan'],
      json['status'],
      json['total_harga'],
      json['jenis_pembayaran'],
      json['tgl_langganan_berakhir'],
      json['name'],
      json['phone'],
      json['alamat'],
      json['waktu_ambil'],
      json['catatan'],
      json['info_pesanan'],
      json['user'] ? {
        id: parseInt(json['user']['id'].toString()),
        name: json['user']['name'],
        phone: json['user']['phone']
      } : undefined
    );
  }

  toJson(): Record<string, any> {
    return {
      id: this.id,
      id_user: this.id_user,
      id_laundry: this.id_laundry,
      tanggal_pesanan: this.tanggal_pesanan,
      status: this.status,
      total_harga: this.total_harga,
      jenis_pembayaran: this.jenis_pembayaran,
      tgl_langganan_berakhir: this.tgl_langganan_berakhir,
      name: this.name,
      phone: this.phone,
      alamat: this.alamat,
      waktu_ambil: this.waktu_ambil,
      catatan: this.catatan,
      info_pesanan: this.info_pesanan,
      user: this.user
    };
  }
}

const [pesanan, setPesanan] = useState<Pesanan[]>([]);