import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, HelpCircle, ShieldCheck, BookOpen } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'ai',
      text: 'Namaste! I am Govexa AI, your dedicated Indian Government Examination preparation and eligibility advisor. Ask me anything about UPSC, SSC, UGC-NET/KSET, ISRO, Banking syllabi, statutory age relaxations, or timetable strategies.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const promptSuggestions = [
    'What is the age limit and relaxation for OBC in UPSC CSE 2026?',
    'What is the syllabus overlap between SSC CGL and IBPS PO?',
    'How is KSET Paper 1 Teaching Aptitude structured?',
    'Can engineering students take ISRO Scientist SC without GATE?',
  ];

  const handleSendMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Contextual responses based on Indian Government exam domains
    setTimeout(() => {
      let reply = '';
      const q = queryText.toLowerCase();

      if (q.includes('age') && (q.includes('upsc') || q.includes('obc'))) {
        reply =
          'For UPSC Civil Services Examination (CSE) 2026, the standard General UR age limit is 21 to 32 years (as of 1st August 2026). For OBC-NCL candidates, a statutory 3-year relaxation applies, raising the upper age ceiling to 35 years. Additionally, OBC candidates are permitted 9 attempts (compared to 6 for General UR).';
      } else if (q.includes('ssc') && q.includes('ibps') || q.includes('overlap')) {
        reply =
          'SSC CGL and IBPS PO have roughly 65% syllabus commonality. Quantitative Aptitude (Arithmetic) and English Comprehension overlap heavily. The key differences: SSC CGL includes Advanced Mathematics (Geometry, Trigonometry, Algebra) and Static General Awareness, whereas IBPS PO focuses on Banking Awareness, High-Level Reasoning Puzzles, and Data Interpretation under strict sectional 20-minute timers.';
      } else if (q.includes('kset') || q.includes('paper 1') || q.includes('ugc')) {
        reply =
          'KSET and UGC-NET Paper 1 consists of 50 compulsory objective questions (100 Marks) spanning 10 units: Teaching Aptitude, Research Aptitude, Reading Comprehension, Communication, Mathematical Reasoning, Logical Reasoning, Data Interpretation, ICT, People & Environment, and Higher Education System. There is no negative marking.';
      } else if (q.includes('isro') || q.includes('gate')) {
        reply =
          'Yes! The ISRO Centralised Recruitment Board (ICRB) conducts its own independent written test for Scientist/Engineer "SC" across Computer Science, Electronics, and Mechanical streams. You do not require a GATE score for the ICRB recruitment examination. The written test features 80 discipline-specific core engineering MCQs with -0.33 negative marking.';
      } else {
        reply =
          `Regarding "${queryText}": In Indian competitive examinations, selection is governed by statutory notifications published in the Gazette of India. Candidates are evaluated based on written screening stages (CBT or descriptive papers) followed by personality interviews. Check the official Commission portal or the Govexa Eligibility Screener to verify criteria.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
            AI Advisory Engine
          </span>
          <Badge variant="active" size="sm">
            Government Exam Specialist
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
          Govexa AI Study & Doubt Assistant
        </h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Ask syllabus questions, analyze exam overlaps, get statutory eligibility clarification, and plan weekly timetables.
        </p>
      </div>

      {/* Suggested Prompts Strip */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-wisteria uppercase tracking-wider block">
          Suggested Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs p-2 rounded-lg bg-starlight border border-opaline/70 hover:border-wisteria hover:bg-opaline/20 text-nocturne font-medium transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Workspace Card */}
      <Card variant="elevated" className="p-0 overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-starlight">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi
                      ? 'bg-nocturne text-starlight'
                      : 'bg-wisteria text-starlight'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed ${
                    isAi
                      ? 'bg-opaline/20 text-eclipse border border-opaline/60'
                      : 'bg-nocturne text-starlight'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isAi ? 'text-wisteria' : 'text-opaline/80'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-wisteria p-2">
              <Bot className="w-4 h-4 animate-bounce" />
              <span>Govexa AI is formulating answer from gazette guidelines...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-starlight border-t border-opaline/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask an exam question (e.g. CSAT syllabus, age relaxation, cut-off trends)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-xl bg-opaline/20 border border-opaline/80 text-eclipse placeholder:text-wisteria/70 focus:outline-none focus:ring-2 focus:ring-wisteria"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuery.trim() || isTyping}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Ask
            </Button>
          </form>

          <p className="text-[10px] text-wisteria text-center mt-2">
            AI Prototype Assistant. Always cross-verify critical dates with official Commission notifications.
          </p>
        </div>
      </Card>
    </div>
  );
};
