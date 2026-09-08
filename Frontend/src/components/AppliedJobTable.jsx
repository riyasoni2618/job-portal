import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const appliedJobsArray = allAppliedJobs || [];
    
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableCaption className="text-muted-foreground text-xs py-4">A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground">Job Role</TableHead>
                        <TableHead className="text-muted-foreground">Company</TableHead>
                        <TableHead className="text-right text-muted-foreground">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        appliedJobsArray.length <= 0 ? (
                            <TableRow className="border-border">
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    <span>You haven't applied to any jobs yet.</span>
                                </TableCell>
                            </TableRow>
                        ) : (
                            appliedJobsArray.map((appliedJob) => {
                                const status = appliedJob?.status?.toLowerCase();
                                const badgeClass = status === 'rejected' 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900/50' 
                                    : status === 'pending' 
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' 
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';

                                return (
                                    <TableRow key={appliedJob._id} className="border-border hover:bg-muted/50">
                                        <TableCell className="text-muted-foreground text-xs">{appliedJob?.createdAt?.split("T")[0] || 'N/A'}</TableCell>
                                        <TableCell className="font-medium text-foreground">{appliedJob?.job?.title || 'N/A'}</TableCell>
                                        <TableCell className="text-foreground">{appliedJob?.job?.company?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className={`${badgeClass} font-semibold text-xs`}>
                                                {appliedJob?.status?.toUpperCase() || 'PENDING'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable