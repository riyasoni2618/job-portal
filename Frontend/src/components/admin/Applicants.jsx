import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constants';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';


const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const {applicants} = useSelector(store=>store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                dispatch( setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    }, [params.id, dispatch]);
    return (
        <div className='min-h-screen bg-background text-foreground pb-12 transition-colors duration-200'>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10 px-4 sm:px-6'>
                <h1 className='font-bold text-2xl text-foreground mb-6'>
                    Applicants ({applicants?.application?.length || 0})
                </h1>
                <ApplicantsTable />
            </div>
        </div>
    )
}
export default Applicants