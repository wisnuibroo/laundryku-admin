import { ReactNode } from "react";

type CardProps = {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
};

function BtnQuickAccess({ icon, title, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#00ADB5] text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center hover:bg-[#019ba1] active:scale-95 transition-all"
    >
      {icon}
      <p className="mt-2 text-lg font-semibold">{title}</p>
    </button>
  );
}

export default BtnQuickAccess;
