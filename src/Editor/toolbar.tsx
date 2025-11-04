import React from "react";

type ToolbarButtonProps = {
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export const ToolbarButton = ({
  Icon,
  label,
  onClick,
  disabled,
}: ToolbarButtonProps) => {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 transform transition duration-150 ease-in-out active:scale-95 active:translate-y-px active:opacity-90 focus:outline-none disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon size={22} />
      <span className="text-sm">{label}</span>
    </button>
  );
};

type ToolbarProps = {
  children?: React.ReactNode;
};

export function Toolbar({ children }: ToolbarProps) {
  return (
    <div className="absolute bottom-4 left-0 right-0 bg-transparent border-gray-300 flex items-center justify-center">
      <div className="text-white bg-neutral-900 py-4 px-6 rounded-xl gap-6 flex">
        {children}
      </div>
    </div>
  );
}
