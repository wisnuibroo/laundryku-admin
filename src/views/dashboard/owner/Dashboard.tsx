"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../../components/Sidebar";
import CardStat from "../../../components/CardStat";
import logo from "../../../assets/logo.png";

import { My_EmployeeSearch } from "../../../components/EmployeeSearch";
import { My_EmployeeDialog } from "../../../components/EmployeeDialog";
import { My_EmployeeList } from "../../../components/EmployeeList";
import { My_EmployeeTabs } from "../../../components/EmployeeTap";

export default function EmployeesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    salary: "",
  });

  const employees = [
    {
      id: 1,
      name: "Siti Nurhaliza",
      email: "siti@laundry.com",
      phone: "081234567890",
      position: "Supervisor",
      salary: 4500000,
      joinDate: "2023-01-15",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Ahmad Fauzi",
      email: "ahmad@laundry.com",
      phone: "081234567891",
      position: "Operator Mesin",
      salary: 3500000,
      joinDate: "2023-03-20",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Maya Sari",
      email: "maya@laundry.com",
      phone: "081234567892",
      position: "Customer Service",
      salary: 3200000,
      joinDate: "2023-05-10",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Budi Santoso",
      email: "budi@laundry.com",
      phone: "081234567893",
      position: "Delivery",
      salary: 3000000,
      joinDate: "2023-07-01",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Rina Wati",
      email: "rina@laundry.com",
      phone: "081234567894",
      position: "Operator Setrika",
      salary: 3200000,
      joinDate: "2023-08-15",
      status: "inactive",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      name: "Dedi Kurniawan",
      email: "dedi@laundry.com",
      phone: "081234567895",
      position: "Operator Mesin",
      salary: 3500000,
      joinDate: "2023-09-01",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 7,
      name: "Lina Marlina",
      email: "lina@laundry.com",
      phone: "081234567896",
      position: "Quality Control",
      salary: 3800000,
      joinDate: "2023-10-10",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 8,
      name: "Rudi Hartono",
      email: "rudi@laundry.com",
      phone: "081234567897",
      position: "Maintenance",
      salary: 4000000,
      joinDate: "2023-11-01",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const filteredEmployees = employees.filter((emp) =>
    [emp.name, emp.position, emp.email].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

   
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar tetap di kiri */}
      <div className="flex h-screen bg-gray-100">
         <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Konten utama digeser 64 (width sidebar) */}
      <div className="flex-1  overflow-auto">
        {/* Navbar */}
        <nav className="sticky top-0 z-10 w-full flex items-center justify-between bg-white px-6 py-6 shadow mb-2">

          <div className="flex items-center gap-2">
            <img src={logo} alt="Laundry Logo" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold text-gray-900">Laundry Owner</span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-xs text-gray-700 rounded">
              Manajemen Karyawan
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <Icon icon="mdi:bell-outline" width={22} />
            </button>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:account-circle-outline" width={22} className="text-gray-700" />
              <span className="text-sm text-gray-700">Owner</span>
            </div>
          </div>
        </nav>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <CardStat
              icon={<Icon icon="streamline-cyber:money-bag-1" width={24} />}
              label="Total Pendapatan"
              value="Rp. 130.000"
              subtitle="Bulan ini"
              iconColor="#222831"
            />
            <CardStat
              icon={<Icon icon="solar:box-linear" width={24} />}
              label="Total Pesanan"
              value="30"
              subtitle="Bulan ini"
              iconColor="#222831"
            />
            <CardStat
              icon={<Icon icon="stash:user-group-duotone" width={24} />}
              label="Total Pelanggan"
              value="30"
              subtitle="Pelanggan Aktif"
              iconColor="#222831"
            />
       
         
          </div>
{/* Tab Analitik */}
<My_EmployeeTabs
  isAddDialogOpen={isAddDialogOpen}
  setIsAddDialogOpen={setIsAddDialogOpen}
  newEmployee={newEmployee}
  setNewEmployee={setNewEmployee}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  filteredEmployees={filteredEmployees}
/>


 
 

       
        </div>
      </div>
    </div>
  );
}
