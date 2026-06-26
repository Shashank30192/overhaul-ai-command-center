"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search, Settings, CheckCircle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONNECTOR_LIBRARY, AUTH_METHODS, type ConnectorDef } from "./studio-data";

interface StudioLeftPanelProps {
  onAddConnector?: (c: ConnectorDef) => void;
}

function AuthModal({ connector, onClose }: { connector: ConnectorDef; onClose: () => void }) {
  const [method, setMethod] = useState('OAuth2');
  const [tested, setTested] = useState(false);
  const [testing, setTesting] = useState(false);

  const test = () => {
    setTesting(true);
    setTimeout(() => { setTesting(false); setTested(true); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[420px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ background: '#111416' }}>
        <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-base" style={{ background: connector.color + '20', color: connector.color }}>{connector.icon}</div>
          <div>
            <p className="text-sm font-bold text-white">{connector.label}</p>
            <p className="text-[10px] text-white/40">Configure Authentication</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Auth Method</label>
            <div className="grid grid-cols-3 gap-1.5">
              {AUTH_METHODS.slice(0, 6).map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={cn("text-[10px] px-2 py-1.5 rounded-lg border transition-all text-center",
                    method === m ? "border-[#00c2b2]/40 bg-[#00c2b2]/10 text-[#00c2b2]" : "border-white/8 bg-white/3 text-white/40 hover:text-white/70")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          {method === 'OAuth2' && (
            <>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Client ID</label>
                <input defaultValue="erp_client_prod_8f2a9b" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/70 outline-none focus:border-[#00c2b2]/40 font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Client Secret</label>
                <input type="password" defaultValue="••••••••••••••••" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/50 outline-none font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Token URL</label>
                <input defaultValue="https://auth.sap.com/oauth/token" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/50 outline-none font-mono" />
              </div>
            </>
          )}
          {method === 'API Key' && (
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">API Key</label>
              <input defaultValue="sk_prod_••••••••••••••••" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-white/70 outline-none font-mono" />
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            {tested ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <CheckCircle className="h-3.5 w-3.5" /> Connection verified
              </div>
            ) : (
              <button onClick={test} disabled={testing}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white transition-all disabled:opacity-50">
                <Wifi className="h-3 w-3" /> {testing ? 'Testing...' : 'Test Connection'}
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-white/40 hover:text-white transition-all">Cancel</button>
              <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{ background: '#00c2b2', color: '#000' }}>Save Credentials</button>
            </div>
          </div>
        </div>
        <div className="px-5 py-2 border-t border-white/5 flex items-center gap-2">
          <div className={cn("h-1.5 w-1.5 rounded-full", tested ? "bg-emerald-400" : "bg-white/20")} />
          <p className="text-[9px] text-white/25">Token expiry: {tested ? 'Valid — expires in 3h 42m' : 'Not connected'}</p>
        </div>
      </div>
    </div>
  );
}

export function StudioLeftPanel({ onAddConnector }: StudioLeftPanelProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [authModal, setAuthModal] = useState<ConnectorDef | null>(null);

  const toggle = (cat: string) => setCollapsed(s => {
    const n = new Set(s);
    n.has(cat) ? n.delete(cat) : n.add(cat);
    return n;
  });

  const filtered = CONNECTOR_LIBRARY.map(group => ({
    ...group,
    items: group.items.filter(i => !search || i.label.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.items.length > 0);

  return (
    <>
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/6 overflow-hidden" style={{ background: '#090b0c' }}>
        {/* Header */}
        <div className="px-3 pt-3 pb-2 border-b border-white/5">
          <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2 font-semibold px-1">Connector Library</p>
          <div className="flex items-center gap-2 px-2.5 h-7 rounded-lg bg-white/4 border border-white/6">
            <Search className="h-3 w-3 text-white/25 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connectors..."
              className="flex-1 bg-transparent text-[11px] text-white placeholder-white/20 outline-none" />
          </div>
        </div>

        {/* Connector groups */}
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map(group => {
            const open = !collapsed.has(group.category);
            return (
              <div key={group.category} className="mb-0.5">
                <button onClick={() => toggle(group.category)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/3 transition-colors">
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: group.color }} />
                  <span className="flex-1 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wider">{group.category}</span>
                  {open ? <ChevronDown className="h-3 w-3 text-white/20" /> : <ChevronRight className="h-3 w-3 text-white/20" />}
                </button>
                {open && (
                  <div className="px-2 pb-1 space-y-0.5">
                    {group.items.map(item => (
                      <div key={item.id}
                        draggable
                        onDragStart={e => e.dataTransfer.setData('connector', JSON.stringify(item))}
                        className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-transparent hover:border-white/8 hover:bg-white/4 cursor-grab active:cursor-grabbing transition-all">
                        <div className="h-6 w-6 rounded-md flex items-center justify-center text-[11px] shrink-0 border"
                          style={{ background: item.color + '18', color: item.color, borderColor: item.color + '25' }}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-white/70 group-hover:text-white/90 transition-colors truncate">{item.label}</p>
                          <p className="text-[9px] text-white/25 truncate">{item.sublabel}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setAuthModal(item); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Settings className="h-3 w-3 text-white/30 hover:text-white/70" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-white/5">
          <p className="text-[9px] text-white/20 text-center">Drag connectors onto the canvas</p>
        </div>
      </aside>

      {authModal && <AuthModal connector={authModal} onClose={() => setAuthModal(null)} />}
    </>
  );
}
