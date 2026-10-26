import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { examService } from '../api/examService';
import { GovernmentExam, ExamFilterCriteria } from '../types/exam';
import { ExamCard } from '../components/exam/ExamCard';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/feedback/EmptyState';
import { Skeleton } from '../components/feedback/Skeleton';

export const ExamDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [exams, setExams] = useState<GovernmentExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState<ExamFilterCriteria>({
    searchQuery: initialQuery,
    category: initialCategory,
    level: 'all',
    conductingBody: 'all',
    stream: 'all',
    sortBy: 'relevance',
  });

  const categoryOptions = [
    { label: 'All Exam Categories', value: 'all' },
    { label: 'Civil Services & Administration', value: 'Civil Services' },
    { label: 'Staff Selection (SSC)', value: 'Staff Selection' },
    { label: 'Engineering & PSUs (ISRO, GATE)', value: 'Engineering & PSU' },
    { label: 'Teaching & Lectureship (UGC-NET / KSET)', value: 'Teaching & Lectureship' },
    { label: 'Banking & Financial Institutions', value: 'Banking & Finance' },
    { label: 'Railways Recruitment (RRB)', value: 'Railways' },
    { label: 'State Administrative Services', value: 'State Administration' },
  ];

  const levelOptions = [
    { label: 'All Levels (Central & State)', value: 'all' },
    { label: 'Central Government Exams', value: 'Central' },
    { label: 'State Government Exams', value: 'State' },
  ];

  const sortOptions = [
    { label: 'Sort: Highest Relevance & Match', value: 'relevance' },
    { label: 'Sort: Application Deadline (Urgent)', value: 'deadline' },
    { label: 'Sort: Total Vacancies (Highest)', value: 'vacancies' },
  ];

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const res = await examService.getExams(filters);
      setExams(res.data);
    } catch (err) {
      console.error('Error fetching exams', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [filters.category, filters.level, filters.sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadExams();
    if (filters.searchQuery) {
      setSearchParams({ q: filters.searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      level: 'all',
      conductingBody: 'all',
      stream: 'all',
      sortBy: 'relevance',
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
          Government Examination Discovery
        </h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Explore all Central & State recruitment cycles, eligibility conditions, syllabus frameworks, and vacancies.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-starlight border border-opaline/70 shadow-sm space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by exam code, post title, or conducting agency (e.g., UPSC, SSC, KSET, ISRO)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search Directory
          </Button>
          {(filters.searchQuery || filters.category !== 'all' || filters.level !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={resetFilters}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          )}
        </form>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-opaline/50">
          <Select
            label="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />

          <Select
            label="Government Level"
            options={levelOptions}
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          />

          <Select
            label="Ordering"
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({
                ...filters,
                sortBy: e.target.value as ExamFilterCriteria['sortBy'],
              })
            }
          />
        </div>
      </div>

      {/* Result Count and Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-wisteria">
            Showing <strong className="text-nocturne">{exams.length}</strong> Government Examinations
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={320} />
            ))}
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Filter className="w-6 h-6" />}
            title="No Examinations Matched"
            description="Try loosening your search terms or resetting category filters to see all available national exams."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}
      </div>
    </div>
  );
};
