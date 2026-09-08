import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_END_POINT } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../../redux/authSlice";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "",
  });

  const { loading, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Input Change Handler
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // ✅ Submit Handler
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log("Login submitted", input);

    // Validate that role is selected
    if (!input.role) {
      toast.error("Please select a role (Student or Recruiter)");
      return;
    }

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // important for cookies/session
        }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message || "Login successful!");
        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed!");
      }

    } catch (error) {
      console.error("Login Error:", error);

      // ✅ Show actual backend message if available
      if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server connection failed. Please try again.");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };
  useEffect(()=>{
    if(user){
        navigate("/");
    }
},[user, navigate])
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />
      <div className="flex items-center justify-center max-w-[1090px] mx-auto px-4">
        <form
          onSubmit={submitHandler}
          className="w-full sm:w-2/3 md:w-1/2 border border-border rounded-2xl p-6 sm:p-8 my-10 bg-card text-card-foreground shadow-xs"
        >
          <h1 className="font-bold text-2xl mb-1 text-foreground">
            Login to <span className="text-[#7209b7] dark:text-[#a855f7]">HirelyAI</span>
          </h1>
          <p className="text-xs text-muted-foreground mb-6">
            Welcome back! Access your personalized job recommendations and applications.
          </p>

          <div className="my-3">
            <Label className="text-foreground">Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="email@gmail.com"
              required
              className="mt-1"
            />
          </div>

          <div className="my-3">
            <Label className="text-foreground">Password</Label>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              placeholder="Your Password"
              required
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <RadioGroup 
              value={input.role} 
              onValueChange={(value) => setInput({ ...input, role: value })}
              className="flex items-center gap-4 my-5"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="student" id="student" className="text-[#7209b7] dark:text-[#a855f7] border-border" />
                <Label htmlFor="student" className="text-foreground cursor-pointer text-sm">Student</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="recruiter" id="recruiter" className="text-[#7209b7] dark:text-[#a855f7] border-border" />
                <Label htmlFor="recruiter" className="text-foreground cursor-pointer text-sm">Recruiter</Label>
              </div>
            </RadioGroup>
          </div>

          {loading ? (
            <Button className="w-full my-4 bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl shadow-xs">
              <Loader2 className="mr-2 h-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full my-4 bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl shadow-xs font-semibold"
            >
              Login
            </Button>
          )}

          <div className="text-sm text-center text-muted-foreground mt-2">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-[#7209b7] dark:text-[#a855f7] font-semibold hover:underline">
              Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );

};

export default Login;
