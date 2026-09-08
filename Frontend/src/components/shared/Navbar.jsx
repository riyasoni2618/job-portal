import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'
import { LogOut, User2, Building2, Briefcase, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constants'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    }

    return (
        <nav className='bg-card/95 backdrop-blur-md sticky top-0 relative z-40 border-b border-border transition-colors duration-200'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8'>
                {/* Brand Logo */}
                <div>
                    <Link to="/">
                        <h1 className='text-2xl font-bold cursor-pointer tracking-tight text-foreground'>
                            Hirely<span className='text-[#7209b7] dark:text-[#a855f7]'>AI</span>
                        </h1>
                    </Link>
                </div>

                {/* Nav Links & Controls */}
                <div className='flex items-center gap-4 sm:gap-8'>
                    <ul className='hidden md:flex font-medium items-center gap-6 text-sm text-foreground/80'>
                        {user && user.role === 'recruiter' ? (
                            <>
                                <li>
                                    <Link to="/admin/companies" className="hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors">
                                        Companies
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/jobs" className="hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors">
                                        Jobs
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/" className="hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/jobs" className="hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors">
                                        Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/browse" className="hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors">
                                        Browse
                                    </Link>
                                </li>
                                {user && (
                                    <li>
                                        <Link 
                                            to="/recommendations" 
                                            className="flex items-center gap-1.5 text-[#7209b7] dark:text-[#a855f7] font-semibold hover:opacity-85 transition-opacity"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            <span>AI Matches</span>
                                        </Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    {/* Theme Toggle Button */}
                    <ThemeToggle />

                    {/* Auth / Avatar Section */}
                    {!user ? (
                        <div className='flex items-center gap-2'>
                            <Link to="/login">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-semibold"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button 
                                    size="sm"
                                    className="bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl text-xs font-semibold shadow-xs"
                                >
                                    Signup
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-[#7209b7] dark:hover:ring-[#a855f7] transition-all">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                    <AvatarFallback className="bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 font-bold text-xs">
                                        {user?.fullname ? user.fullname.slice(0, 2).toUpperCase() : 'US'}
                                    </AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-4 z-50 bg-popover text-popover-foreground shadow-xl border border-border rounded-2xl" align="end" sideOffset={8}>
                                <div className='space-y-4'>
                                    {/* User Info Section */}
                                    <div className='flex items-center gap-3 pb-3 border-b border-border'>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                            <AvatarFallback className="bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 font-bold text-xs">
                                                {user?.fullname ? user.fullname.slice(0, 2).toUpperCase() : 'US'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1 min-w-0'>
                                            <h4 className='font-semibold text-sm truncate text-foreground'>{user?.fullname}</h4>
                                            <p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Menu Items Section */}
                                    <div className='flex flex-col gap-1'>
                                        {/* Mobile Navigation Links */}
                                        <div className="md:hidden flex flex-col gap-1 pb-2 mb-2 border-b border-border">
                                            {user.role === 'recruiter' ? (
                                                <>
                                                    <Link to="/admin/companies" onClick={() => setOpen(false)} className='px-2 py-1.5 rounded-lg hover:bg-muted text-sm font-medium text-foreground'>
                                                        Companies
                                                    </Link>
                                                    <Link to="/admin/jobs" onClick={() => setOpen(false)} className='px-2 py-1.5 rounded-lg hover:bg-muted text-sm font-medium text-foreground'>
                                                        Jobs
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Link to="/" onClick={() => setOpen(false)} className='px-2 py-1.5 rounded-lg hover:bg-muted text-sm font-medium text-foreground'>
                                                        Home
                                                    </Link>
                                                    <Link to="/jobs" onClick={() => setOpen(false)} className='px-2 py-1.5 rounded-lg hover:bg-muted text-sm font-medium text-foreground'>
                                                        Jobs
                                                    </Link>
                                                    <Link to="/browse" onClick={() => setOpen(false)} className='px-2 py-1.5 rounded-lg hover:bg-muted text-sm font-medium text-foreground'>
                                                        Browse
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        {user && user.role === 'student' && (
                                            <>
                                                <Link 
                                                    to="/recommendations" 
                                                    onClick={() => setOpen(false)} 
                                                    className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 text-[#7209b7] dark:text-[#a855f7] transition-colors text-sm font-medium'
                                                >
                                                    <Sparkles className='h-4 w-4' />
                                                    <span>AI Recommendations</span>
                                                </Link>
                                                <Link 
                                                    to="/profile" 
                                                    onClick={() => setOpen(false)} 
                                                    className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm text-foreground/80 hover:text-foreground'
                                                >
                                                    <User2 className='h-4 w-4' />
                                                    <span>View Profile</span>
                                                </Link>
                                            </>
                                        )}
                                        {user && user.role === 'recruiter' && (
                                            <>
                                                <Link 
                                                    to="/admin/companies/create" 
                                                    onClick={() => setOpen(false)}
                                                    className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm text-foreground/80 hover:text-foreground'
                                                >
                                                    <Building2 className='h-4 w-4' />
                                                    <span>New Company</span>
                                                </Link>
                                                <Link 
                                                    to="/admin/jobs/create"
                                                    onClick={() => setOpen(false)} 
                                                    className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm text-foreground/80 hover:text-foreground'
                                                >
                                                    <Briefcase className='h-4 w-4' />
                                                    <span>New Job</span>
                                                </Link>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setOpen(false);
                                                logoutHandler();
                                            }}
                                            className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm text-destructive font-medium w-full text-left cursor-pointer'
                                        >
                                            <LogOut className='h-4 w-4' />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar