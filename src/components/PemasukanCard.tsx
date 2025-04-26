import { ReactNode, useState } from "react";
import { Icon } from "@iconify/react";

type PemasukanCardProps = {
  title: string;
  icon: ReactNode;
  data: { value: string }[];
  waktu: string;
};

export default function PemasukanCard({ title, icon, data, waktu }: PemasukanCardProps) {
  const [visible, setVisible] = useState(true);

  const toggleVisibility = () => {
    setVisible((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
      <div className="bg-[#00ADB5] text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="text-white">{icon}</div>
      </div>

      <div className="p-4 space-y-3 relative">
        <div className="p-4 absolute top-4 right-4 cursor-pointer text-gray-600" onClick={toggleVisibility}>
          <Icon 
            icon={visible ? "clarity:eye-show-line" : "clarity:eye-hide-line"} 
            width={30} 
            height={30} 
          />
        </div>

        {visible && (
          data.map((item, idx) => (
            <div key={idx}>
              <span className="text-gray-500 font-semibold text-2xl">{item.value}</span>
            </div>
          ))
        )}
      </div>

      <div className="text-blue-500 text-sm px-4 py-3 flex justify-between items-center" >
        <h3 className="text-sm text-blue-500">{waktu}</h3>
        <div className="text-white">{icon}</div>
      </div>
      
    </div>
  );
}
