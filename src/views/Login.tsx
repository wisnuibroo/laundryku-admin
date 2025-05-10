import { useState, ChangeEvent, FormEvent } from "react";
import { Icon } from "@iconify/react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login dengan:", formData);

    if (formData.username && formData.password) {
      navigate("/dashboard");
    } else {
      alert("Username dan password harus diisi!");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <img
              src="src/assets/logo.png" 
              alt="Logo"
              className="w-24 h-24 object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold  text-[#00ADB5] mb-6 text-center">Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="relative mt-4">
              <Icon icon="mdi:email" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan Email"
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              />
            </div>

            <div className="relative mt-4">
              <Icon icon="mdi:lock" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan Password"
                className="w-full pl-10 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            </div>

            <button 
              type="submit"
              className="w-full mt-6 py-3 bg-[#00ADB5] text-white rounded-full hover:bg-[#008C94] transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
