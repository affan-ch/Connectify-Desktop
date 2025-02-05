"use client";

export default function CustomTitleBar() {
  return (
    <div
      data-tauri-drag-region
      className="absolute top-0 left-0 w-full h-10 bg-gray-900 flex items-center justify-center font-bold px-4"
    >
      <span className="text-sm">Connectify Desktop</span>
    </div>
  );
}
