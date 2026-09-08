import React, { useEffect, useState, useMemo } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Pagination from './shared/Pagination';

const Browse = () => {
    useGetAllJobs();
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();

    const JOBS_PER_PAGE = 12;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        };
    }, [dispatch]);

    // Reset to page 1 whenever jobs list changes
    useEffect(() => {
        setCurrentPage(1);
    }, [allJobs]);

    const totalPages = Math.ceil((allJobs?.length || 0) / JOBS_PER_PAGE);

    // Keep currentPage within bounds
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedJobs = useMemo(() => {
        if (!allJobs || allJobs.length === 0) return [];
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return allJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [allJobs, currentPage]);

    return (
        <div className='min-h-screen bg-background pb-16 transition-colors duration-200'>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10'>
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className='font-bold text-xl text-foreground tracking-tight'>
                            Search Results ({allJobs.length})
                        </h1>
                        {allJobs.length > 0 && (
                            <p className='text-xs text-muted-foreground mt-0.5'>
                                Showing {(currentPage - 1) * JOBS_PER_PAGE + 1}–{Math.min(currentPage * JOBS_PER_PAGE, allJobs.length)} of {allJobs.length} positions
                            </p>
                        )}
                    </div>
                </div>

                {allJobs.length === 0 ? (
                    <div className='text-center py-16 bg-card rounded-2xl border border-border shadow-xs'>
                        <p className='text-muted-foreground text-base'>No jobs found. Try searching with different keywords.</p>
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                            {paginatedJobs.map((job) => (
                                <Job key={job._id} job={job} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Browse;