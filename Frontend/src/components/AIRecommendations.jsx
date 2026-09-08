import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
    Sparkles, 
    Upload, 
    FileText, 
    CheckCircle2, 
    Loader2, 
    RefreshCw, 
    Briefcase, 
    MapPin, 
    Check
} from 'lucide-react';
import axios from 'axios';
import { JOB_API_END_POINT, USER_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AIRecommendations = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [recommendations, setRecommendations] = useState([]);
    const [hasResume, setHasResume] = useState(false);
    const [resumeOriginalName, setResumeOriginalName] = useState('');
    const [resumeAnalysis, setResumeAnalysis] = useState(null);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUploadCard, setShowUploadCard] = useState(false);
    const [applyingJobId, setApplyingJobId] = useState(null);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());

    // Fetch recommendations on mount
    const fetchRecommendations = async () => {
        try {
            setLoadingRecs(true);
            const res = await axios.get(`${JOB_API_END_POINT}/recommendations`, { withCredentials: true });
            if (res.data.success) {
                setHasResume(res.data.hasResume);
                setRecommendations(res.data.recommendations || []);
                if (res.data.resumeOriginalName) setResumeOriginalName(res.data.resumeOriginalName);
                if (res.data.resumeAnalysis) setResumeAnalysis(res.data.resumeAnalysis);
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            if (error.response?.data?.hasResume === false) {
                setHasResume(false);
                setRecommendations([]);
            }
        } finally {
            setLoadingRecs(false);
        }
    };

    // Fetch user's applied jobs
    const fetchAppliedJobs = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, { withCredentials: true });
            if (res.data.success && Array.isArray(res.data.application)) {
                const appliedIds = new Set(res.data.application.map(app => app.job?._id || app.job));
                setAppliedJobIds(appliedIds);
            }
        } catch (err) {
            console.error("Could not fetch applied jobs:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRecommendations();
            fetchAppliedJobs();
        } else {
            setLoadingRecs(false);
        }
    }, [user]);

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error("Only PDF files are supported");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size cannot exceed 5MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    const uploadResumeHandler = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a resume file first");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message || "Resume analyzed successfully!");
                if (res.data.user) {
                    dispatch(setUser(res.data.user));
                }
                setHasResume(true);
                setResumeOriginalName(selectedFile.name);
                setResumeAnalysis(res.data.analysis);
                setSelectedFile(null);
                setShowUploadCard(false);
                fetchRecommendations();
            }
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error(error.response?.data?.message || "Failed to analyze resume. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const applyJobHandler = async (jobId) => {
        try {
            setApplyingJobId(jobId);
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message || "Job applied successfully!");
                setAppliedJobIds(prev => new Set([...prev, jobId]));
            }
        } catch (error) {
            console.error("Apply Job Error:", error);
            toast.error(error.response?.data?.message || "Failed to apply for this job.");
        } finally {
            setApplyingJobId(null);
        }
    };

    const getMatchBadgeStyle = (percentage) => {
        if (percentage >= 85) return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
        if (percentage >= 70) return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
        if (percentage >= 50) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
        return 'bg-muted text-muted-foreground border-border';
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background transition-colors duration-200">
                <Navbar />
                <div className="max-w-xl mx-auto mt-16 p-8 bg-card rounded-2xl border border-border shadow-xs text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center mx-auto mb-4 text-[#7209b7] dark:text-[#a855f7]">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Please log in to upload your resume and discover AI-recommended jobs tailored to your skills.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button 
                            onClick={() => navigate('/login')} 
                            className="bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white px-6 rounded-xl text-xs font-semibold"
                        >
                            Log In
                        </Button>
                        <Button 
                            onClick={() => navigate('/signup')} 
                            variant="outline" 
                            className="border-border text-foreground hover:bg-muted rounded-xl text-xs font-semibold"
                        >
                            Create Account
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-200">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card p-6 rounded-2xl border border-border shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-6 w-6 text-[#7209b7] dark:text-[#a855f7]" />
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Job Recommendations</h1>
                            <Badge className="bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 border-purple-200 dark:border-purple-800/60 font-semibold ml-2">
                                Semantic AI
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Upload your resume to discover active jobs matched by semantic vector similarity, skills overlap, and experience alignment.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasResume && (
                            <>
                                <Button 
                                    onClick={() => setShowUploadCard(!showUploadCard)} 
                                    variant="outline" 
                                    className="border-border text-foreground hover:bg-muted flex items-center gap-2 text-xs rounded-xl"
                                >
                                    <Upload className="h-4 w-4" />
                                    {showUploadCard ? 'Cancel' : 'Update Resume'}
                                </Button>
                                <Button 
                                    onClick={fetchRecommendations} 
                                    variant="outline" 
                                    disabled={loadingRecs}
                                    className="border-border text-foreground hover:bg-muted flex items-center gap-2 text-xs rounded-xl"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loadingRecs ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Resume Upload / Active Profile Banner */}
                {(!hasResume || showUploadCard) && (
                    <div className="bg-card rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800/60 p-8 mb-8 shadow-xs text-center">
                        <div className="max-w-lg mx-auto">
                            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-[#7209b7] dark:text-[#a855f7]" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                                {hasResume ? 'Replace Your Resume' : 'Upload Your Resume to Get Started'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Upload your PDF resume (up to 5MB). Our AI will extract your skills, experience, and projects to find matching jobs.
                            </p>

                            <form onSubmit={uploadResumeHandler} className="space-y-4">
                                <div className="flex items-center justify-center">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                            <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                            <p className="text-sm text-foreground font-medium">
                                                {selectedFile ? selectedFile.name : 'Click to select or drag and drop your PDF resume'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">PDF format only (max. 5MB)</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="application/pdf" 
                                            onChange={fileChangeHandler} 
                                            className="hidden" 
                                        />
                                    </label>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={!selectedFile || uploading}
                                    className="w-full bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white py-6 text-sm font-semibold rounded-xl shadow-xs"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Analyzing resume with AI & calculating matches...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Upload & Analyze with AI
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Analyzed Resume Overview Bar */}
                {hasResume && !showUploadCard && (
                    <div className="bg-card rounded-2xl border border-border p-6 mb-8 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-foreground">
                                            {resumeOriginalName || user?.profile?.resumeOriginalName || "Your Resume"}
                                        </h4>
                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-xs">
                                            Analyzed
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {resumeAnalysis?.summary || "Profile extracted and vector embeddings active for job matching."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                    Experience: <strong className="text-foreground">{resumeAnalysis?.yearsOfExperience ?? 0} yrs</strong>
                                </span>
                                {user?.profile?.resume && (
                                    <a 
                                        href={user.profile.resume} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#7209b7] dark:text-[#a855f7] hover:underline font-medium"
                                    >
                                        View Uploaded PDF
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Target Roles & Top Skills */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Target Roles:</span>
                            {resumeAnalysis?.targetRoles && resumeAnalysis.targetRoles.length > 0 ? (
                                resumeAnalysis.targetRoles.map((role, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 text-xs">
                                        {role}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="secondary" className="text-xs">Dynamic Match</Badge>
                            )}

                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-4 mr-1">Extracted Skills:</span>
                            {resumeAnalysis?.skills && resumeAnalysis.skills.slice(0, 8).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-muted text-foreground border-border">
                                    {skill}
                                </Badge>
                            ))}
                            {resumeAnalysis?.skills && resumeAnalysis.skills.length > 8 && (
                                <span className="text-xs text-muted-foreground">+{resumeAnalysis.skills.length - 8} more</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Recommendations Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span>Top Matching Jobs</span>
                            {recommendations.length > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">({recommendations.length} available)</span>
                            )}
                        </h2>
                    </div>

                    {loadingRecs ? (
                        <div className="py-16 text-center bg-card rounded-2xl border border-border">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#7209b7] dark:text-[#a855f7] mb-3" />
                            <p className="text-foreground font-medium">Matching your profile against available jobs...</p>
                            <p className="text-xs text-muted-foreground mt-1">Calculating semantic vector similarity and skill overlaps</p>
                        </div>
                    ) : !hasResume ? (
                        <div className="py-16 text-center bg-card rounded-2xl border border-border shadow-xs p-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-foreground mb-1">No Resume Uploaded Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                                Upload your resume above to discover jobs that match your skills, experience, and target roles.
                            </p>
                            <Button 
                                onClick={() => setShowUploadCard(true)}
                                className="bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white rounded-xl text-xs font-semibold"
                            >
                                <Upload className="h-4 w-4 mr-2" /> Upload Resume
                            </Button>
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="py-16 text-center bg-card rounded-2xl border border-border shadow-xs p-8">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-foreground mb-1">No Jobs Found</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                There are currently no active jobs posted in HirelyAI. As recruiters post new jobs, they will automatically appear here ranked by relevance!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map((rec) => {
                                const job = rec.job;
                                const isApplied = appliedJobIds.has(job?._id);
                                const isApplying = applyingJobId === job?._id;

                                return (
                                    <div 
                                        key={job?._id}
                                        className="bg-card rounded-2xl border border-border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Card Top: Company & Match Score Badge */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-12 w-12 border border-border bg-white dark:bg-gray-900/90 p-1 rounded-xl shrink-0 shadow-xs">
                                                         <AvatarImage src={job?.company?.logo || ''} alt={job?.company?.name || 'Company'} className="object-contain rounded-lg" />
                                                         <AvatarFallback className="bg-purple-100 dark:bg-purple-950/60 text-[#7209b7] dark:text-purple-300 font-bold text-sm rounded-lg">
                                                             {job?.company?.name ? job.company.name.slice(0, 2).toUpperCase() : 'CO'}
                                                         </AvatarFallback>
                                                     </Avatar>
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                                                            {job?.company?.name || 'Company'}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {job?.location || 'India'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Badge 
                                                    variant="outline" 
                                                    className={`px-2.5 py-1 text-xs font-bold border rounded-lg ${getMatchBadgeStyle(rec.matchPercentage)}`}
                                                >
                                                    <Sparkles className="h-3 w-3 mr-1 inline" />
                                                    {rec.matchPercentage}% Match
                                                </Badge>
                                            </div>

                                            {/* Job Title & Description */}
                                            <div className="mb-4">
                                                <h3 
                                                    className="text-lg font-bold text-foreground hover:text-[#7209b7] dark:hover:text-[#a855f7] transition-colors cursor-pointer line-clamp-1"
                                                    onClick={() => navigate(`/description/${job?._id}`)}
                                                >
                                                    {job?.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                                    {job?.description}
                                                </p>
                                            </div>

                                            {/* Job Badges */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <Badge variant="outline" className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60">
                                                    {job?.position || 1} Positions
                                                </Badge>
                                                <Badge variant="outline" className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60">
                                                    {job?.jobType}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 font-bold">
                                                    {job?.salary} LPA
                                                </Badge>
                                                <Badge variant="outline" className="text-xs font-semibold text-muted-foreground bg-muted border-border">
                                                    {job?.experiencelevel ?? 0} yrs exp
                                                </Badge>
                                            </div>

                                            {/* Why This Matches Section */}
                                            <div className="bg-purple-50/60 dark:bg-purple-950/30 rounded-xl p-3 mb-4 border border-purple-200/60 dark:border-purple-800/40">
                                                <p className="text-xs font-semibold text-[#7209b7] dark:text-[#c084fc] mb-1 flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" /> Why this matches:
                                                </p>
                                                <p className="text-xs text-foreground/90 leading-relaxed">
                                                    {rec.matchExplanation}
                                                </p>
                                            </div>

                                            {/* Matched Skills */}
                                            {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Matched Skills:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {rec.matchedSkills.map((skill, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-medium">
                                                                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Missing / Less Relevant Skills */}
                                            {rec.missingSkills && rec.missingSkills.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Other Requirements:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {rec.missingSkills.map((skill, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                                                                • {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Actions */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-border">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => navigate(`/description/${job?._id}`)}
                                                className="flex-1 text-xs border-border text-foreground hover:bg-muted rounded-xl"
                                            >
                                                View Job
                                            </Button>

                                            <Button 
                                                onClick={() => !isApplied && applyJobHandler(job?._id)}
                                                disabled={isApplied || isApplying}
                                                className={`flex-1 text-xs rounded-xl ${
                                                    isApplied 
                                                        ? 'bg-emerald-600 dark:bg-emerald-700 text-white cursor-not-allowed shadow-none' 
                                                        : 'bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white shadow-xs'
                                                }`}
                                            >
                                                {isApplying ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : isApplied ? (
                                                    <span className="flex items-center gap-1">
                                                        <Check className="h-3 w-3" /> Applied
                                                    </span>
                                                ) : (
                                                    'Apply Now'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIRecommendations;
