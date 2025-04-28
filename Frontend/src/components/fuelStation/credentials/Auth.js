import { Outlet, useNavigate } from "react-router-dom";
import authImage from "../../../assets/images/AuthFuelStation.gif";
import { useEffect, useState } from "react";
import {
  AiOutlineMail,
  AiOutlineEyeInvisible,
  AiOutlineEye,
  AiOutlineLock,
  AiOutlineMobile,
} from "react-icons/ai";
import authService from "../../../services/auth.service";
import { toast } from "react-toastify";
import Four from "../../../assets/images/four.jpg";
function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#252422] flex flex-col lg:flex-row">
      {/* Image - Takes 60% width but doesn't force height */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-4 lg:p-8">
        <img
          src={Four}
          alt="Auth Image"
          className="w-auto h-auto max-h-[70vh] object-contain" // Adjust max-h as needed
        />
      </div>

      {/* Outlet Content - Takes 40% width with scrollable area */}
      <div className="w-full lg:w-[40%] flex flex-col p-4 lg:p-8 overflow-y-auto">
        <div className="text-white flex flex-col gap-10 min-h-0">
          {" "}
          {/* min-h-0 allows shrinking */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default Auth;
