import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constants'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    useEffect(()=>{
        const fetchAllAdminJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllAdminJobs(res.data.jobs || []));
                }
            } catch (error) {
                console.log("Error fetching admin jobs:", error);
                dispatch(setAllAdminJobs([]));
            }
        }
        fetchAllAdminJobs();
    },[location.pathname, dispatch])
}

export default useGetAllAdminJobs
