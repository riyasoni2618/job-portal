import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <div className="px-4">
            <Carousel className="w-full max-w-xl mx-auto my-16">
                <CarouselContent className="-ml-2 md:-ml-4">
                    {category.map((cat, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                            <Button 
                                onClick={() => searchJobHandler(cat)} 
                                variant="outline" 
                                className="w-full rounded-full border-border bg-card text-foreground hover:bg-[#7209b7] hover:text-white dark:hover:bg-[#8b5cf6] dark:hover:text-white transition-all text-xs font-semibold shadow-xs"
                            >
                                {cat}
                            </Button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="border-border bg-card text-foreground hover:bg-muted" />
                <CarouselNext className="border-border bg-card text-foreground hover:bg-muted" />
            </Carousel>
        </div>
    );
};

export default CategoryCarousel;