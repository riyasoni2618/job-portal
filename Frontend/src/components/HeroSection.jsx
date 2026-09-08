import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        if(query.trim()) {
            dispatch(setSearchedQuery(query));
            navigate("/browse");
        }
    }

    const handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            searchJobHandler();
        }
    }

    return (
        <div className='text-center'>
            <div className='flex flex-col gap-5 my-10 px-4'>
                <span className='mx-auto px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#7209b7] dark:text-[#c084fc] font-semibold text-xs sm:text-sm border border-purple-100 dark:border-purple-800/60 shadow-xs'>
                    HirelyAI — Next-Gen AI Career & Job Discovery
                </span>
                <h1 className='text-4xl sm:text-5xl font-bold tracking-tight text-foreground'>
                    Search, Apply & <br /> Get Your <span className='text-[#7209b7] dark:text-[#a855f7]'>Dream Jobs</span>
                </h1>
                <p className='text-muted-foreground max-w-xl mx-auto text-sm sm:text-base'>
                    Find your dream role faster with HirelyAI. Personalized AI recommendations, verified recruiters, and top companies across India.
                </p>
                <div className='flex w-full sm:w-[70%] md:w-[50%] lg:w-[40%] bg-card shadow-lg border border-border pl-4 rounded-full items-center gap-3 mx-auto transition-colors duration-200'>
                    <input
                        type="text"
                        placeholder='Find your dream jobs...'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className='outline-none border-none w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm'
                    />
                    <Button 
                        onClick={searchJobHandler} 
                        className="rounded-r-full bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white px-5 shrink-0"
                    >
                        <Search className='h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection