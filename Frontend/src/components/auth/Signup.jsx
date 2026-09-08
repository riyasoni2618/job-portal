import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { USER_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/authSlice";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: null,
  });

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 📌 Handle text input
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // 📸 Handle file input
  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] ?? null });
  };

  // 🚀 Submit form
  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      !input.fullname ||
      !input.email ||
      !input.password ||
      !input.role ||
      !input.file
    ) {
      return toast.error("Please fill all fields and upload your profile image.");
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    formData.append("file", input.file); // ✅ Important line

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error?.response?.data?.message || "Signup failed!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar />
      <div className="flex items-center justify-center max-w-[1090px] mx-auto px-4">
        <form
          onSubmit={submitHandler}
          className="w-full sm:w-2/3 md:w-1/2 border border-border rounded-2xl p-6 sm:p-8 my-10 bg-card text-card-foreground shadow-xs"
        >
          <h1 className="font-bold text-2xl mb-1 text-foreground">
            Create your <span className="text-[#7209b7] dark:text-[#a855f7]">HirelyAI</span> Account
          </h1>
          <p className="text-xs text-muted-foreground mb-6">
            Join HirelyAI to discover AI-matched jobs, submit resumes, or recruit top talent.
          </p>

          <div className="my-3">
            <Label className="text-foreground">Full Name</Label>
            <Input
              type="text"
              name="fullname"
              value={input.fullname}
              onChange={changeEventHandler}
              placeholder="Enter Your Name"
              className="mt-1"
              required
            />
          </div>

          <div className="my-3">
            <Label className="text-foreground">Email</Label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="email@gmail.com"
              className="mt-1"
              required
            />
          </div>

          <div className="my-3">
            <Label className="text-foreground">Phone Number</Label>
            <Input
              type="text"
              name="phoneNumber"
              value={input.phoneNumber}
              onChange={changeEventHandler}
              placeholder="+91 0000000000"
              className="mt-1"
              required
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
              className="mt-1"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-5">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={input.role === "student"}
                  onChange={changeEventHandler}
                  className="accent-[#7209b7] cursor-pointer"
                />
                Student
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={input.role === "recruiter"}
                  onChange={changeEventHandler}
                  className="accent-[#7209b7] cursor-pointer"
                />
                Recruiter
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Profile Photo</Label>
              <Input
                accept="image/*"
                type="file"
                onChange={changeFileHandler}
                className="cursor-pointer text-xs h-8"
              />
            </div>
          </div>

          {loading ? (
            <Button className="w-full my-4 bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl shadow-xs" disabled>
              <Loader2 className="mr-2 h-4 animate-spin" /> Please wait...
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="w-full my-4 bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl shadow-xs font-semibold"
            >
              Signup
            </Button>
          )}

          <div className="text-sm text-center text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-[#7209b7] dark:text-[#a855f7] font-semibold hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );

};

export default Signup;
