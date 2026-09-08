import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, Sparkles } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

const Profile = () => {
    useGetAppliedJobs();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    // Check if user exists
    if (!user) {
        return (
            <div className='min-h-screen bg-background text-foreground'>
                <Navbar />
                <div className='max-w-4xl mx-auto bg-card border border-border text-card-foreground rounded-2xl my-5 p-8 shadow-sm'>
                    <p className='text-muted-foreground'>Please login to view your profile.</p>
                </div>
            </div>
        );
    }

    // Check if resume exists - handle both string and array formats
    const resumeUrl = Array.isArray(user?.profile?.resume) 
        ? user.profile.resume[0] 
        : user?.profile?.resume;
    const hasResume = resumeUrl && resumeUrl.length > 0;
    const hasSkills = user?.profile?.skills && Array.isArray(user.profile.skills) && user.profile.skills.length > 0;

    return (
        <div className='min-h-screen bg-background text-foreground pb-12 transition-colors duration-200'>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-card border border-border text-card-foreground rounded-2xl my-5 p-8 shadow-sm'>
                <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-24 w-24 border border-border">
                            <AvatarImage src={user?.profile?.profilePhoto || ''} alt="profile" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className='font-semibold text-xl text-foreground'>{user?.fullname || 'User'}</h1>
                            <p className='text-muted-foreground text-sm mt-0.5'>{user?.profile?.bio || 'No bio available'}</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setOpen(true)} 
                        variant="outline" 
                        size="icon"
                        className="border-border text-foreground hover:bg-muted"
                        aria-label="Edit Profile"
                    >
                        <Pen className="h-4 w-4" />
                    </Button>
                </div>
                <div className='my-5 space-y-2'>
                    <div className='flex items-center gap-3 text-sm text-foreground'>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.email || 'N/A'}</span>
                    </div>
                    <div className='flex items-center gap-3 text-sm text-foreground'>
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.phoneNumber || 'N/A'}</span>
                    </div>
                </div>
                <div className='my-5'>
                    <h2 className='font-semibold text-base mb-2 text-foreground'>Skills</h2>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                        {
                            hasSkills ? (
                                user.profile.skills.map((item, index) => (
                                    <Badge 
                                        key={index}
                                        className='bg-purple-100 dark:bg-purple-900/40 text-[#7209b7] dark:text-purple-300 border-purple-200 dark:border-purple-800/40 hover:bg-purple-200 dark:hover:bg-purple-900/60'
                                    >
                                        {item}
                                    </Badge>
                                ))
                            ) : (
                                <span className='text-muted-foreground text-sm'>No skills added yet</span>
                            )
                        }
                    </div>
                </div>
                <div className='grid w-full max-w-sm items-center gap-1.5'>
                    <Label className="text-sm font-semibold text-foreground">Resume</Label>
                    {
                        hasResume ? (
                            <a 
                                target='_blank' 
                                rel='noopener noreferrer'
                                href={resumeUrl} 
                                className='text-[#7209b7] dark:text-purple-400 hover:underline cursor-pointer text-sm font-medium'
                            >
                                {user?.profile?.resumeOriginalName || 'View Resume'}
                            </a>
                        ) : (
                            <span className='text-muted-foreground text-sm'>No resume uploaded</span>
                        )
                    }
                </div>
            </div>

            {/* AI Job Recommendations Section */}
            <div className='max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/25 dark:to-indigo-950/25 border border-purple-200 dark:border-purple-800/40 rounded-2xl my-5 p-6 shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-start gap-3'>
                        <div className='p-2.5 bg-[#7209b7]/10 dark:bg-purple-500/20 rounded-xl text-[#7209b7] dark:text-purple-400 mt-0.5'>
                            <Sparkles className='h-6 w-6' />
                        </div>
                        <div>
                            <h2 className='font-bold text-lg text-foreground flex items-center gap-2'>
                                AI Job Recommendations
                                <Badge className='bg-[#7209b7] text-white text-[11px] font-semibold'>New</Badge>
                            </h2>
                            <p className='text-xs text-muted-foreground mt-1 max-w-xl'>
                                Discover jobs tailored to your skills, experience, and target roles using semantic AI and vector similarity matching.
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => navigate('/recommendations')} 
                        className='bg-[#7209b7] hover:bg-[#5f0799] text-white text-xs font-semibold whitespace-nowrap px-4 py-2 shrink-0'
                    >
                        <Sparkles className='h-3.5 w-3.5 mr-1.5' />
                        Explore AI Matches
                    </Button>
                </div>
            </div>

            <div className='max-w-4xl mx-auto bg-card border border-border text-card-foreground shadow-sm rounded-2xl my-5 p-6'>
                <h2 className='font-bold text-lg mb-4 text-foreground'>Applied Jobs</h2>
                <AppliedJobTable />
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen}/>
        </div>
    )
}

export default Profile