import { useState, useRef } from "react";
import { FiUpload } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };
  

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold">Laundry Settings</h1>

        <div className="flex justify-center mt-14">
          <div className="bg-gray-100 p-8 rounded-[15px] shadow-md w-full max-w-lg">
            <h2 className="text-lg font-semibold text-cyan-600 mb-6">
              Edit Laundry
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nama Laundry</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-200 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Jenis Laundry</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-200 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Alamat</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-200 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">No. Hp</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-200 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Foto Laundry</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <FiUpload size={18} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-gray-200 rounded focus:outline-none"
                    disabled
                    value={selectedImage ? "File dipilih" : ""}
                    placeholder="Upload file"
                  />
                </div>

                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="mt-4 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div className="text-right">
                <button className="bg-cyan-600 text-white px-6 py-2 rounded shadow hover:bg-cyan-700">
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
