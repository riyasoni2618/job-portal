import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs.jsx'

import { setSearchJobByText } from '@/redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className='min-h-screen bg-background text-foreground pb-12 transition-colors duration-200'>
      <Navbar />
      <div className='max-w-6xl mx-auto my-10 px-4 sm:px-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-5'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>My Posted Jobs</h1>
            <p className='text-xs text-muted-foreground mt-0.5'>Manage all your active job postings and applicants</p>
          </div>
          <div className='flex items-center gap-3'>
            <Input
              className="w-full sm:w-64 bg-card border-border text-foreground"
              placeholder="Filter by name, role"
              onChange={(e) => setInput(e.target.value)}
            />
            <Button 
              onClick={() => navigate("/admin/jobs/create")} 
              className="bg-[#7209b7] hover:bg-[#5f0799] text-white shrink-0"
            >
              New Job
            </Button>
          </div>
        </div>
        <AdminJobsTable />
      </div>
    </div>
  )
}

export default AdminJobs 