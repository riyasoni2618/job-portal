import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constants';
import axios from 'axios';
import { setAllApplicants } from '@/redux/applicationSlice';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const dispatch = useDispatch();

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
                // Refresh applicants list after status update
                if (applicants?._id) {
                    const refreshRes = await axios.get(`${APPLICATION_API_END_POINT}/${applicants._id}/applicants`, { withCredentials: true });
                    if (refreshRes.data.success) {
                        dispatch(setAllApplicants(refreshRes.data.job));
                    }
                }
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden'>
            <Table>
                <TableCaption className='py-4 text-xs text-muted-foreground'>A list of your recent applicants</TableCaption>
                <TableHeader className='bg-muted/40'>
                    <TableRow className='border-border'>
                        <TableHead className='text-muted-foreground'>Full Name</TableHead>
                        <TableHead className='text-muted-foreground'>Email</TableHead>
                        <TableHead className='text-muted-foreground'>Contact</TableHead>
                        <TableHead className='text-muted-foreground'>Resume</TableHead>
                        <TableHead className='text-muted-foreground'>Date</TableHead>
                        <TableHead className="text-right text-muted-foreground">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        (!applicants || !applicants.application || applicants.application.length === 0) ? (
                            <TableRow className='border-border'>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                                    No applicants found for this job yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applicants.application.map((item) => {
                                const rawResume = Array.isArray(item?.applicant?.profile?.resume)
                                    ? item?.applicant?.profile?.resume[0]
                                    : item?.applicant?.profile?.resume;
                                let resumeUrl = (typeof rawResume === 'string' && rawResume.trim().length > 0)
                                    ? rawResume.trim()
                                    : null;
                                if (resumeUrl) {
                                    if (resumeUrl.startsWith('//')) {
                                        resumeUrl = 'https:' + resumeUrl;
                                    } else if (!/^https?:\/\//i.test(resumeUrl)) {
                                        resumeUrl = 'https://' + resumeUrl;
                                    }
                                }

                                return (
                                <TableRow key={item._id} className='border-border hover:bg-muted/50'>
                                    <TableCell className='font-semibold text-foreground'>{item?.applicant?.fullname || 'N/A'}</TableCell>
                                    <TableCell className='text-muted-foreground'>{item?.applicant?.email || 'N/A'}</TableCell>
                                    <TableCell className='text-muted-foreground'>{item?.applicant?.phoneNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        {
                                            resumeUrl ? (
                                                <a 
                                                    className="text-[#7209b7] dark:text-purple-400 hover:underline cursor-pointer text-xs font-medium inline-flex items-center gap-1.5" 
                                                    href={resumeUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    title="Open resume in new tab"
                                                >
                                                    <span className="truncate max-w-[150px] inline-block">{item?.applicant?.profile?.resumeOriginalName || 'View Resume'}</span>
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                </a>
                                            ) : (
                                                <span className='text-muted-foreground text-xs'>N/A</span>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell className='text-xs text-muted-foreground'>{item?.createdAt?.split("T")[0] || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Popover>
                                            <PopoverTrigger>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-32 p-2 bg-card text-card-foreground border-border shadow-md" side="left" align="center">
                                                {
                                                    shortlistingStatus.map((status, index) => {
                                                        const statusColor = status === "Accepted" 
                                                            ? "hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                            : "hover:bg-red-500/10 text-red-600 dark:text-red-400";
                                                        return (
                                                            <div 
                                                                onClick={() => statusHandler(status, item?._id)} 
                                                                key={index} 
                                                                className={`flex items-center w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${statusColor}`}
                                                            >
                                                                <span>{status}</span>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            )})
                        )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ApplicantsTable