import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';

const Browse = () => {
    useGetAllJobs();
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        };
    }, [dispatch]);

    return (
        <div className='min-h-screen bg-background transition-colors duration-200'>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10'>
                <h1 className='font-bold text-xl mb-6 text-foreground tracking-tight'>
                    Search Results ({allJobs.length})
                </h1>
                {allJobs.length === 0 ? (
                    <div className='text-center py-16 bg-card rounded-2xl border border-border shadow-xs'>
                        <p className='text-muted-foreground text-base'>No jobs found. Try searching with different keywords.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {allJobs.map((job) => (
                            <Job key={job._id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Browse;