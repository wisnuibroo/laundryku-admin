import { ReactNode } from "react";

type CardStatProps = {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  iconColor?: string;
};

export default function CardStat({ icon, label, value, subtitle, iconColor,  }: CardStatProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4 flex flex-col min-w-[180px] min-h-[70px] "
     
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-full bg-gray-100 p-2 flex items-center justify-center" style={{ color: iconColor }}>
          {icon}
        </span>
        <span className="text-gray-500 text-xs ml-2">{label}</span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-2xl font-bold" style={{ color: iconColor }}>{value}</span>
        {subtitle && <span className="text-xs text-gray-500 mt-1">{subtitle}</span>}
      </div>
    </div>
  );
}