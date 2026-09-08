import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constants'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'

const companyArray = [];

const PostJob = () => {
    useGetAllCompanies();
    const params = useParams();
    const isEdit = Boolean(params.id);

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experiencelevel: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    useEffect(() => {
        if (params.id) {
            const fetchJob = async () => {
                try {
                    const res = await axios.get(`${JOB_API_END_POINT}/get/${params.id}`, { withCredentials: true });
                    if (res.data.success && res.data.job) {
                        const job = res.data.job;
                        setInput({
                            title: job.title || "",
                            description: job.description || "",
                            requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : (job.requirements || ""),
                            salary: job.salary || "",
                            location: job.location || "",
                            jobType: job.jobType || "",
                            experiencelevel: job.experiencelevel || "",
                            position: job.position || 0,
                            companyId: job.company?._id || job.company || ""
                        });
                    }
                } catch (err) {
                    console.error("Error loading job for edit:", err);
                }
            };
            fetchJob();
        }
    }, [params.id]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company)=> company.name.toLowerCase() === value);
        if (selectedCompany) {
            setInput({...input, companyId:selectedCompany._id});
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const url = isEdit ? `${JOB_API_END_POINT}/update/${params.id}` : `${JOB_API_END_POINT}/post`;
            const method = isEdit ? axios.put : axios.post;
            
            const res = await method(url, input, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save job.");
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-background text-foreground pb-12 transition-colors duration-200'>
            <Navbar />
            <div className='max-w-4xl mx-auto my-10 px-4'>
                <form onSubmit={submitHandler} className='p-8 bg-card border border-border text-card-foreground shadow-sm rounded-2xl'>
                    <div className='mb-6'>
                        <h1 className='text-2xl font-bold text-foreground'>{isEdit ? "Edit Job Posting" : "Post a New Job"}</h1>
                        <p className='text-xs text-muted-foreground mt-1'>Fill in the details below to publish your opening.</p>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Job Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                placeholder="Role summary and duties"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                placeholder="e.g. React, Node.js, AWS (comma separated)"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                placeholder="e.g. 12 LPA or $120,000/yr"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                placeholder="e.g. Bangalore, Remote, New York"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                placeholder="e.g. Full-Time, Remote, Part-Time"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">Experience Level</Label>
                            <Input
                                type="text"
                                name="experiencelevel"
                                value={input.experiencelevel}
                                onChange={changeEventHandler}
                                placeholder="e.g. 2+ years, Entry-level"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div>
                            <Label className="text-foreground font-medium text-xs">No. of Openings</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                placeholder="e.g. 2"
                                className="bg-background border-border text-foreground my-1.5"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-foreground font-medium text-xs block mb-1.5">Company</Label>
                            {
                                companies.length > 0 ? (
                                    <Select onValueChange={selectChangeHandler}>
                                        <SelectTrigger className="w-full sm:w-[280px] bg-background border-border text-foreground">
                                            <SelectValue placeholder="Select a Company" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card text-card-foreground border-border">
                                            <SelectGroup>
                                                {
                                                    companies.map((company) => {
                                                        return (
                                                            <SelectItem key={company._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                        )
                                                    })
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className='text-xs text-amber-600 dark:text-amber-400 font-semibold my-2'>
                                        *Please register a company first before posting jobs.
                                    </p>
                                )
                            }
                        </div>
                    </div> 
                    {
                        loading ? (
                            <Button disabled className="w-full mt-6 bg-[#7209b7] text-white">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full mt-6 bg-[#7209b7] hover:bg-[#5f0799] text-white">
                                {isEdit ? "Update Job" : "Post New Job"}
                            </Button>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob 