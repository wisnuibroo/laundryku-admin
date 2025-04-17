import { ReactNode } from "react";
import { MdDashboard, MdHistory, MdSettings, MdMenu, MdClose } from "react-icons/md";
import { FaMotorcycle, FaComments, FaClipboardList } from "react-icons/fa";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <aside className={`bg-[#00ADB5] text-white p-5 space-y-6 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      <button onClick={toggleSidebar} className="text-xl focus:outline-none">
        {isOpen ? <MdClose /> : <MdMenu />}
      </button>
      <div className="flex flex-col space-y-6">
        <SidebarItem icon={<MdDashboard size={24} />} text="Dashboard" isOpen={isOpen} />
        <SidebarItem icon={<FaMotorcycle size={24} />} text="Pesanan" isOpen={isOpen} />
        <SidebarItem icon={<MdHistory size={24} />} text="Riwayat" isOpen={isOpen} />
        <SidebarItem icon={<FaComments size={24} />} text="Pesan" isOpen={isOpen} />
        <SidebarItem icon={<FaClipboardList size={24} />} text="Tagihan" isOpen={isOpen} />
        <SidebarItem icon={<MdSettings size={24} />} text="Pengaturan" isOpen={isOpen} />
      </div>
    </aside>
  );
}

type SidebarItemProps = {
  icon: ReactNode;
  text: string;
  isOpen: boolean;
};

function SidebarItem({ icon, text, isOpen }: SidebarItemProps) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      {isOpen && <span>{text}</span>}
    </div>
  );
}
