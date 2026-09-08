import React from 'react'
import { Button } from './ui/button'
import { Bookmark, MapPin } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const Job = ({ job }) => {
    const navigate = useNavigate();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };
    
    return (
        <div className='p-5 rounded-2xl shadow-xs hover:shadow-md transition-all bg-card border border-border flex flex-col justify-between h-full'>
            <div>
                <div className='flex items-center justify-between'>
                    <p className='text-xs font-medium text-muted-foreground'>
                        {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                    </p>
                    <Button 
                        variant="outline" 
                        className="rounded-full h-8 w-8 border-border text-muted-foreground hover:text-[#7209b7] dark:hover:text-[#a855f7] hover:bg-muted" 
                        size="icon"
                    >
                        <Bookmark className="h-4 w-4" />
                    </Button>
                </div>

                <div className='flex items-center gap-3 my-3'>
                    <Avatar className='h-12 w-12 rounded-xl border border-border bg-white dark:bg-gray-900/90 p-1 shrink-0 shadow-xs'>
                        <AvatarImage 
                            src={job?.company?.logo || ''} 
                            alt={job?.company?.name || 'Company'} 
                            className='object-contain rounded-lg' 
                        />
                        <AvatarFallback className='bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 font-bold text-sm rounded-lg'>
                            {job?.company?.name ? job.company.name.slice(0, 2).toUpperCase() : 'CO'}
                        </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                        <h1 className='font-bold text-base text-foreground truncate'>
                            {job?.company?.name || 'Company'}
                        </h1>
                        <p className='text-xs text-muted-foreground flex items-center gap-1 truncate'>
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{job?.location || job?.company?.location || 'India'}</span>
                        </p>
                    </div>
                </div>

                <div>
                    <h1 
                        className='font-bold text-base text-foreground mb-1 hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors cursor-pointer line-clamp-1' 
                        onClick={() => navigate(`/description/${job?._id}`)}
                    >
                        {job?.title}
                    </h1>
                    <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
                        {job?.description}
                    </p>
                </div>
            </div>

            <div className='mt-4 pt-3 border-t border-border'>
                <div className='flex flex-wrap items-center gap-1.5 mb-4'>
                    {job?.industry && (
                        <Badge className='text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-[11px] font-semibold' variant="outline">
                            {job?.industry}
                        </Badge>
                    )}
                    <Badge className='text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-[11px] font-semibold' variant="outline">
                        {job?.position} {job?.position === 1 ? 'Position' : 'Positions'}
                    </Badge>
                    <Badge className='text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-[11px] font-semibold' variant="outline">
                        {job?.jobType}
                    </Badge>
                    <Badge className='text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold' variant="outline">
                        {job?.salary} LPA
                    </Badge>
                </div>
                <div className='flex items-center gap-3'>
                    <Button 
                        onClick={() => navigate(`/description/${job?._id}`)} 
                        variant="outline" 
                        className='flex-1 rounded-xl text-xs font-semibold py-2 h-9 border-border text-foreground hover:bg-muted'
                    >
                        Details
                    </Button>
                    <Button className="flex-1 bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl text-xs font-semibold py-2 h-9 shadow-xs">
                        Save For Later
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Job;