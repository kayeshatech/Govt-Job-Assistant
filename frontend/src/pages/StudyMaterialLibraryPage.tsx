import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Download,
  FileText,
  Filter,
  Search,
  Award,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { preparationService } from '../api/preparationService';
import { aiService, GeneratedQuestionItem, FlashcardItem, MindMapNode } from '../api/aiService';
import { StudyMaterial } from '../types/preparation';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Skeleton } from '../components/feedback/Skeleton';
import { useToast } from '../context/ToastContext';

export const StudyMaterialLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'quiz_gen' | 'flashcards' | 'mindmap'>('library');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // AI Tools State
  const [inputText, setInputText] = useState(
    'UGC-NET Paper 1 evaluates Teaching Aptitude, Research Aptitude, Comprehension, and Communication. Teaching Aptitude includes levels of teaching: memory level (Herbart), understanding level (Morrison), and reflective level (Hunt). Formative evaluation provides continuous feedback during instruction.'
  );
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [mindMapTree, setMindMapTree] = useState<MindMapNode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const questions = await aiService.generateQuizFromText(inputText, 'UGC-NET', 'Teaching Aptitude', 3);
      setGeneratedQuestions(questions);
      showToast('Quiz Generated', `Created ${questions.length} objective questions with verified keys`, 'success');
    } catch (err) {
      showToast('Error', 'Failed to generate quiz', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const cards = await aiService.generateFlashcards(inputText, 'Revision Key Concepts', 3);
      setFlashcards(cards);
      setFlippedCards({});
      showToast('Flashcards Ready', `Generated ${cards.length} revision flashcards`, 'success');
    } catch (err) {
      showToast('Error', 'Failed to generate flashcards', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateMindMap = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const tree = await aiService.generateMindMap(inputText, 'Teaching & Research Aptitude');
      setMindMapTree(tree);
      showToast('Mind Map Generated', 'Concept tree created successfully', 'success');
    } catch (err) {
      showToast('Error', 'Failed to generate mind map', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCardFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.examCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
            Academic Resource & AI Intelligence Hub
          </span>
          <Badge variant="active" size="sm">
            Curated Archives & Generators
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
          Government Exam Study-Material & Syllabus Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Verified question papers, high-yield revision summaries, formula booklets, and AI-powered question & flashcard generators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-opaline/60 pb-2">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'library'
              ? 'bg-nocturne text-starlight'
              : 'bg-starlight text-eclipse hover:bg-opaline/40'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Verified Material Library
          </div>
        </button>

        <button
          onClick={() => setActiveTab('quiz_gen')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'quiz_gen'
              ? 'bg-nocturne text-starlight'
              : 'bg-starlight text-eclipse hover:bg-opaline/40'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            PDF-to-Quiz Generator
          </div>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'flashcards'
              ? 'bg-nocturne text-starlight'
              : 'bg-starlight text-eclipse hover:bg-opaline/40'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Revision Flashcards
          </div>
        </button>

        <button
          onClick={() => setActiveTab('mindmap')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'mindmap'
              ? 'bg-nocturne text-starlight'
              : 'bg-starlight text-eclipse hover:bg-opaline/40'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Concept Mind-Map
          </div>
        </button>
      </div>

      {activeTab === 'library' && (
        <div className="space-y-6">
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
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="p-8 text-center text-xs text-eclipse/80">No resources matched your search filter.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((item) => (
                  <Card key={item.id} variant="default" className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="subtle" size="sm">
                          {item.examCode}
                        </Badge>
                        <span className="text-[11px] font-bold text-wisteria bg-opaline/30 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-nocturne line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-eclipse/80 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-opaline/60 flex items-center justify-between">
                      <span className="text-[11px] text-eclipse/60 font-mono">
                        {item.fileSize}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => showToast('Download Initiated', `Downloading ${item.title}`, 'success')}
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quiz_gen' && (
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-4">
            <h2 className="text-base font-bold text-nocturne flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wisteria" />
              Generate Objective Practice Quiz from Document / Syllabus Text
            </h2>
            <p className="text-xs text-eclipse/80">
              Paste official notification text or notes below. The AI extracts key factual statements and generates multiple-choice questions with verified answer keys. AI-generated questions are clearly labeled.
            </p>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-starlight border border-opaline/80 text-nocturne focus:outline-none focus:ring-2 focus:ring-wisteria"
              placeholder="Paste official gazette or textbook excerpt..."
            />

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateQuiz}
              disabled={isProcessing}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              {isProcessing ? 'Generating Quiz Questions...' : 'Generate Practice Questions'}
            </Button>
          </Card>

          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-nocturne uppercase tracking-wider">
                Generated Objective Questions ({generatedQuestions.length})
              </h3>
              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => (
                  <Card key={q.id || idx} variant="default" className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="active" size="sm">
                          Question {idx + 1}
                        </Badge>
                        <Badge variant="subtle" size="sm">
                          {q.difficulty}
                        </Badge>
                        {q.is_ai_generated && (
                          <span className="text-[10px] font-mono font-bold text-wisteria bg-opaline/40 px-2 py-0.5 rounded">
                            AI-Generated Practice Item
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-eclipse/60">{q.topic}</span>
                    </div>

                    <p className="text-sm font-bold text-nocturne leading-relaxed">
                      {q.question_text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg text-xs font-medium border ${
                            oIdx === q.correct_option_index
                              ? 'bg-opaline/40 border-wisteria text-nocturne font-bold'
                              : 'bg-white border-opaline/70 text-eclipse'
                          }`}
                        >
                          <span className="mr-2 font-mono font-bold">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                          {oIdx === q.correct_option_index && (
                            <span className="ml-2 text-[10px] text-wisteria font-bold">
                              (Verified Key)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-starlight border border-opaline/60 text-xs text-eclipse/90">
                      <strong className="text-nocturne">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-4">
            <h2 className="text-base font-bold text-nocturne flex items-center gap-2">
              <Layers className="w-4 h-4 text-wisteria" />
              AI Flashcard Deck Creator
            </h2>
            <p className="text-xs text-eclipse/80">
              Create double-sided flashcards for active recall and rapid formula revision.
            </p>

            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-starlight border border-opaline/80 text-nocturne focus:outline-none focus:ring-2 focus:ring-wisteria"
            />

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateFlashcards}
              disabled={isProcessing}
              rightIcon={<Layers className="w-4 h-4" />}
            >
              {isProcessing ? 'Creating Flashcards...' : 'Generate Flashcards'}
            </Button>
          </Card>

          {flashcards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCardFlip(idx)}
                  className="cursor-pointer min-h-[160px] p-5 rounded-2xl bg-white border border-opaline shadow-sm hover:border-wisteria transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[11px] text-wisteria font-bold uppercase">
                    <span>{flippedCards[idx] ? 'Answer (Reverse)' : 'Prompt (Front)'}</span>
                    <span className="text-[10px] bg-opaline/40 px-2 py-0.5 rounded text-nocturne">
                      Tap to Flip
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-nocturne leading-relaxed my-3">
                    {flippedCards[idx] ? c.back : c.front}
                  </p>

                  <div className="text-[10px] text-eclipse/60 border-t border-opaline/40 pt-2 flex items-center justify-between">
                    <span>{c.topic}</span>
                    <span className="italic">{c.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mindmap' && (
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-4">
            <h2 className="text-base font-bold text-nocturne flex items-center gap-2">
              <Brain className="w-4 h-4 text-wisteria" />
              Hierarchical Syllabus Concept Mind-Map
            </h2>
            <p className="text-xs text-eclipse/80">
              Visualizes topic dependency and unit breakdowns for systematic mastery.
            </p>

            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-starlight border border-opaline/80 text-nocturne focus:outline-none focus:ring-2 focus:ring-wisteria"
            />

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateMindMap}
              disabled={isProcessing}
              rightIcon={<Brain className="w-4 h-4" />}
            >
              {isProcessing ? 'Mapping Concept Nodes...' : 'Generate Mind-Map'}
            </Button>
          </Card>

          {mindMapTree && (
            <Card variant="default" className="p-6">
              <div className="p-4 rounded-xl bg-nocturne text-starlight font-bold text-sm mb-4 inline-block">
                Root: {mindMapTree.label}
              </div>

              <div className="pl-6 border-l-2 border-wisteria/60 space-y-4">
                {mindMapTree.children.map((branch) => (
                  <div key={branch.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-nocturne">
                      <ChevronRight className="w-4 h-4 text-wisteria" />
                      <span className="p-2 rounded-lg bg-white border border-opaline shadow-sm">
                        {branch.label}
                      </span>
                    </div>

                    {branch.children.length > 0 && (
                      <div className="pl-6 border-l-2 border-opaline/60 space-y-1.5 pt-1">
                        {branch.children.map((sub) => (
                          <div key={sub.id} className="text-xs text-eclipse/90 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-wisteria" />
                            {sub.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
