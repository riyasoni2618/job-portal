import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const handlePageClick = (page) => {
        if (typeof page === 'number' && page !== currentPage) {
            onPageChange(page);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
    };

    return (
        <nav 
            role="navigation" 
            aria-label="Pagination Navigation" 
            className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 mt-6 border-t border-border"
        >
            <div className="text-xs text-muted-foreground order-2 sm:order-1">
                Page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="h-8 px-2.5 text-xs border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 py-1 text-xs text-muted-foreground select-none"
                                >
                                    …
                                </span>
                            );
                        }

                        const isActive = page === currentPage;
                        return (
                            <Button
                                key={page}
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                onClick={() => handlePageClick(page)}
                                aria-current={isActive ? "page" : undefined}
                                className={`h-8 min-w-[32px] px-2 text-xs font-semibold rounded-lg transition-colors ${
                                    isActive
                                        ? "bg-[#7209b7] hover:bg-[#5f0799] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-white shadow-xs border-transparent"
                                        : "border-border text-foreground hover:bg-muted bg-card"
                                }`}
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2.5 text-xs border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Go to next page"
                >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
            </div>
        </nav>
    );
};

export default Pagination;
