import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal, Building2 } from 'lucide-react'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies || []);
    const navigate = useNavigate();

    useEffect(() => {
        const companiesArray = companies || [];
        const filteredCompany = companiesArray.filter((company) => {
            if (!searchCompanyByText) {
                return true;
            }
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
        });
        setFilterCompany(filteredCompany);
    }, [companies, searchCompanyByText]);

    return (
        <div className='bg-card rounded-2xl border border-border shadow-sm overflow-hidden'>
            <Table>
                <TableCaption className='py-4 text-xs text-muted-foreground'>
                    {filterCompany.length > 0 
                        ? `Showing ${filterCompany.length} registered ${filterCompany.length === 1 ? 'company' : 'companies'}`
                        : "A list of your recent registered companies"}
                </TableCaption>
                <TableHeader className='bg-muted/40'>
                    <TableRow className='border-border'>
                        <TableHead className='w-[100px] text-muted-foreground'>Logo</TableHead>
                        <TableHead className='text-muted-foreground'>Name</TableHead>
                        <TableHead className='text-muted-foreground'>Date</TableHead>
                        <TableHead className="text-right text-muted-foreground">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterCompany.length === 0 ? (
                        <TableRow className='border-border'>
                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                                <p className="font-semibold text-foreground">No companies found</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    {searchCompanyByText
                                        ? `No company matches "${searchCompanyByText}".`
                                        : "You haven't registered any company yet. Register your first company to start posting jobs."}
                                </p>
                                {!searchCompanyByText && (
                                    <Button
                                        onClick={() => navigate("/admin/companies/create")}
                                        className="mt-4 bg-[#7209b7] hover:bg-[#5f0799] text-white text-xs rounded-xl"
                                        size="sm"
                                    >
                                        Register First Company
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filterCompany.map((company) => (
                            <TableRow key={company._id} className='hover:bg-muted/50 border-border'>
                                <TableCell>
                                    <Avatar className='h-11 w-11 rounded-xl bg-white dark:bg-gray-900/90 border border-border p-1 shadow-xs'>
                                        <AvatarImage 
                                            src={company.logo || ''} 
                                            alt={company.name} 
                                            className='object-contain rounded-lg'
                                        />
                                        <AvatarFallback className='bg-purple-100 dark:bg-purple-900/40 text-[#7209b7] dark:text-purple-300 font-bold text-xs rounded-lg'>
                                            {company.name ? company.name.slice(0, 2).toUpperCase() : 'CO'}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className='font-semibold text-foreground'>{company.name}</TableCell>
                                <TableCell className='text-xs text-muted-foreground'>
                                    {company.createdAt ? company.createdAt.split("T")[0] : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32 p-2 bg-card text-card-foreground border-border shadow-md" side="left" align="center">
                                            <div 
                                                onClick={() => navigate(`/admin/companies/${company._id}`)} 
                                                className='flex items-center gap-2 w-full p-2 text-xs font-semibold text-foreground hover:bg-muted rounded-lg cursor-pointer'
                                            >
                                                <Edit2 className='h-3.5 w-3.5 text-[#7209b7] dark:text-purple-400' />
                                                <span>Edit Profile</span>
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
    )
}

export default CompaniesTable