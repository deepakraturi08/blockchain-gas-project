import { useNavigate } from "react-router-dom";
import GetStarted from "../../assets/images/getStarted.png";
import { useEffect } from "react";
import One from "../../assets/images/one.jpg";
import Two from "../../assets/images/two.PNG";
import Three from "../../assets/images/three.jpg";
function Index() {
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen bg-[#252422] flex flex-col lg:flex-row justify-evenly items-center">
      <div className="h-[65%]">
        <img
          src={Three}
          alt="Get Started"
          className="h-full w-full object-contain" // or object-cover
          style={{ minHeight: "400px", minWidth: "400px" }} // Set minimum dimensions
        />
      </div>
      <div className="text-white flex flex-col gap-10">
        <div className="header">
          <h1 className="text-center text-[54px]">Let's Started</h1>
          <p>Get Gas at your door step.</p>
        </div>
        <div className="actions w-full flex flex-col gap-4">
          <button
            className="bg-[#fe6f2b] hover:bg-[#F59337] text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              navigate("user/auth/login");
            }}
          >
            User
          </button>
          <button
            className="bg-transparent border border-[#fe6f2b] hover:bg-[#F59337] text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              navigate("seller/auth/login");
            }}
          >
            Seller
          </button>
        </div>
      </div>
    </div>
  );
}
export default Index;
