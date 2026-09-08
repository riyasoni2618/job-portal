import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constants'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
     const dispatch = useDispatch();
    const registerNewCompany = async () => {
        if (!companyName || companyName.trim() === "") {
            toast.error("Please enter a company name");
            return;
        }
        
        try {
            console.log("🚀 Registering company:", companyName);
            console.log("🔗 API Endpoint:", `${COMPANY_API_END_POINT}/register`);
            
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json',
                },
                withCredentials:true
            });
            
            console.log("✅ Response:", res.data);
            
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            } else {
                toast.error(res.data.message || "Failed to create company");
            }
        } catch (error) {
            console.error("❌ Company Registration Error:", error);
            console.error("❌ Error Response:", error.response?.data);
            console.error("❌ Error Status:", error.response?.status);
            
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Please login again.");
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message === "Network Error") {
                toast.error("Cannot connect to server. Please check if the backend is running.");
            } else {
                toast.error("Failed to create company. Please try again.");
            }
        }
    }
    return (
        <div className='min-h-screen bg-background text-foreground pb-12 transition-colors duration-200'>
            <Navbar />
            <div className='max-w-2xl mx-auto my-10 px-4'>
                <div className='bg-card border border-border text-card-foreground rounded-2xl p-8 shadow-sm'>
                    <div className='mb-6'>
                        <h1 className='font-bold text-2xl text-foreground'>Your Company Name</h1>
                        <p className='text-muted-foreground text-sm mt-1'>What would you like to name your company? You can change this later.</p>
                    </div>

                    <div className='space-y-2'>
                        <Label className="text-foreground font-semibold">Company Name</Label>
                        <Input
                            type="text"
                            className="bg-background border-border text-foreground"
                            placeholder="e.g. Google, Microsoft, Startup Inc."
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div className='flex items-center gap-3 mt-8'>
                        <Button 
                            variant="outline" 
                            className="border-border text-foreground hover:bg-muted" 
                            onClick={() => navigate("/admin/companies")}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={registerNewCompany} 
                            className="bg-[#7209b7] hover:bg-[#5f0799] text-white"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate