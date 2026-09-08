import React, { useMemo } from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);

    // Display only the latest 6 jobs returned by the API
    const displayJobs = useMemo(() => {
        if (!allJobs || allJobs.length === 0) return [];
        return allJobs.slice(0, 6);
    }, [allJobs]);
   
    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-20'>
            <div className='text-center sm:text-left'>
                <span className='text-xs uppercase font-bold tracking-wider text-[#7209b7] dark:text-[#c084fc] bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800/60'>
                    Featured Openings
                </span>
                <h1 className='text-3xl sm:text-4xl font-extrabold text-foreground mt-2 tracking-tight'>
                    <span className='text-[#7209b7] dark:text-[#a855f7]'>Latest & Top </span> Job Openings
                </h1>
                <p className='text-sm text-muted-foreground mt-1'>
                    Explore newly posted positions from top verified companies hiring right now.
                </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-8'>
                {displayJobs.length <= 0 ? (
                    <div className='col-span-full py-12 text-center text-muted-foreground'>
                        No jobs currently available.
                    </div>
                ) : (
                    displayJobs.map((job) => <LatestJobCards key={job._id} job={job} />)
                )}
            </div>
        </div>
    );
};

export default LatestJobs;