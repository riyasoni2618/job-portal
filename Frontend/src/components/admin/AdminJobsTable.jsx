import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal, Briefcase } from 'lucide-react'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const AdminJobsTable = () => { 
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs || []);
    const navigate = useNavigate();

    useEffect(() => { 
        const jobsArray = allAdminJobs || [];
        const filteredJobs = jobsArray.filter((job) => {
            if (!searchJobByText) {
                return true;
            }
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || 
                   job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());
        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText]);

    return (
        <div className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden'>
            <Table>
                <TableCaption className='py-4 text-xs text-muted-foreground'>
                    {filterJobs.length > 0 
                        ? `Showing ${filterJobs.length} posted ${filterJobs.length === 1 ? 'job' : 'jobs'}`
                        : "A list of your recent posted jobs"}
                </TableCaption>
                <TableHeader className='bg-muted/40'>
                    <TableRow className='border-border'>
                        <TableHead className='text-muted-foreground'>Company</TableHead>
                        <TableHead className='text-muted-foreground'>Role</TableHead>
                        <TableHead className='text-muted-foreground'>Date</TableHead>
                        <TableHead className="text-right text-muted-foreground">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs.length === 0 ? (
                        <TableRow className='border-border'>
                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="font-semibold text-foreground">No jobs posted yet</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    {searchJobByText
                                        ? `No jobs match "${searchJobByText}".`
                                        : "You haven't posted any jobs yet. Click 'New Job' to create your first job posting."}
                                </p>
                                {!searchJobByText && (
                                    <Button
                                        onClick={() => navigate("/admin/jobs/create")}
                                        className="mt-4 bg-[#7209b7] hover:bg-[#5f0799] text-white text-xs rounded-xl"
                                        size="sm"
                                    >
                                        Post First Job
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filterJobs.map((job) => (
                            <TableRow key={job._id} className='hover:bg-muted/50 border-border'>
                                <TableCell>
                                    <div className='flex items-center gap-2.5'>
                                        <Avatar className='h-8 w-8 rounded-lg bg-white dark:bg-gray-900/90 border border-border p-0.5 shrink-0'>
                                            <AvatarImage 
                                                src={job?.company?.logo || ''} 
                                                alt={job?.company?.name || 'Company'} 
                                                className='object-contain rounded'
                                            />
                                            <AvatarFallback className='bg-purple-100 dark:bg-purple-900/40 text-[#7209b7] dark:text-purple-300 font-bold text-[10px] rounded'>
                                                {job?.company?.name ? job.company.name.slice(0, 2).toUpperCase() : 'CO'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className='font-medium text-foreground'>{job?.company?.name || 'Company'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className='font-semibold text-foreground'>{job?.title}</TableCell>
                                <TableCell className='text-xs text-muted-foreground'>
                                    {job?.createdAt ? job.createdAt.split("T")[0] : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 p-2 bg-card text-card-foreground border-border shadow-md" side="left" align="center">
                                            <div 
                                                onClick={() => navigate(`/admin/jobs/edit/${job._id}`)} 
                                                className='flex items-center gap-2 w-full p-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer'
                                            >
                                                <Edit2 className='h-3.5 w-3.5 text-[#7209b7] dark:text-purple-400' />
                                                <span>Edit Job</span>
                                            </div>
                                            <div 
                                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} 
                                                className='flex items-center gap-2 w-full p-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer mt-1'
                                            >
                                                <Eye className='h-3.5 w-3.5 text-blue-500'/>
                                                <span>View Applicants</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdminJobsTable