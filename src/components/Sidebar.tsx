import { ReactNode } from "react";
import { Icon } from "@iconify/react";

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
        <SidebarItem icon={<Icon icon="mdi:view-dashboard" width="24" height="24" />} text="Dashboard" isOpen={isOpen} />
        <SidebarItem icon={<Icon icon="mdi:motorbike" width="24" height="24" />} text="Pesanan" isOpen={isOpen} />
        <SidebarItem icon={<Icon icon="mdi:history" width="24" height="24" />} text="Riwayat" isOpen={isOpen} />
        <SidebarItem icon={<Icon icon="mdi:message-text" width="24" height="24" />} text="Pesan" isOpen={isOpen} />
        <SidebarItem icon={<Icon icon="solar:bill-list-bold" width="24" height="24" />} text="Tagihan" isOpen={isOpen} />
        <SidebarItem icon={<Icon icon="mdi:cog" width="24" height="24" />} text="Pengaturan" isOpen={isOpen} />
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
