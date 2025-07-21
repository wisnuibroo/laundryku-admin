import { Icon } from "@iconify/react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface CardManageProps {
  icon: string;
  title: string;
  subtitle: string;
  bgColor?: string;
  textColor?: string;
  to?: string; // tujuan navigasi
}

const CardManage: React.FC<CardManageProps> = ({
  icon,
  title,
  subtitle,
  bgColor,
  textColor = "#FFFFFF",
  to,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-xl p-7 w-[350px] cursor-pointer shadow-md transition hover:scale-[1.02]"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="flex items-start gap-3">
        <Icon icon={icon} width={28} height={28} />
        <div>
          <h3 className="font-semibold text-[16px]">{title}</h3>
          <p className="text-sm opacity-80">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default CardManage;
