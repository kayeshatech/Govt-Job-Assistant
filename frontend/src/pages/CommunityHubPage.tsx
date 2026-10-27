import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Send,
  PlusCircle,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  ThumbsUp,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import {
  communityService,
  StudyGroup,
  GroupDiscussionMessage,
  MentorProfile,
  MentorDashboardData,
} from '../api/communityService';
import { useToast } from '../context/ToastContext';

export const CommunityHubPage: React.FC = () => {
  const { showToast } = useToast();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'groups' | 'mentors' | 'mentor-portal'>('groups');

  // Exam Filtering
  const [selectedExam, setSelectedExam] = useState<string>('all');

  // Study Groups & Thread State
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<GroupDiscussionMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState<boolean>(false);

  // Mentor Directory & Dashboard State
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [mentorDashboard, setMentorDashboard] = useState<MentorDashboardData | null>(null);
  const [isLoadingMentors, setIsLoadingMentors] = useState<boolean>(false);
  const [mentorResolutionText, setMentorResolutionText] = useState<Record<string, string>>({});

  // Create Group Modal / Inline Form State
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupExam, setNewGroupExam] = useState<string>('UPSC-CSE');
  const [newGroupCategory, setNewGroupCategory] = useState<string>('General Studies');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState<boolean>(false);

  // Load Groups
  useEffect(() => {
    loadGroups(selectedExam);
  }, [selectedExam]);

  const loadGroups = async (examCode: string) => {
    setIsLoadingGroups(true);
    try {
      const data = await communityService.getStudyGroups(examCode);
      setGroups(data);
      if (data.length > 0 && (!selectedGroup || !data.some((g) => g.id === selectedGroup.id))) {
        setSelectedGroup(data[0]);
      } else if (data.length === 0) {
        setSelectedGroup(null);
      }
    } catch (err) {
      console.error('Failed to load study groups:', err);
      showToast('error', 'Unable to retrieve study groups. Please try again.');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Load Group Messages when selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) {
      setMessages([]);
      return;
    }
    loadMessages(selectedGroup.id);
  }, [selectedGroup?.id]);

  const loadMessages = async (groupId: string) => {
    setIsLoadingMessages(true);
    try {
      const msgs = await communityService.getGroupMessages(groupId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load Mentors & Mentor Dashboard
  useEffect(() => {
    if (activeTab === 'mentors' || activeTab === 'mentor-portal') {
      loadMentorData();
    }
  }, [activeTab]);

  const loadMentorData = async () => {
    setIsLoadingMentors(true);
    try {
      const mentorList = await communityService.getMentors();
      setMentors(mentorList);

      const dash = await communityService.getMentorDashboard();
      setMentorDashboard(dash);
    } catch (err) {
      console.error('Failed to load mentor data:', err);
    } finally {
      setIsLoadingMentors(false);
    }
  };

  // Handle Post Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newMessage.trim()) return;

    setIsSubmittingMessage(true);
    try {
      const sentMsg = await communityService.postGroupMessage(selectedGroup.id, newMessage.trim());
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
      showToast('success', 'Doubt / Question posted to the study circle.');
    } catch (err) {
      console.error('Failed to post message:', err);
      showToast('error', 'Unable to send message. Please check connection.');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Handle Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDesc.trim()) {
      showToast('warning', 'Please provide a valid circle name and description.');
      return;
    }

    setIsCreatingSubmitting(true);
    try {
      const created = await communityService.createStudyGroup({
        name: newGroupName.trim(),
        exam_code: newGroupExam,
        category: newGroupCategory,
        description: newGroupDesc.trim(),
      });
      showToast('success', `Study Circle "${created.name}" created successfully.`);
      setIsCreatingGroup(false);
      setNewGroupName('');
      setNewGroupDesc('');
      await loadGroups(selectedExam);
      setSelectedGroup(created);
    } catch (err) {
      console.error('Failed to create group:', err);
      showToast('error', 'Error creating study circle.');
    } finally {
      setIsCreatingSubmitting(false);
    }
  };

  // Handle Mentor Resolution Post
  const handleMentorResolve = async (groupId: string, doubtMsgId: string) => {
    const answer = mentorResolutionText[doubtMsgId];
    if (!answer || !answer.trim()) {
      showToast('warning', 'Please enter your verified explanation before submitting.');
      return;
    }

    try {
      await communityService.postGroupMessage(groupId, answer.trim());
      showToast('success', 'Verified faculty response published.');
      setMentorResolutionText((prev) => ({ ...prev, [doubtMsgId]: '' }));
      loadMentorData();
    } catch (err) {
      console.error('Failed to resolve query:', err);
      showToast('error', 'Failed to publish faculty response.');
    }
  };

  const examFilters = [
    { label: 'All Exams', value: 'all' },
    { label: 'UPSC CSE', value: 'UPSC-CSE' },
    { label: 'UGC-NET / KSET', value: 'UGC-NET' },
    { label: 'SSC CGL', value: 'SSC-CGL' },
    { label: 'ISRO ICRB', value: 'ISRO-ICRB' },
  ];

  return (
    <div className="min-h-screen bg-[#F3EEF8] pb-16 pt-6 text-[#0C0A16]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 rounded-2xl border border-[#CDC4DC] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CDC4DC] bg-[#F3EEF8] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#6E5A88]">
                <Users className="h-3.5 w-3.5 text-[#6E5A88]" />
                Features 88 & 89 · Peer Collaboration & Mentorship
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0C0A16] sm:text-3xl">
                Aspirant Community & Faculty Hub
              </h1>
              <p className="mt-1 text-sm text-[#2A2550] sm:text-base">
                Join syllabus-specific peer study circles, solve challenging official PYQs together, and get doubts verified by certified educators.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={activeTab === 'groups' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('groups')}
                className="gap-2 text-xs sm:text-sm"
              >
                <Users className="h-4 w-4" />
                Study Circles
              </Button>
              <Button
                variant={activeTab === 'mentors' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('mentors')}
                className="gap-2 text-xs sm:text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                Verified Mentors
              </Button>
              <Button
                variant={activeTab === 'mentor-portal' ? 'secondary' : 'outline'}
                onClick={() => setActiveTab('mentor-portal')}
                className="gap-2 text-xs sm:text-sm"
              >
                <Award className="h-4 w-4 text-[#8EA4C4]" />
                Faculty Portal
              </Button>
            </div>
          </div>
        </div>

        {/* Tab 1: Collaborative Study Groups (Feature 88) */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            {/* Filter & Actions Bar */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#CDC4DC] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#6E5A88] flex items-center gap-1 mr-1">
                  <Filter className="h-3.5 w-3.5" /> Exam Stream:
                </span>
                {examFilters.map((flt) => (
                  <button
                    key={flt.value}
                    onClick={() => setSelectedExam(flt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedExam === flt.value
                        ? 'bg-[#2A2550] text-[#F3EEF8] shadow-sm'
                        : 'border border-[#CDC4DC] bg-[#F3EEF8] text-[#2A2550] hover:bg-[#CDC4DC]/40'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                className="gap-2 text-xs"
              >
                <PlusCircle className="h-4 w-4" />
                {isCreatingGroup ? 'Cancel Circle' : 'Create Study Circle'}
              </Button>
            </div>

            {/* Create Group Form (Collapsible) */}
            {isCreatingGroup && (
              <Card className="border border-[#8EA4C4] bg-white p-6 shadow-md animate-fadeIn">
                <h2 className="text-lg font-bold text-[#0C0A16] flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-[#6E5A88]" />
                  Launch a New Peer Study Circle
                </h2>
                <p className="text-xs text-[#2A2550] mt-1">
                  Form an exam cohort for collective revision, timetable tracking, and official notification analysis.
                </p>

                <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#2A2550]">Circle Name</label>
                      <input
                        type="text"
                        required
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g. KSET 2026 Paper 1 Higher Education Study Hub"
                        className="mt-1 w-full rounded-lg border border-[#CDC4DC] bg-[#F3EEF8] px-3 py-2 text-xs text-[#0C0A16] focus:border-[#6E5A88] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2A2550]">Target Exam Code</label>
                      <select
                        value={newGroupExam}
                        onChange={(e) => setNewGroupExam(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#CDC4DC] bg-[#F3EEF8] px-3 py-2 text-xs text-[#0C0A16] focus:border-[#6E5A88] focus:outline-none"
                      >
                        <option value="UPSC-CSE">UPSC Civil Services (CSE)</option>
                        <option value="UGC-NET">UGC-NET / KSET</option>
                        <option value="SSC-CGL">SSC Combined Graduate Level</option>
                        <option value="ISRO-ICRB">ISRO ICRB Technical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2A2550]">Category / Focus Focus</label>
                    <input
                      type="text"
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      placeholder="e.g. Answer Writing, PYQ Analysis, Formula Drills"
                      className="mt-1 w-full rounded-lg border border-[#CDC4DC] bg-[#F3EEF8] px-3 py-2 text-xs text-[#0C0A16] focus:border-[#6E5A88] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2A2550]">Description & Circle Objective</label>
                    <textarea
                      required
                      rows={2}
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      placeholder="Outline the weekly schedule, topics covered, and norms of this peer group..."
                      className="mt-1 w-full rounded-lg border border-[#CDC4DC] bg-[#F3EEF8] px-3 py-2 text-xs text-[#0C0A16] focus:border-[#6E5A88] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" type="button" onClick={() => setIsCreatingGroup(false)} className="text-xs">
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isCreatingSubmitting} className="text-xs">
                      {isCreatingSubmitting ? 'Creating...' : 'Publish Study Circle'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Main Community Workspace: Two-Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Circles List */}
              <div className="space-y-3 lg:col-span-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#6E5A88]">
                    Active Study Circles ({groups.length})
                  </h2>
                </div>

                {isLoadingGroups ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : groups.length === 0 ? (
                  <Card className="border border-[#CDC4DC] bg-white p-6 text-center">
                    <Users className="mx-auto h-8 w-8 text-[#8EA4C4]" />
                    <p className="mt-2 text-xs font-semibold text-[#2A2550]">No circles found for this filter.</p>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingGroup(true)}
                      className="mt-3 text-xs"
                    >
                      Create the first circle
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {groups.map((grp) => {
                      const isSelected = selectedGroup?.id === grp.id;
                      return (
                        <div
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp)}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            isSelected
                              ? 'border-[#2A2550] bg-white shadow-md ring-2 ring-[#6E5A88]/20'
                              : 'border-[#CDC4DC] bg-white hover:border-[#8EA4C4] hover:bg-[#F3EEF8]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="rounded bg-[#F3EEF8] px-2 py-0.5 text-[10px] font-bold text-[#6E5A88]">
                              {grp.exam_code}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#2A2550]">
                              <Users className="h-3 w-3 text-[#8EA4C4]" />
                              {grp.member_count} peers
                            </span>
                          </div>

                          <h3 className="mt-2 text-sm font-bold text-[#0C0A16] line-clamp-1">
                            {grp.name}
                          </h3>
                          <p className="mt-1 text-xs text-[#2A2550] line-clamp-2">
                            {grp.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between border-t border-[#CDC4DC]/40 pt-2 text-[10px] text-[#6E5A88]">
                            <span>{grp.category}</span>
                            <span className="text-green-700 font-semibold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                              Active Discussion
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Discussion Thread & Messages */}
              <div className="lg:col-span-8">
                {selectedGroup ? (
                  <Card className="flex h-[700px] flex-col border border-[#CDC4DC] bg-white p-0 shadow-sm">
                    {/* Circle Header */}
                    <div className="border-b border-[#CDC4DC] bg-[#F3EEF8]/60 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="active" size="sm">
                              {selectedGroup.exam_code}
                            </Badge>
                            <span className="text-xs text-[#6E5A88] font-medium">
                              {selectedGroup.category}
                            </span>
                          </div>
                          <h2 className="mt-1 text-base font-bold text-[#0C0A16]">
                            {selectedGroup.name}
                          </h2>
                          <p className="text-xs text-[#2A2550] mt-0.5">
                            {selectedGroup.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#CDC4DC] bg-white px-2.5 py-1 text-xs font-semibold text-[#2A2550]">
                            <Users className="h-3 w-3 text-[#6E5A88]" />
                            {selectedGroup.member_count} Aspirants Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                      {isLoadingMessages ? (
                        <div className="space-y-4">
                          <Skeleton className="h-16 w-3/4 rounded-xl" />
                          <Skeleton className="h-20 w-5/6 ml-auto rounded-xl" />
                          <Skeleton className="h-16 w-2/3 rounded-xl" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#2A2550]">
                          <MessageSquare className="h-10 w-10 text-[#8EA4C4] mb-2" />
                          <p className="text-sm font-semibold">No questions posted yet in this circle.</p>
                          <p className="text-xs text-[#6E5A88] mt-1 max-w-sm">
                            Be the first to post a syllabus doubt, PYQ solution, or strategy question below!
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMentor = msg.is_verified_mentor_answer;
                          return (
                            <div
                              key={msg.id}
                              className={`rounded-xl border p-4 transition-all ${
                                isMentor
                                  ? 'border-[#6E5A88] bg-[#F3EEF8] shadow-sm ring-1 ring-[#6E5A88]/30'
                                  : 'border-[#CDC4DC] bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 border-b border-[#CDC4DC]/30 pb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                      isMentor
                                        ? 'bg-[#2A2550] text-[#F3EEF8]'
                                        : 'bg-[#CDC4DC] text-[#0C0A16]'
                                    }`}
                                  >
                                    {msg.author_name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-[#0C0A16]">
                                      {msg.author_name}
                                    </span>
                                    {isMentor && (
                                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#2A2550] px-1.5 py-0.5 text-[9px] font-bold text-[#F3EEF8]">
                                        <CheckCircle2 className="h-2.5 w-2.5 text-green-400" />
                                        Verified Mentor
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className="text-[10px] text-[#6E5A88]">
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <p className="mt-3 text-xs leading-relaxed text-[#0C0A16] whitespace-pre-line">
                                {msg.content}
                              </p>

                              <div className="mt-3 flex items-center justify-between pt-1 text-[11px] text-[#6E5A88]">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3 text-[#8EA4C4]" />
                                  {msg.likes_count} found helpful
                                </span>
                                {isMentor && (
                                  <span className="text-[10px] font-semibold text-[#2A2550]">
                                    Authoritative Syllabus Explanation
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Post Message Input Bar */}
                    <div className="border-t border-[#CDC4DC] bg-white p-3">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={`Ask a doubt or share notes in ${selectedGroup.name}...`}
                          className="flex-1 rounded-lg border border-[#CDC4DC] bg-[#F3EEF8] px-4 py-2.5 text-xs text-[#0C0A16] placeholder:text-[#2A2550]/60 focus:border-[#6E5A88] focus:bg-white focus:outline-none"
                        />
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmittingMessage || !newMessage.trim()}
                          className="gap-1.5 px-4 text-xs"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {isSubmittingMessage ? 'Sending...' : 'Send'}
                        </Button>
                      </form>
                      <p className="mt-1.5 px-1 text-[10px] text-[#6E5A88]">
                        Verified faculty review questions marked with academic citations. Anti-XSS sanitization enforced.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="flex h-[500px] flex-col items-center justify-center border border-[#CDC4DC] bg-white p-6 text-center">
                    <Users className="h-12 w-12 text-[#8EA4C4]" />
                    <h3 className="mt-3 text-base font-bold text-[#0C0A16]">
                      Select a Study Circle
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-[#2A2550]">
                      Choose an exam cohort from the left to view active discussion threads and verified mentor explanations.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Verified Mentors Directory (Feature 89) */}
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#CDC4DC] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#0C0A16] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#6E5A88]" />
                Certified Faculty & Government Exam Mentors
              </h2>
              <p className="mt-1 text-xs text-[#2A2550]">
                Profiles of certified educators, former commission evaluators, and university professors providing verified solutions and syllabus guidance.
              </p>
            </div>

            {isLoadingMentors ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-44 w-full rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {mentors.map((mentor) => (
                  <Card
                    key={mentor.id}
                    className="border border-[#CDC4DC] bg-white p-6 transition-all hover:border-[#8EA4C4] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2A2550] text-lg font-bold text-[#F3EEF8]">
                          {mentor.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-[#0C0A16]">
                              {mentor.full_name}
                            </h3>
                            {mentor.is_verified && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#6E5A88]">
                            {mentor.designation}
                          </p>
                          <p className="text-[11px] text-[#2A2550]">
                            {mentor.institution}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-[#F3EEF8] px-2 py-0.5 text-xs font-bold text-[#2A2550]">
                          ★ {mentor.rating.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-[#CDC4DC]/50 bg-[#F3EEF8]/40 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5A88]">
                        Academic Specialization
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-[#0C0A16]">
                        {mentor.specialization}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#CDC4DC]/40 pt-3 text-xs text-[#2A2550]">
                      <span className="flex items-center gap-1 font-semibold text-[#6E5A88]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        {mentor.total_answers_resolved} Verified Answers Published
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveTab('groups');
                          showToast('info', `Switched to study circles to ask ${mentor.full_name}.`);
                        }}
                        className="text-xs py-1"
                      >
                        Ask in Circle
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Faculty & Mentor Portal Dashboard (Feature 89) */}
        {activeTab === 'mentor-portal' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#CDC4DC] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0C0A16] flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#6E5A88]" />
                    Faculty Doubt Resolution & Cohort Portal
                  </h2>
                  <p className="mt-1 text-xs text-[#2A2550]">
                    Dedicated dashboard for certified faculty members to evaluate student queries and publish authoritative answers.
                  </p>
                </div>
                {mentorDashboard && (
                  <Badge variant="active">
                    Logged in as: {mentorDashboard.mentor_profile.full_name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Metrics Overview */}
            {mentorDashboard && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border border-[#CDC4DC] bg-white p-4">
                  <span className="text-xs font-semibold text-[#6E5A88]">Total Questions Resolved</span>
                  <p className="mt-1 text-2xl font-black text-[#0C0A16]">
                    {mentorDashboard.mentor_profile.total_answers_resolved}
                  </p>
                  <span className="text-[10px] text-green-700">Authoritative PYQ solutions verified</span>
                </Card>

                <Card className="border border-[#CDC4DC] bg-white p-4">
                  <span className="text-xs font-semibold text-[#6E5A88]">Peer Satisfaction Rating</span>
                  <p className="mt-1 text-2xl font-black text-[#0C0A16]">
                    ★ {mentorDashboard.mentor_profile.rating.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-[#2A2550]">Based on verified aspirant reviews</span>
                </Card>

                <Card className="border border-[#CDC4DC] bg-white p-4">
                  <span className="text-xs font-semibold text-[#6E5A88]">Assigned Cohort Circles</span>
                  <p className="mt-1 text-2xl font-black text-[#0C0A16]">
                    {mentorDashboard.assigned_study_groups.length}
                  </p>
                  <span className="text-[10px] text-[#6E5A88]">Active syllabus supervision</span>
                </Card>
              </div>
            )}

            {/* Student Doubt Resolution Queue */}
            <Card className="border border-[#CDC4DC] bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#0C0A16] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#6E5A88]" />
                Unresolved Aspirant Doubts Queue ({mentorDashboard?.recent_student_queries.length || 0})
              </h3>
              <p className="text-xs text-[#2A2550] mt-0.5">
                Review peer questions from your assigned streams and provide certified explanations with official gazette citations.
              </p>

              <div className="mt-4 space-y-4">
                {mentorDashboard && mentorDashboard.recent_student_queries.length > 0 ? (
                  mentorDashboard.recent_student_queries.map((query) => (
                    <div
                      key={query.id}
                      className="rounded-xl border border-[#CDC4DC] bg-[#F3EEF8]/40 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0C0A16]">
                          From: {query.author_name}
                        </span>
                        <span className="text-[10px] text-[#6E5A88]">
                          {new Date(query.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#0C0A16] font-medium leading-relaxed bg-white p-3 rounded-lg border border-[#CDC4DC]/60">
                        "{query.content}"
                      </p>

                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={mentorResolutionText[query.id] || ''}
                          onChange={(e) =>
                            setMentorResolutionText((prev) => ({
                              ...prev,
                              [query.id]: e.target.value,
                            }))
                          }
                          placeholder="Type certified mentor answer with reference to UGC regulations / official notification..."
                          className="w-full rounded-lg border border-[#CDC4DC] bg-white px-3 py-2 text-xs text-[#0C0A16] focus:border-[#6E5A88] focus:outline-none"
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            onClick={() => handleMentorResolve(query.group_id, query.id)}
                            className="text-xs gap-1 py-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Publish Verified Answer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#2A2550]">
                    All peer queries in your assigned streams are currently answered!
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHubPage;
