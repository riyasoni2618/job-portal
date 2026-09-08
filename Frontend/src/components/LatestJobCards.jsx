import React from 'react'
import { Badge } from './ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    const companyLogo = job?.company?.logo;
    const companyName = job?.company?.name || 'Company';

    return (
        <div
            onClick={() => navigate(`/description/${job?._id}`)}
            className='p-5 rounded-2xl shadow-xs hover:shadow-md transition-all bg-card border border-border cursor-pointer flex flex-col justify-between h-full group'
        >
            <div>
                {/* [COMPANY LOGO] + Job Title + Company Name + Location */}
                <div className='flex items-start gap-3.5 mb-3'>
                    <Avatar className='h-12 w-12 rounded-xl border border-border bg-white dark:bg-gray-900/90 p-1 shrink-0 shadow-xs'>
                        <AvatarImage
                            src={companyLogo || ''}
                            alt={companyName}
                            className='object-contain rounded-lg'
                        />
                        <AvatarFallback className='rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 font-bold text-sm'>
                            {companyName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0 flex-1'>
                        <h2 className='font-bold text-base text-foreground group-hover:text-[#7209b7] dark:group-hover:text-[#a855f7] transition-colors line-clamp-1'>
                            {job?.title}
                        </h2>
                        <p className='font-medium text-sm text-foreground/80 truncate'>
                            {companyName}
                        </p>
                        <p className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate'>
                            <MapPin className='h-3 w-3 shrink-0' />
                            <span>{job?.location || job?.company?.location || 'India'}</span>
                        </p>
                    </div>
                </div>

                <div>
                    <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed my-2'>
                        {job?.description}
                    </p>
                </div>
            </div>

            <div className='mt-4 pt-3 border-t border-border'>
                <div className='flex flex-wrap items-center gap-1.5'>
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
            </div>
        </div>
    );
};

export default LatestJobCards;