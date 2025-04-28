type StatusButtonProps = {
  title: string;
  onClick: () => void;
  className?: string;
};

export default function StatusButton({ title, onClick, className }: StatusButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`items-center bg-[#00ADB5] text-white font-medium rounded-lg px-7 py-2 cursor-pointer ${className || ''}`}
    >
      <span>{title}</span>
    </button>
  );
}
