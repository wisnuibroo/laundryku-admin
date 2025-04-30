import { useNavigate } from 'react-router-dom';

type StatusButtonProps = {
  title: string;
  onClick: string | (() => void) 
  className?: string;
};

export default function StatusButton({ title, onClick, className }: StatusButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof onClick === "string") {
      navigate(onClick);
    } else if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`items-center bg-[#00ADB5] text-white font-medium rounded-lg px-7 py-2 cursor-pointer ${className || ''}`}
    >
      <span>{title}</span>
    </button>
  );
}
