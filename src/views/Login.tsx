import { useState, ChangeEvent, FormEvent } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  // Handle perubahan input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit form
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
    <div className="h-screen flex bg-white">
      <div className="w-3/5 flex items-center justify-center px-20">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-light text-gray-600 mb-6">Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="relative mt-4">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Insert Username"
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              />
            </div>

            <div className="relative mt-4">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Insert Password"
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
              onClick={(e) => handleSubmit(e)}
              className="w-full mt-6 py-3 bg-[#00ADB5] text-white rounded-full hover:bg-[#008C94] transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <div className="w-2/5 bg-[#00ADB5] rounded-l-[100px]"></div>
    </div>
  );
}

export default Login;
