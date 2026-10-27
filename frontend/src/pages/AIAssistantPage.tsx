import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  HelpCircle,
  ShieldCheck,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Languages,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { aiService, ChatMessageResponse, RAGQueryResponse } from '../api/aiService';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  citations?: string[];
  provider?: string;
  isSupported?: boolean;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ask_pdf'>('chat');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'kn'>('en');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'ai',
      text: 'Namaste! I am Govexa AI, your dedicated Indian Government Examination preparation and eligibility advisor. Ask me anything about UPSC, SSC, UGC-NET/KSET, ISRO, Banking syllabi, statutory age relaxations, or timetable strategies.',
      citations: ['Official Commission Recruitment Gazette Reference'],
      provider: 'govexa_ai',
      isSupported: true,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Ask-Your-PDF state
  const [pdfQuery, setPdfQuery] = useState('');
  const [pdfExamCode, setPdfExamCode] = useState('UPSC-CSE');
  const [ragResult, setRagResult] = useState<RAGQueryResponse | null>(null);
  const [isRagSearching, setIsRagSearching] = useState(false);

  // Text-To-Speech (Feature 87)
  const handleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedLanguage === 'hi') utterance.lang = 'hi-IN';
    else if (selectedLanguage === 'kn') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (Feature 86)
  const toggleVoiceRecognition = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'chat') {
          setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setPdfQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const promptSuggestions = [
    'What is the age limit and relaxation for OBC in UPSC CSE 2026?',
    'What is the negative marking penalty in UPSC CSE Prelims?',
    'How is KSET Paper 1 Teaching Aptitude structured?',
    'What is the syllabus overlap between SSC CGL and IBPS PO?',
  ];

  const handleSendMessage = async (queryText: string) => {
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

    try {
      let finalQuery = queryText;
      if (selectedLanguage === 'hi') {
        finalQuery += ' (कृपया उत्तर और स्पष्टीकरण हिन्दी / Hindi में दें)';
      } else if (selectedLanguage === 'kn') {
        finalQuery += ' (ದಯವಿಟ್ಟು ವಿವರಣೆಯನ್ನು ಕನ್ನಡ / Kannada ಭಾಷೆಯಲ್ಲಿ ನೀಡಿ)';
      }

      const resp: ChatMessageResponse = await aiService.chat({ query: finalQuery });
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: resp.reply,
        citations: resp.citations,
        provider: resp.provider,
        isSupported: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed', err);
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'The Govexa AI service encountered a temporary error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAskPdfSearch = async () => {
    if (!pdfQuery.trim()) return;
    setIsRagSearching(true);
    try {
      const res = await aiService.queryRAG({
        query: pdfQuery,
        exam_code: pdfExamCode,
      });
      setRagResult(res);
    } catch (err) {
      console.error('RAG query failed', err);
    } finally {
      setIsRagSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
            AI Advisory & RAG Engine
          </span>
          <Badge variant="active" size="sm">
            Government Exam Specialist
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
          Govexa AI Study & Doubt Assistant
        </h1>
        <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
          Verified syllabus guidance, statutory age relaxation checks, and strict evidence-grounded document search.
        </p>
      </div>

      {/* Tabs and Multilingual Controls (Feature 85) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-opaline/60 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'chat'
                ? 'bg-nocturne text-starlight'
                : 'bg-starlight text-eclipse hover:bg-opaline/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Interactive Guidance
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ask_pdf')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'ask_pdf'
                ? 'bg-nocturne text-starlight'
                : 'bg-starlight text-eclipse hover:bg-opaline/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Ask-Your-PDF (RAG Gazette Retrieval)
            </div>
          </button>
        </div>

        {/* Language Selector (Feature 85) */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white border border-opaline rounded-lg p-1">
          <Languages className="w-3.5 h-3.5 text-wisteria ml-1.5" />
          <button
            type="button"
            onClick={() => setSelectedLanguage('en')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              selectedLanguage === 'en'
                ? 'bg-nocturne text-starlight'
                : 'text-eclipse hover:bg-starlight'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('hi')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              selectedLanguage === 'hi'
                ? 'bg-nocturne text-starlight'
                : 'text-eclipse hover:bg-starlight'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('kn')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              selectedLanguage === 'kn'
                ? 'bg-nocturne text-starlight'
                : 'text-eclipse hover:bg-starlight'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-3 flex flex-col h-[600px] rounded-2xl bg-starlight border border-opaline/70 shadow-sm overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-nocturne text-starlight flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-nocturne text-starlight rounded-tr-none'
                        : 'bg-white border border-opaline/60 text-eclipse rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Citations if present */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-opaline/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-wisteria mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-aurora" /> Verified Citations:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((c, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-starlight border border-opaline text-eclipse px-2 py-0.5 rounded font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] opacity-70">
                      <div className="flex items-center gap-2">
                        {msg.provider && (
                          <span className="font-mono text-wisteria font-bold">
                            provider: {msg.provider}
                          </span>
                        )}
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleSpeak(msg.id, msg.text)}
                            className="inline-flex items-center gap-1 rounded bg-starlight px-2 py-0.5 font-semibold text-wisteria hover:bg-opaline/50 transition-colors"
                            title="Listen to response (TTS)"
                          >
                            {currentlySpeakingId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <span className="ml-auto">{msg.timestamp}</span>
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-wisteria text-starlight flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-wisteria font-medium pl-11">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-wisteria animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-wisteria animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-wisteria animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Govexa AI is fact-checking official gazettes...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-3 sm:p-4 bg-white border-t border-opaline/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputQuery);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening to your voice query...'
                      : selectedLanguage === 'hi'
                      ? 'हिन्दी में सरकारी परीक्षा के बारे में पूछें...'
                      : selectedLanguage === 'kn'
                      ? 'ಕನ್ನಡದಲ್ಲಿ ಪರೀಕ್ಷೆಯ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿ...'
                      : 'Ask any syllabus rule, age limit, negative marking, or exam strategy...'
                  }
                  className="flex-1 text-xs sm:text-sm bg-starlight border border-opaline/80 rounded-xl px-4 py-2.5 text-eclipse placeholder-eclipse/50 focus:outline-none focus:ring-2 focus:ring-wisteria"
                  disabled={isTyping}
                />
                <button
                  type="button"
                  onClick={toggleVoiceRecognition}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-starlight text-wisteria border-opaline/80 hover:bg-opaline/40'
                  }`}
                  title={isListening ? 'Listening... Click to stop' : 'Voice Input (STT)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputQuery.trim() || isTyping}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Ask
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Prompts Sidebar */}
          <div className="space-y-4">
            <Card variant="default" className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-nocturne">
                <HelpCircle className="w-4 h-4 text-wisteria" />
                Frequently Verified Queries
              </div>
              <p className="text-[11px] text-eclipse/80">
                Tap any prompt below to query authoritative recruitment notifications:
              </p>
              <div className="space-y-2">
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-medium bg-white border border-opaline/70 hover:border-wisteria text-nocturne transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="default" className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-nocturne">
                <ShieldCheck className="w-4 h-4 text-aurora" />
                Evidence Grounding
              </div>
              <p className="text-[11px] text-eclipse/80 leading-relaxed">
                Govexa AI is anchored in verified Gazette publications. Objective answers and age rules are derived from statutory recruitment rules, not hallucinations.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        /* Ask-Your-PDF RAG Interface */
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-nocturne flex items-center gap-2">
                <FileText className="w-5 h-5 text-wisteria" />
                Query Official Gazettes & Uploaded Documents
              </h2>
              <p className="text-xs text-eclipse/80 mt-1">
                Passages are extracted, indexed, and retrieved with page-level citations. If the official document does not support an answer, the engine states its lack of evidence rather than fabricating facts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-wisteria uppercase mb-1">
                  Question or Enquiry:
                </label>
                <input
                  type="text"
                  value={pdfQuery}
                  onChange={(e) => setPdfQuery(e.target.value)}
                  placeholder="e.g. What is the negative marking in Prelims? Or what is Rule 3 age limit?"
                  className="w-full text-xs bg-starlight border border-opaline/80 rounded-xl px-3 py-2.5 text-eclipse focus:outline-none focus:ring-2 focus:ring-wisteria"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-wisteria uppercase mb-1">
                  Exam Filter:
                </label>
                <select
                  value={pdfExamCode}
                  onChange={(e) => setPdfExamCode(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl bg-starlight border border-opaline/80 text-nocturne py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-wisteria"
                >
                  <option value="UPSC-CSE">UPSC Civil Services 2026</option>
                  <option value="KSET">KSET Paper 1 Syllabus</option>
                  <option value="UGC-NET">UGC-NET Paper 1 & 2</option>
                  <option value="all">All Official Sources</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleAskPdfSearch}
              disabled={!pdfQuery.trim() || isRagSearching}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              {isRagSearching ? 'Retrieving Passages...' : 'Execute Evidence Search'}
            </Button>
          </Card>

          {ragResult && (
            <Card variant="default" className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-opaline/60 pb-3">
                <div className="flex items-center gap-2">
                  {ragResult.is_supported_by_evidence ? (
                    <Badge variant="active" size="md">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      Supported by Official Gazette
                    </Badge>
                  ) : (
                    <Badge variant="accent" size="md">
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                      Unsupported / State of Ignorance
                    </Badge>
                  )}
                  <span className="text-xs font-mono text-wisteria">
                    Latency: {ragResult.latency_ms}ms
                  </span>
                </div>
                <span className="text-xs font-bold text-nocturne">
                  Confidence: {Math.round(ragResult.confidence_score * 100)}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-starlight border border-opaline/60">
                <p className="text-xs font-bold text-wisteria uppercase tracking-wider mb-1">
                  Fact-Checked Synthesis:
                </p>
                <p className="text-sm text-nocturne leading-relaxed whitespace-pre-line font-medium">
                  {ragResult.answer}
                </p>
              </div>

              {ragResult.citations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-nocturne uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-wisteria" />
                    Source Passages & Provenance:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ragResult.citations.map((c) => (
                      <div
                        key={c.citation_id}
                        className="p-3 rounded-xl bg-white border border-opaline/80 space-y-1.5 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between font-bold text-nocturne">
                          <span>
                            [{c.citation_id}] {c.document_title}
                          </span>
                          <span className="text-[10px] text-wisteria bg-opaline/30 px-1.5 py-0.5 rounded">
                            Page {c.page_number}
                          </span>
                        </div>
                        <p className="text-[11px] text-eclipse/80 italic font-serif">
                          "{c.excerpt}"
                        </p>
                        <p className="text-[10px] text-eclipse/60 font-mono">
                          Section: {c.section_heading}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
