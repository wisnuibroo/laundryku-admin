import { ReactNode } from "react";
import { Icon } from "@iconify/react";

type MonthlyReportCardProps = {
    title: string;
    icon: ReactNode;
    data: { label: string; value: string }[];
};

export default function MonthlyReportCard({ title, icon, data }: MonthlyReportCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
            {/* Header */}
            <div className="bg-[#00ADB5] text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{title}</h3>
                <div className="text-white">{icon}</div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                        <span>{item.label}</span>
                        <span className="text-blue-500 font-semibold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
