import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Globe,
  RefreshCw,
  Clock,
  History,
  AlertTriangle,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import { monitoringService, OfficialSourceItem, ReviewCandidateItem } from '../api/monitoringService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/feedback/EmptyState';
import { useToast } from '../context/ToastContext';

export const AdminReviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'sources' | 'audit'>('queue');
  const [candidates, setCandidates] = useState<ReviewCandidateItem[]>([]);
  const [sources, setSources] = useState<OfficialSourceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [candRes, srcRes, auditRes] = await Promise.all([
        monitoringService.getReviewCandidates('PENDING_REVIEW'),
        monitoringService.getOfficialSources(),
        monitoringService.getAuditLogs(),
      ]);
      setCandidates(candRes.data);
      setSources(srcRes.data);
      setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Failed to load administrative watchdog data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (candidateId: string, title: string) => {
    setActionLoading(candidateId);
    try {
      await monitoringService.approveCandidate(candidateId, 'Approved after manual gazette cross-verification');
      showToast('Candidate Approved & Published', `"${title}" has been published to the active gazette feed and alerts dispatched.`, 'success');
      loadData();
    } catch (err) {
      showToast('Approval Failed', 'Unable to approve candidate notice.', 'warning');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (candidateId: string, title: string) => {
    const reason = window.prompt(`Enter rejection reason for "${title}":`, 'Unverified corrigendum / duplicate document');
    if (!reason) return;
    setActionLoading(candidateId);
    try {
      await monitoringService.rejectCandidate(candidateId, reason);
      showToast('Candidate Rejected', `"${title}" rejected and archived in audit trail.`, 'info');
      loadData();
    } catch (err) {
      showToast('Rejection Failed', 'Unable to reject candidate.', 'warning');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerCrawl = async (sourceId: string, authorityName: string) => {
    setActionLoading(sourceId);
    try {
      const res = await monitoringService.triggerCrawl(sourceId);
      showToast(
        'Watchdog Crawl Complete',
        `Polled ${authorityName}. Found ${res.data.items_discovered || 0} notices, ${res.data.new_candidates_created || 0} new candidates.`,
        'success'
      );
      loadData();
    } catch (err) {
      showToast('Crawl Error', 'Unable to complete watchdog check.', 'warning');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-opaline/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-wisteria uppercase tracking-widest">
              Administrative Control Center
            </span>
            <Badge variant="accent" size="sm">
              Official Watchdog
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-nocturne">
            Source Registry & Gazette Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-eclipse/80 mt-1">
            Verify automated scrapers, inspect high-impact candidate changes, and maintain gazette audit integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-opaline/70 pb-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-nocturne text-starlight shadow-sm'
              : 'bg-starlight text-wisteria hover:bg-opaline/30 border border-opaline/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Pending Review Queue ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sources'
              ? 'bg-nocturne text-starlight shadow-sm'
              : 'bg-starlight text-wisteria hover:bg-opaline/30 border border-opaline/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Monitored Official Sources ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-nocturne text-starlight shadow-sm'
              : 'bg-starlight text-wisteria hover:bg-opaline/30 border border-opaline/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      ) : (
        <>
          {/* Tab 1: Review Queue */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              {candidates.length === 0 ? (
                <EmptyState
                  icon={<FileCheck className="w-8 h-8" />}
                  title="Review Queue Clear"
                  description="All scraped recruitment notices and corrigenda have been processed or auto-approved."
                />
              ) : (
                candidates.map((cand) => (
                  <Card key={cand.id} variant="elevated" className="p-6 space-y-4 border-l-4 border-l-wisteria">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" size="sm">
                          {cand.changeType}
                        </Badge>
                        <Badge variant="subtle" size="sm">
                          Confidence: {Math.round(cand.confidenceScore * 100)}%
                        </Badge>
                        <span className="text-xs font-mono font-bold text-wisteria">
                          Parser: {cand.parserVersion}
                        </span>
                      </div>

                      <a
                        href={cand.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-wisteria hover:text-nocturne font-bold"
                      >
                        <span>View Official Source PDF</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-nocturne">{cand.documentTitle}</h3>
                      <p className="text-xs text-eclipse/80 mt-1 font-mono">SHA-256: {cand.contentHash}</p>
                    </div>

                    {/* High Impact Flags */}
                    {cand.highImpactFlags.length > 0 && (
                      <div className="p-3 rounded-lg bg-opaline/20 border border-opaline/70 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-nocturne">
                          <AlertTriangle className="w-4 h-4 text-wisteria" />
                          <span>Requires Administrative Verification (High-Impact Rule Triggered):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cand.highImpactFlags.map((flag, idx) => (
                            <span key={idx} className="text-[11px] font-bold text-nocturne bg-starlight px-2 py-0.5 rounded border border-opaline/70">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Diff Summary */}
                    {Object.keys(cand.diffSummary).length > 0 && (
                      <div className="p-3.5 rounded-lg bg-starlight border border-opaline/70 text-xs space-y-2">
                        <span className="font-bold text-nocturne uppercase tracking-wider text-[10px] block">
                          Detected Modifications vs Verified Record:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(cand.diffSummary).map(([k, v]: [string, any]) => (
                            <div key={k} className="p-2 rounded bg-opaline/20">
                              <span className="font-bold text-nocturne capitalize">{k}:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="line-through text-wisteria">{v.previous || v.old}</span>
                                <span>&rarr;</span>
                                <strong className="text-eclipse">{v.extracted || v.new}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-opaline/60">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(cand.id, cand.documentTitle)}
                        disabled={actionLoading === cand.id}
                        leftIcon={<XCircle className="w-4 h-4 text-wisteria" />}
                      >
                        Reject Candidate
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(cand.id, cand.documentTitle)}
                        disabled={actionLoading === cand.id}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        {actionLoading === cand.id ? 'Publishing...' : 'Approve & Publish to Feed'}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Sources Registry */}
          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sources.map((src) => (
                <Card key={src.id} variant="default" className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold font-mono text-wisteria uppercase">{src.authorityCode}</span>
                      <h3 className="font-black text-nocturne text-base">{src.authorityName}</h3>
                    </div>
                    <Badge variant={src.isActive ? 'active' : 'subtle'} size="sm">
                      {src.isActive ? 'Active Watchdog' : 'Paused'}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1.5 p-3 rounded-lg bg-opaline/20">
                    <div>
                      <span className="text-wisteria font-medium">Domain: </span>
                      <strong className="text-nocturne">{src.officialDomain}</strong>
                    </div>
                    <div>
                      <span className="text-wisteria font-medium">Listing Target: </span>
                      <a href={src.listingUrl} target="_blank" rel="noopener noreferrer" className="text-nocturne underline break-all font-mono">
                        {src.listingUrl}
                      </a>
                    </div>
                    <div>
                      <span className="text-wisteria font-medium">Frequency: </span>
                      <span className="text-eclipse">Every {src.pollingFrequencyMinutes} minutes (Rate limit: {src.rateLimitDelaySeconds}s)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-wisteria pt-2 border-t border-opaline/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Last checked: {src.lastCrawledAt ? new Date(src.lastCrawledAt).toLocaleTimeString() : 'Pending first cycle'}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTriggerCrawl(src.id, src.authorityName)}
                      disabled={actionLoading === src.id}
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${actionLoading === src.id ? 'animate-spin' : ''}`} />}
                    >
                      {actionLoading === src.id ? 'Crawling...' : 'Trigger Crawl'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Tab 3: Audit Trail */}
          {activeTab === 'audit' && (
            <Card variant="default" className="p-6 space-y-4">
              <h3 className="text-base font-black text-nocturne">Administrative Action Trail</h3>
              <div className="divide-y divide-opaline/60">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-4">
                    <div>
                      <span className="font-bold text-nocturne mr-2">[{log.action}]</span>
                      <span className="text-eclipse">{log.summary}</span>
                      <p className="text-[11px] text-wisteria mt-0.5">By: {log.user_email}</p>
                    </div>
                    <span className="text-wisteria whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
