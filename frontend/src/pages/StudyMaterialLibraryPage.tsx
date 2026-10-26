import React, { useState, useEffect } from 'react';
import { BookOpen, Download, FileText, Filter, Search, Award, CheckCircle2 } from 'lucide-react';
import { preparationService } from '../api/preparationService';
import { StudyMaterial, MaterialType } from '../types/preparation';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Skeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { useToast } from '../context/ToastContext';

export const StudyMaterialLibraryPage: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const typeOptions = [
    { label: 'All Material Types', value: 'all' },
    { label: 'Previous Year Question Papers (PYQs)', value: 'PYQ Paper' },
    { label: 'Reference Notes & Handbooks', value: 'Reference Notes' },
    { label: 'Formula & Shortcut Booklets', value: 'Formula Book' },
    { label: 'Official PDF Syllabi', value: 'PDF Syllabus' },
    { label: 'Current Affairs Compendiums', value: 'Current Affairs Digest' },
  ];

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await preparationService.getMaterials(undefined, selectedType);
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to load study materials', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedType]);

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.examCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (materialTitle: string) => {
    showToast('Download Initiated', `Downloading ${materialTitle}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
            Academic Resource Hub
          </span>
          <Badge variant="active" size="sm">
            Curated Archives
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
          Government Exam Study-Material & PYQ Library
        </h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Verified question papers, high-yield revision summaries, formula booklets, and official syllabi for Indian public competitive examinations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-starlight border border-opaline/70 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search resources: CSAT, UGC-NET Paper 1, Mathematics, ISRO PYQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-72">
          <Select
            options={typeOptions}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
        </div>
      </div>

      {/* Materials Grid */}
      <div>
        <p className="text-xs font-bold text-wisteria mb-4">
          Available Documents: <strong className="text-nocturne">{filteredMaterials.length}</strong>
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={240} />
            ))}
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat) => (
              <Card
                key={mat.id}
                variant="default"
                className="p-5 flex flex-col justify-between h-full border border-opaline/70 hover:border-wisteria transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="accent" size="sm">
                      {mat.type}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-wisteria">
                      {mat.examCode}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-nocturne line-clamp-2 mb-1.5 leading-snug">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-wisteria mb-3">{mat.authorAgency}</p>
                  <p className="text-xs text-eclipse/80 line-clamp-3 mb-4 leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-opaline/60 flex items-center justify-between">
                  <div className="text-[11px] text-wisteria">
                    <span>{mat.fileSize}</span> • <span>{mat.pagesCount} Pages</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(mat.title)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="No Documents Found"
            description="No study materials or question papers matched your search query."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedType('all');
            }}
          />
        )}
      </div>
    </div>
  );
};
