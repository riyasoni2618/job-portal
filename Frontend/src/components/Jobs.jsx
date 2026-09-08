import React, { useEffect, useState, useMemo } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { motion, AnimatePresence } from 'framer-motion';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { MapPin, Briefcase, IndianRupee, Search, SearchX, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import Pagination from './shared/Pagination';

const Jobs = () => {
    useGetAllJobs();
    const dispatch = useDispatch();
    const { allJobs, searchedQuery } = useSelector(store => store.job);

    const JOBS_PER_PAGE = 12;
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedFilters, setSelectedFilters] = useState({
        location: "",
        industry: "",
        salary: ""
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Normalize location checking to handle variations (e.g., Bangalore vs Bengaluru)
    const matchesLocation = (jobLoc, filterLoc) => {
        if (!filterLoc) return true;
        if (!jobLoc) return false;
        const j = String(jobLoc).toLowerCase().trim();
        const f = String(filterLoc).toLowerCase().trim();

        if (f.includes('bangalore') || f.includes('bengaluru')) {
            return j.includes('bangalore') || j.includes('bengaluru');
        }
        if (f.includes('gurugram') || f.includes('gurgaon')) {
            return j.includes('gurugram') || j.includes('gurgaon');
        }
        if (f.includes('delhi')) {
            return j.includes('delhi') || j.includes('ncr');
        }
        if (f.includes('mumbai')) {
            return j.includes('mumbai') || j.includes('bombay');
        }
        if (f.includes('chennai')) {
            return j.includes('chennai') || j.includes('madras');
        }
        if (f.includes('kolkata')) {
            return j.includes('kolkata') || j.includes('calcutta');
        }
        return j.includes(f);
    };

    // Check industry match
    const matchesIndustry = (job, filterInd) => {
        if (!filterInd) return true;
        const f = String(filterInd).toLowerCase().trim();
        const jInd = String(job?.industry || '').toLowerCase().trim();
        const jTitle = String(job?.title || '').toLowerCase();
        const jDesc = String(job?.description || '').toLowerCase();

        if (jInd && jInd.toLowerCase() === f) return true;
        return jTitle.includes(f) || jDesc.includes(f);
    };

    // Check salary match against predefined salary tiers
    const matchesSalary = (jobSalary, filterSalary) => {
        if (!filterSalary) return true;
        const sal = Number(jobSalary);
        if (isNaN(sal)) return true;

        switch (filterSalary) {
            case "0–3 LPA":
                return sal >= 0 && sal <= 3;
            case "3–5 LPA":
                return sal >= 3 && sal <= 5;
            case "5–8 LPA":
                return sal >= 5 && sal <= 8;
            case "8–12 LPA":
                return sal >= 8 && sal <= 12;
            case "12–18 LPA":
                return sal >= 12 && sal <= 18;
            case "18–25 LPA":
                return sal >= 18 && sal <= 25;
            case "25+ LPA":
                return sal >= 25;
            default:
                return true;
        }
    };

    // Keyword search match
    const matchesQuery = (job, query) => {
        if (!query || query.trim() === "") return true;
        const q = query.toLowerCase().trim();
        const title = String(job?.title || '').toLowerCase();
        const desc = String(job?.description || '').toLowerCase();
        const company = String(job?.company?.name || '').toLowerCase();
        const location = String(job?.location || '').toLowerCase();
        const industry = String(job?.industry || '').toLowerCase();

        return title.includes(q) || desc.includes(q) || company.includes(q) || location.includes(q) || industry.includes(q);
    };

    // Filter jobs client-side based on all combined criteria
    const filterJobs = useMemo(() => {
        if (!allJobs || allJobs.length === 0) return [];

        return allJobs.filter((job) => {
            const locPass = matchesLocation(job?.location || job?.company?.location, selectedFilters.location);
            const indPass = matchesIndustry(job, selectedFilters.industry);
            const salPass = matchesSalary(job?.salary, selectedFilters.salary);
            const queryPass = matchesQuery(job, searchedQuery);

            return locPass && indPass && salPass && queryPass;
        });
    }, [allJobs, selectedFilters, searchedQuery]);

    // Reset current page to 1 whenever search query or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFilters, searchedQuery]);

    const totalPages = Math.ceil(filterJobs.length / JOBS_PER_PAGE);

    // Keep currentPage within bounds if total pages changes
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Slice 12 jobs for the current active page
    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filterJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filterJobs, currentPage]);

    const handleFilterChange = (key, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearFilter = (key) => {
        setSelectedFilters(prev => ({
            ...prev,
            [key]: ""
        }));
    };

    const handleClearAll = () => {
        setSelectedFilters({
            location: "",
            industry: "",
            salary: ""
        });
        if (searchedQuery) {
            dispatch(setSearchedQuery(""));
        }
    };

    const hasActiveFilters = Boolean(
        selectedFilters.location || selectedFilters.industry || selectedFilters.salary || searchedQuery
    );

    return (
        <div className='min-h-screen bg-background pb-16 transition-colors duration-200'>
            <Navbar />

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6'>
                {/* Mobile Filter Toggle */}
                <div className='flex items-center justify-between md:hidden mb-4 bg-card p-3 rounded-xl border border-border shadow-xs'>
                    <div className='flex items-center gap-2'>
                        <SlidersHorizontal className='h-4 w-4 text-[#7209b7] dark:text-[#a855f7]' />
                        <span className='font-semibold text-sm text-foreground'>Filters</span>
                        {hasActiveFilters && (
                            <span className='h-2 w-2 rounded-full bg-[#7209b7] dark:bg-[#a855f7]'></span>
                        )}
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowMobileFilters(prev => !prev)}
                        className='text-xs h-8 border-border text-foreground'
                    >
                        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </div>

                <div className='flex flex-col md:flex-row gap-6 items-start'>
                    {/* Left Filter Sidebar */}
                    <div className={`w-full md:w-72 lg:w-80 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                        <FilterCard
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAll}
                        />
                    </div>

                    {/* Right Main Job Listing */}
                    <div className='flex-1 w-full min-w-0'>
                        {/* Results Header & Active Chips */}
                        <div className='bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-xs mb-5'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2'>
                                <div>
                                    <h2 className='text-lg font-bold text-foreground'>
                                        Explore Jobs
                                    </h2>
                                    <p className='text-xs text-muted-foreground mt-0.5'>
                                        Showing <span className='font-bold text-foreground'>
                                            {filterJobs.length > 0 ? `${(currentPage - 1) * JOBS_PER_PAGE + 1}–${Math.min(currentPage * JOBS_PER_PAGE, filterJobs.length)}` : 0}
                                        </span> of <span className='font-bold text-foreground'>{filterJobs.length}</span> {filterJobs.length === 1 ? 'opening' : 'openings'}
                                        {allJobs?.length ? ` (${allJobs.length} total)` : ''}
                                    </p>
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearAll}
                                        className='inline-flex items-center gap-1 text-xs font-semibold text-[#7209b7] dark:text-[#a855f7] hover:underline self-start sm:self-auto cursor-pointer transition-colors'
                                    >
                                        <RotateCcw className='h-3 w-3' />
                                        Clear All Filters
                                    </button>
                                )}
                            </div>

                            {/* Active Filter Chips */}
                            {hasActiveFilters && (
                                <div className='flex flex-wrap items-center gap-1.5 pt-3 border-t border-border mt-2'>
                                    <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1'>Active:</span>

                                    {searchedQuery && (
                                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border'>
                                            <Search className='h-3 w-3 text-muted-foreground' />
                                            <span>"{searchedQuery}"</span>
                                            <button
                                                onClick={() => dispatch(setSearchedQuery(""))}
                                                className='hover:text-red-500 transition-colors cursor-pointer ml-0.5'
                                                title='Clear keyword'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </span>
                                    )}

                                    {selectedFilters.location && (
                                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'>
                                            <MapPin className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                                            <span>{selectedFilters.location}</span>
                                            <button
                                                onClick={() => handleClearFilter('location')}
                                                className='hover:text-red-500 transition-colors cursor-pointer ml-0.5'
                                                title='Clear location'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </span>
                                    )}

                                    {selectedFilters.industry && (
                                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'>
                                            <Briefcase className='h-3 w-3 text-purple-600 dark:text-purple-400' />
                                            <span>{selectedFilters.industry}</span>
                                            <button
                                                onClick={() => handleClearFilter('industry')}
                                                className='hover:text-red-500 transition-colors cursor-pointer ml-0.5'
                                                title='Clear industry'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </span>
                                    )}

                                    {selectedFilters.salary && (
                                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'>
                                            <IndianRupee className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                                            <span>{selectedFilters.salary}</span>
                                            <button
                                                onClick={() => handleClearFilter('salary')}
                                                className='hover:text-red-500 transition-colors cursor-pointer ml-0.5'
                                                title='Clear salary'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Job Cards Grid or Empty State */}
                        {filterJobs.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-2xl border border-border shadow-xs'>
                                <div className='w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-[#7209b7] dark:text-[#a855f7] mb-4'>
                                    <SearchX className='h-7 w-7' />
                                </div>
                                <h3 className='text-lg font-bold text-foreground mb-1'>
                                    No jobs found matching your criteria
                                </h3>
                                <p className='text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed'>
                                    We couldn't find any job openings matching your selected filter criteria. Try broadening your filters or resetting them to discover more opportunities.
                                </p>
                                <Button
                                    onClick={handleClearAll}
                                    className='bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs'
                                >
                                    <RotateCcw className='h-3.5 w-3.5' />
                                    Reset All Filters
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'>
                                    <AnimatePresence mode="wait">
                                        {paginatedJobs.map((job) => (
                                            <motion.div
                                                key={job?._id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Job job={job} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Pagination Controls */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;