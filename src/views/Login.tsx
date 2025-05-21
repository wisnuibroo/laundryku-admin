import { useState, ChangeEvent, FormEvent } from "react";
import { Icon } from "@iconify/react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextsProvider";
import axiosInstance from "../utils/axios";

export default function AdminLogin() {
  const { setUser, setToken, setUserType } = useStateContext();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.password) {
      setError("Username dan password harus diisi!");
      setLoading(false);
      return;
    }

    try {
      // Log data nu dikirim ka server
      console.log('Login Request Data:', {
        name: formData.name,
        password: formData.password
      });

      const response = await axiosInstance.post('/admin/login', {
        name: formData.name,
        password: formData.password
      });

      // Log response ti server
      console.log('Login Response Data:', response.data);

      const { admin, token } = response.data;
      
      // Set admin data as user in context
      setUser(admin);
      setToken(token);
      setUserType('admin'); // Set user type as admin
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error('Error:', err);
      const message = err.response?.data?.message || err.response?.data?.error || "Server error, cobian heula engke deui!";
      if (err.response?.status === 500) {
        setError("Aya masalah di server, mangga cobian heula engke deui!");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
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

          <h1 className="text-3xl font-bold text-[#00ADB5] mb-6 text-center">Admin Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="relative mt-4">
              <Icon icon="mdi:account" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan Name Admin"
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

            {error && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 bg-[#00ADB5] text-white rounded-full transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#008C94]'}`}
            >
              {loading ? 'Mencoba Login...' : 'Login'}
            </button>
          </form>

          {/* <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[#00ADB5] hover:text-[#008C94] text-sm"
            >
              Login sebagai User biasa?
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}