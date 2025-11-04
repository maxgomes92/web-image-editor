import React from "react";
import { Trash2 } from "lucide-react";

export const ToolbarButton = ({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ size: number }>;
  label: string;
}) => {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 transform transition duration-150 ease-in-out active:scale-95 active:translate-y-px active:opacity-90 focus:outline-none"
    >
      <Icon size={22} />
      <span className="text-sm">{label}</span>
    </button>
  );
};

export function Toolbar() {
  return (
    <div className="absolute bottom-4 left-0 right-0 bg-transparent border-gray-300 flex items-center justify-center">
      <div className="text-white bg-neutral-900 py-4 px-6 rounded-xl gap-8 flex">
        <ToolbarButton Icon={Trash2} label="Delete" />
        <ToolbarButton Icon={Trash2} label="Delete" />
        <ToolbarButton Icon={Trash2} label="Delete" />
      </div>
    </div>
  );
}
