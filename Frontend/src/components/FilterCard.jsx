import React from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { MapPin, Briefcase, IndianRupee, RotateCcw } from 'lucide-react'

export const FILTER_OPTIONS = [
    {
        filterType: "Location",
        key: "location",
        icon: MapPin,
        allLabel: "All Locations",
        array: [
            "Delhi",
            "Noida",
            "Gurugram / Gurgaon",
            "Bangalore / Bengaluru",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Chennai",
            "Kolkata",
            "Jaipur"
        ]
    },
    {
        filterType: "Industry",
        key: "industry",
        icon: Briefcase,
        allLabel: "All Industries",
        array: [
            "Software / IT",
            "FinTech",
            "E-commerce",
            "EdTech",
            "HealthTech",
            "AI / Machine Learning",
            "Banking",
            "Consulting",
            "SaaS",
            "Telecom"
        ]
    },
    {
        filterType: "Salary Range",
        key: "salary",
        icon: IndianRupee,
        allLabel: "All Salaries",
        array: [
            "0–3 LPA",
            "3–5 LPA",
            "5–8 LPA",
            "8–12 LPA",
            "12–18 LPA",
            "18–25 LPA",
            "25+ LPA"
        ]
    }
];

const FilterCard = ({
    selectedFilters = { location: "", industry: "", salary: "" },
    onFilterChange = () => {},
    onClearAll = () => {}
}) => {
    const hasActiveFilters = Boolean(
        selectedFilters.location || selectedFilters.industry || selectedFilters.salary
    );

    return (
        <div className='w-full bg-card p-5 rounded-2xl border border-border shadow-xs'>
            {/* Header */}
            <div className='flex items-center justify-between pb-3 border-b border-border'>
                <h1 className='font-bold text-base text-foreground'>Filter Jobs</h1>
                {hasActiveFilters && (
                    <button
                        onClick={onClearAll}
                        className='inline-flex items-center gap-1 text-xs font-semibold text-[#7209b7] dark:text-[#a855f7] hover:underline transition-colors cursor-pointer'
                        title='Reset all filters'
                    >
                        <RotateCcw className='h-3 w-3' />
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Sections */}
            <div className='space-y-5 pt-4'>
                {FILTER_OPTIONS.map((section, secIdx) => {
                    const Icon = section.icon;
                    const currentValue = selectedFilters[section.key] || "";

                    return (
                        <div key={secIdx} className='space-y-2.5'>
                            {/* Section Header */}
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/80'>
                                    <Icon className='h-3.5 w-3.5 text-[#7209b7] dark:text-[#a855f7]' />
                                    <span>{section.filterType}</span>
                                </div>
                                {currentValue && (
                                    <button
                                        onClick={() => onFilterChange(section.key, "")}
                                        className='text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer'
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Options Radio List */}
                            <RadioGroup
                                value={currentValue}
                                onValueChange={(val) => onFilterChange(section.key, val === currentValue ? "" : val)}
                                className='space-y-1.5 pl-1'
                            >
                                {/* All Option */}
                                <div className='flex items-center space-x-2 py-0.5'>
                                    <RadioGroupItem
                                        value=""
                                        id={`filter-${section.key}-all`}
                                        className='text-[#7209b7] dark:text-[#a855f7] border-border'
                                    />
                                    <Label
                                        htmlFor={`filter-${section.key}-all`}
                                        className={`text-xs cursor-pointer transition-colors ${
                                            !currentValue ? 'font-bold text-[#7209b7] dark:text-[#a855f7]' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {section.allLabel}
                                    </Label>
                                </div>

                                {section.array.map((item, itemIdx) => {
                                    const itemId = `filter-${section.key}-${itemIdx}`;
                                    const isSelected = currentValue === item;

                                    return (
                                        <div key={itemIdx} className='flex items-center space-x-2 py-0.5'>
                                            <RadioGroupItem
                                                value={item}
                                                id={itemId}
                                                className='text-[#7209b7] dark:text-[#a855f7] border-border'
                                            />
                                            <Label
                                                htmlFor={itemId}
                                                className={`text-xs cursor-pointer transition-colors ${
                                                    isSelected ? 'font-bold text-[#7209b7] dark:text-[#a855f7]' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {item}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        </div>
                    );
                })}
            </div>

            {/* Clear All Button at bottom for mobile / accessibility */}
            {hasActiveFilters && (
                <div className='pt-5 border-t border-border mt-5'>
                    <Button
                        onClick={onClearAll}
                        variant='outline'
                        className='w-full text-xs font-semibold py-2 rounded-xl text-foreground hover:bg-muted border-border'
                    >
                        <RotateCcw className='h-3 w-3 mr-1.5' />
                        Reset All Filters
                    </Button>
                </div>
            )}
        </div>
    );

};

export default FilterCard;