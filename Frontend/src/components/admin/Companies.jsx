import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(setSearchCompanyByText(input));
    },[input]);
    return (
        <div className='min-h-screen bg-background text-foreground pb-12 transition-colors duration-200'>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10 px-4 sm:px-6'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-5'>
                    <div>
                        <h1 className='text-2xl font-bold text-foreground'>My Companies</h1>
                        <p className='text-xs text-muted-foreground mt-0.5'>Manage your registered companies and brand profiles</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Input
                            className="w-full sm:w-64 bg-card border-border text-foreground"
                            placeholder="Filter by name"
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button 
                            onClick={() => navigate("/admin/companies/create")} 
                            className="bg-[#7209b7] hover:bg-[#5f0799] text-white shrink-0"
                        >
                            New Company
                        </Button>
                    </div>
                </div>
                <CompaniesTable/>
            </div>
        </div>
    )
}

export default Companies