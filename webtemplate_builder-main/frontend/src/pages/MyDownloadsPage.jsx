import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Sliders, CheckCircle2, ShieldAlert, ArrowRight, Package, Clock, ShieldCheck } from 'lucide-react';
import { downloadsAPI } from '../api/downloads';
import { useToast } from '../components/Toast';

export const MyDownloadsPage = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { addToast } = useToast();

  const fetchDownloads = () => {
    setLoading(true);
    downloadsAPI
      .getMyDownloads()
      .then((data) => {
        setDownloads(data.results || data || []);
      })
      .catch((err) => console.error('Failed to load downloads', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleDownload = async (entitlement) => {
    setDownloadingId(entitlement.id);
    try {
      await downloadsAPI.downloadFile(entitlement.id, entitlement.template?.title);
      addToast('Download started successfully!', 'success');
      fetchDownloads();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to download template package.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Purchased Templates & Licences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Access your verified clean source code packages (.zip) unlocked directly through your account.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-3xl p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No purchased downloads yet</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            When you purchase website templates from our marketplace, your private download packages and licenses will appear here.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all"
            >
              Explore Templates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {downloads.map((ent) => {
            const allowed = ent.can_download?.allowed !== false;
            return (
              <div
                key={ent.id}
                className="rounded-3xl glass-card p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {ent.template?.category?.name || 'Template'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 glass-panel px-2.5 py-0.5 rounded-full">
                      v{ent.version}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {ent.template?.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {ent.template?.short_description}
                  </p>

                  {/* Quota & Info Box */}
                  <div className="p-4 rounded-2xl glass-panel space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-medium">Quota Used</span>
                      <span className="font-mono font-bold text-white">
                        {ent.download_count} / {ent.max_downloads} downloads
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (ent.download_count / ent.max_downloads) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(ent.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Entitled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleDownload(ent)}
                    disabled={!allowed || downloadingId === ent.id}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${
                      allowed
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {downloadingId === ent.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {allowed ? 'Download Package (.ZIP)' : 'Download Quota Reached'}
                      </>
                    )}
                  </button>

                  <Link
                    to={`/studio?template=${ent.template?.id}`}
                    className="w-full py-2.5 px-4 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Open in Theme Studio
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
