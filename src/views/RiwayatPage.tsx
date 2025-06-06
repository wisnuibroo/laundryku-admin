import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Search from "../components/search";

export default function RiwayatPage() {
 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  
    return (
        <div className="flex h-screen bg-white-100">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 p-6">  
                <h1 className="text-2xl font-semibold">Riwayat</h1>

                <div className="mt-10 ">
                  <Search/>
                </div>
   
                <div className="mt-6 bg-gray-100 p-4  shadow rounded-[10px]">
                  <table className="w-full text-center">
                    <thead>
                      <tr className="bg-gray-10 text-gray-600 text-sm ">
                        <th className="py-2 px-4">No</th> 
                        <th className="py-2 px-4">Nama</th> 
                        <th className="py-2 px-4">No.Hp</th>
                        <th className="py-2 px-4">Alamat</th>
                        <th className="py-2 pl-4 pr-8">Tanggal</th>
                      </tr>
                    </thead>


                    <tbody>
                      <tr className="bg-white rounded-[10px] text-sm text-black-600">
                        <td className="py-3 px-4 rounded-l-[19px]">1</td>
                        <td className="py-3 px-4">Stop yapping</td>
                        <td className="py-3 px-4">08112071740</td>
                        <td className="py-3 px-4">
                          Mitra Kost, Jl. Bae-Besito, Besito Kulon, Jurang,<br />
                          Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333
                        </td>
                        <td className="py-3 px-4 rounded-r-[19px]">17-10-2023</td>
                      </tr>


                    <div className="mt-6"/> 
                      <tr className="bg-white rounded-[10px] text-sm text-black-600">
                        <td className="py-3 px-4 rounded-l-[19px]">2</td>
                        <td className="py-3 px-4">udh yapinggnya?</td>
                        <td className="py-3 px-4">08974107410</td>
                        <td className="py-3 px-4=">
                          Jl. Bae-Gribig,Gribig,<br />
                          Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333
                        </td>
                        <td className="py-3 px-4 rounded-r-[19px]">17-10-2023</td>
                      </tr>

                    <div className="mt-6"/> 
                      <tr className="bg-white rounded-[10px] text-sm text-black-600">
                        <td className="py-3 px-4 rounded-l-[19px]">3</td>
                        <td className="py-3 px-4">Opotah bil</td>
                        <td className="py-3 px-4">08974107410</td>
                        <td className="py-3 px-4=">
                          Jl. Bae-Gribig,Gribig,<br />
                          Kec. Gebog, Kabupaten Kudus, Jawa Tengah 59333
                        </td>
                        <td className="py-3 px-4 rounded-r-[19px]">17-10-2023</td>
                      </tr>

                    </tbody>
                  </table>
                </div>
            </div>
        </div>
    );
}



  