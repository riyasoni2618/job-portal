import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { JOB_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setSingleJob } from '@/redux/jobSlice'
import { toast } from 'sonner'
import { 
    MapPin, 
    Briefcase, 
    Clock, 
    IndianRupee, 
    Users, 
    Calendar, 
    Building2, 
    ExternalLink, 
    CheckCircle2, 
    ArrowLeft
} from 'lucide-react'

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.application?.some(app => (app.applicant === user?._id || app.applicant?._id === user?._id)) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                if (singleJob && singleJob.application) {
                    const updatedSingleJob = {
                        ...singleJob,
                        application: [...singleJob.application, { applicant: user?._id }]
                    };
                    dispatch(setSingleJob(updatedSingleJob));
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log("Apply Job Error:", error);
            toast.error(error.response?.data?.message || "Failed to apply for job. Please try again.");
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job?.application?.some(app => (app.applicant === user?._id || app.applicant?._id === user?._id)) || false);
                }
            } catch (error) {
                console.log("Fetch Job Error:", error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    if (!singleJob) {
        return (
            <div className='min-h-screen bg-background'>
                <Navbar />
                <div className='max-w-5xl mx-auto my-16 px-4 text-center'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7209b7] dark:border-[#a855f7] mb-4'></div>
                    <p className='text-muted-foreground font-medium'>Loading job details...</p>
                </div>
            </div>
        );
    }

    const companyName = singleJob?.company?.name || "Company";
    const companyLogo = singleJob?.company?.logo;
    const experienceRequired = singleJob?.experiencelevel ?? singleJob?.experience ?? 0;
    const postedDateFormatted = singleJob?.createdAt
        ? new Date(singleJob.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "Recently";

    return (
        <div className='min-h-screen bg-background transition-colors duration-200'>
            <Navbar />
            <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Top Navigation Bar */}
                <div className='flex items-center justify-between mb-6'>
                    <button
                        onClick={() => navigate(-1)}
                        className='inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors group cursor-pointer'
                    >
                        <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                        Back to Jobs
                    </button>
                    <div className='flex items-center gap-2'>
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'>
                            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse'></span>
                            Actively Hiring
                        </span>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
                    {/* LEFT / MAIN COLUMN (2 cols) */}
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Header Job Card */}
                        <div className='bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xs'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-5'>
                                <Avatar className='h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-border p-1.5 bg-white dark:bg-gray-900/90 shadow-xs shrink-0'>
                                    <AvatarImage src={companyLogo} alt={companyName} className='object-contain rounded-xl' />
                                    <AvatarFallback className='rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 font-bold text-xl'>
                                        {companyName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1 min-w-0'>
                                    <h1 className='text-2xl sm:text-3xl font-bold text-foreground tracking-tight break-words'>
                                        {singleJob?.title}
                                    </h1>
                                    <div className='flex flex-wrap items-center gap-y-1.5 gap-x-3 mt-2 text-sm text-muted-foreground'>
                                        <span className='font-semibold text-foreground'>{companyName}</span>
                                        <span className='text-muted-foreground/50'>•</span>
                                        <span className='inline-flex items-center gap-1 text-muted-foreground'>
                                            <MapPin className='h-3.5 w-3.5' />
                                            {singleJob?.location}
                                        </span>
                                        {singleJob?.industry && (
                                            <>
                                                <span className='text-muted-foreground/50'>•</span>
                                                <span className='font-medium text-[#7209b7] dark:text-[#c084fc] bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 px-2 py-0.5 rounded-md text-xs'>
                                                    {singleJob.industry}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Key Highlights Badges */}
                            <div className='flex flex-wrap items-center gap-2.5 mt-6 pt-6 border-t border-border'>
                                <Badge variant='outline' className='px-3 py-1.5 rounded-lg border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold gap-1.5 text-xs sm:text-sm'>
                                    <Users className='h-3.5 w-3.5' />
                                    {singleJob?.position || 1} {singleJob?.position === 1 ? 'Opening' : 'Openings'}
                                </Badge>
                                <Badge variant='outline' className='px-3 py-1.5 rounded-lg border-orange-200 dark:border-orange-800/60 bg-orange-50/70 dark:bg-orange-950/40 text-[#F83002] dark:text-orange-400 font-semibold gap-1.5 text-xs sm:text-sm'>
                                    <Briefcase className='h-3.5 w-3.5' />
                                    {singleJob?.jobType || 'Full-Time'}
                                </Badge>
                                <Badge variant='outline' className='px-3 py-1.5 rounded-lg border-purple-200 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-950/40 text-[#7209b7] dark:text-purple-300 font-semibold gap-1.5 text-xs sm:text-sm'>
                                    <IndianRupee className='h-3.5 w-3.5' />
                                    {singleJob?.salary} LPA
                                </Badge>
                                <Badge variant='outline' className='px-3 py-1.5 rounded-lg border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold gap-1.5 text-xs sm:text-sm'>
                                    <Clock className='h-3.5 w-3.5' />
                                    {experienceRequired} {experienceRequired === 1 ? 'Yr' : 'Yrs'} Experience
                                </Badge>
                            </div>
                        </div>

                        {/* Description & Detailed Content Card */}
                        <div className='bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6'>
                            <div>
                                <h2 className='text-lg font-bold text-foreground mb-3'>
                                    About the Role
                                </h2>
                                <div className='text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words'>
                                    {singleJob?.description || 'No detailed description available.'}
                                </div>
                            </div>

                            {/* Required Skills Section */}
                            {singleJob?.requirements && singleJob.requirements.length > 0 && (
                                <div className='pt-6 border-t border-border'>
                                    <h2 className='text-lg font-bold text-foreground mb-3'>
                                        Required Skills & Technologies
                                    </h2>
                                    <div className='flex flex-wrap gap-2'>
                                        {singleJob.requirements.map((skill, index) => (
                                            <span
                                                key={index}
                                                className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-muted text-foreground border border-border hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors'
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Job Specifications Grid */}
                            <div className='pt-6 border-t border-border'>
                                <h2 className='text-lg font-bold text-foreground mb-4'>
                                    Job Details & Specifications
                                </h2>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                                    <div className='p-3.5 rounded-xl bg-muted/40 border border-border'>
                                        <span className='text-muted-foreground block text-xs font-semibold uppercase tracking-wider'>Role Title</span>
                                        <span className='font-semibold text-foreground mt-1 block'>{singleJob?.title}</span>
                                    </div>
                                    <div className='p-3.5 rounded-xl bg-muted/40 border border-border'>
                                        <span className='text-muted-foreground block text-xs font-semibold uppercase tracking-wider'>Primary Location</span>
                                        <span className='font-semibold text-foreground mt-1 block'>{singleJob?.location}</span>
                                    </div>
                                    <div className='p-3.5 rounded-xl bg-muted/40 border border-border'>
                                        <span className='text-muted-foreground block text-xs font-semibold uppercase tracking-wider'>Experience Required</span>
                                        <span className='font-semibold text-foreground mt-1 block'>{experienceRequired} {experienceRequired === 1 ? 'Year' : 'Years'}</span>
                                    </div>
                                    <div className='p-3.5 rounded-xl bg-muted/40 border border-border'>
                                        <span className='text-muted-foreground block text-xs font-semibold uppercase tracking-wider'>Offered CTC</span>
                                        <span className='font-semibold text-foreground mt-1 block'>{singleJob?.salary} LPA</span>
                                    </div>
                                    <div className='p-3.5 rounded-xl bg-muted/40 border border-border'>
                                        <span className='text-muted-foreground block text-xs font-semibold uppercase tracking-wider'>Workplace Type</span>
                                        <span className='font-semibold text-foreground mt-1 block'>{singleJob?.jobType || 'Full-Time'}</span>
                                    </div>
                                    <div className='p-3.5 rounded-xl bg-muted/40 border border-border'>
                                        <span className='text-muted-foreground block text-xs font-semibold uppercase tracking-wider'>Date Posted</span>
                                        <span className='font-semibold text-foreground mt-1 block'>{postedDateFormatted}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT / SIDEBAR COLUMN (1 col, Sticky) */}
                    <div className='space-y-6 lg:sticky lg:top-20'>
                        {/* Action / Apply Card */}
                        <div className='bg-card rounded-2xl p-6 border border-border shadow-xs space-y-6'>
                            <div>
                                <span className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>Ready to Apply?</span>
                                <div className='mt-2.5'>
                                    <Button
                                        onClick={isApplied ? null : applyJobHandler}
                                        disabled={isApplied}
                                        className={`w-full py-6 rounded-xl font-bold text-base transition-all duration-200 shadow-xs ${
                                            isApplied
                                                ? 'bg-emerald-600 dark:bg-emerald-700 text-white cursor-not-allowed shadow-none'
                                                : 'bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white hover:shadow-md'
                                        }`}
                                    >
                                        {isApplied ? (
                                            <span className='flex items-center justify-center gap-2'>
                                                <CheckCircle2 className='h-5 w-5' />
                                                Already Applied
                                            </span>
                                        ) : (
                                            'Apply for this Position'
                                        )}
                                    </Button>
                                </div>
                                <p className='text-xs text-center text-muted-foreground mt-2'>
                                    {isApplied ? 'Your profile has been submitted to the recruiter.' : 'Instant submission with your saved resume.'}
                                </p>
                            </div>

                            {/* Job Snapshot */}
                            <div className='pt-5 border-t border-border space-y-3.5 text-sm'>
                                <h3 className='font-bold text-foreground text-sm'>Job Snapshot</h3>
                                <div className='flex items-center justify-between text-muted-foreground'>
                                    <span className='flex items-center gap-2 text-xs sm:text-sm'>
                                        <MapPin className='h-4 w-4' /> Location
                                    </span>
                                    <span className='font-semibold text-foreground text-xs sm:text-sm'>{singleJob?.location}</span>
                                </div>
                                <div className='flex items-center justify-between text-muted-foreground'>
                                    <span className='flex items-center gap-2 text-xs sm:text-sm'>
                                        <IndianRupee className='h-4 w-4' /> Salary
                                    </span>
                                    <span className='font-semibold text-foreground text-xs sm:text-sm'>{singleJob?.salary} LPA</span>
                                </div>
                                <div className='flex items-center justify-between text-muted-foreground'>
                                    <span className='flex items-center gap-2 text-xs sm:text-sm'>
                                        <Clock className='h-4 w-4' /> Experience
                                    </span>
                                    <span className='font-semibold text-foreground text-xs sm:text-sm'>{experienceRequired} Yrs</span>
                                </div>
                                <div className='flex items-center justify-between text-muted-foreground'>
                                    <span className='flex items-center gap-2 text-xs sm:text-sm'>
                                        <Users className='h-4 w-4' /> Openings
                                    </span>
                                    <span className='font-semibold text-foreground text-xs sm:text-sm'>{singleJob?.position || 1}</span>
                                </div>
                                <div className='flex items-center justify-between text-muted-foreground'>
                                    <span className='flex items-center gap-2 text-xs sm:text-sm'>
                                        <Calendar className='h-4 w-4' /> Posted Date
                                    </span>
                                    <span className='font-semibold text-foreground text-xs sm:text-sm'>{postedDateFormatted}</span>
                                </div>
                                <div className='flex items-center justify-between text-muted-foreground pt-1'>
                                    <span className='flex items-center gap-2 text-xs sm:text-sm'>
                                        <CheckCircle2 className='h-4 w-4' /> Total Applicants
                                    </span>
                                    <span className='font-bold text-[#7209b7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 px-2.5 py-0.5 rounded-full text-xs'>
                                        {singleJob?.application?.length || 0} applied
                                    </span>
                                </div>
                            </div>

                            {/* About Company Widget */}
                            {singleJob?.company && (
                                <div className='pt-5 border-t border-border space-y-2.5'>
                                    <div className='flex items-center gap-2.5'>
                                        <Building2 className='h-4 w-4 text-[#7209b7] dark:text-[#a855f7]' />
                                        <h3 className='font-bold text-foreground text-sm'>About {companyName}</h3>
                                    </div>
                                    <p className='text-xs text-muted-foreground leading-relaxed line-clamp-4'>
                                        {singleJob.company.description || 'A forward-thinking enterprise delivering innovative solutions and career growth.'}
                                    </p>
                                    {singleJob.company.website && (
                                        <div className='pt-1'>
                                            <a
                                                href={singleJob.company.website.startsWith('http') ? singleJob.company.website : `https://${singleJob.company.website}`}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='inline-flex items-center gap-1.5 text-xs font-semibold text-[#7209b7] dark:text-[#a855f7] hover:underline'
                                            >
                                                Visit Company Website
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobDescription;