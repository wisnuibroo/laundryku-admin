import { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <aside className={`bg-[#00ADB5] text-white p-5 space-y-6 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      <button onClick={toggleSidebar} className="text-xl focus:outline-none">
        <Icon icon={isOpen ? "mdi:close" : "mdi:menu"} width="24" height="24" />
      </button>
      <div className="flex flex-col space-y-6">
        <SidebarItem icon={<Icon icon="mdi:view-dashboard" width="24" height="24" />} text="Dashboard" to="/dashboard/admin" isOpen={isOpen} />
        <SidebarItem icon={<Icon icon="solar:box-linear" width="24" height="24" />} text="Pesanan" to="/pesanan" isOpen={isOpen} />
      </div>
    </aside>
  );
}

type SidebarItemProps = {
  icon: ReactNode;
  text: string;
  to: string;
  isOpen: boolean;
};

function SidebarItem({ icon, text, to, isOpen }: SidebarItemProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center space-x-2 hover:opacity-80 transition-all duration-200 text-left"
    >
      {icon}
      {isOpen && <span>{text}</span>}
    </button>
  );
}
