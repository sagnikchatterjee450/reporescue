import React from 'react';
import {
  LayoutDashboard,
  Network,
  Zap,
  Code2,
  FileCode2,
  MessageSquare,
  Activity,
  FileEdit,
  ArrowRightLeft,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tutor', label: 'Tutor Onboarding', icon: Compass, badge: 'New' },
    { id: 'repomap', label: 'Repository Map', icon: Network },
    { id: 'starthere', label: 'Start Here', icon: Zap, badge: 'Signature' },
    { id: 'contribute', label: 'Contribution Finder', icon: Code2, badge: 'Issues' },
    { id: 'code', label: 'Code Explorer', icon: FileCode2 },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare, badge: 'Live' },
    { id: 'health', label: 'Health Scorecard', icon: Activity },
    { id: 'readme', label: 'README Improvement', icon: FileEdit },
    { id: 'compare', label: 'Compare Repos', icon: ArrowRightLeft },
    { id: 'devfix', label: 'DevFix Error Solver', icon: Wrench, badge: 'Fixer' },
  ];

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] border-r border-white/10 bg-[#0a0a0a] transition-all duration-200 z-30 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-white/40'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border ${
                    item.badge === 'Signature'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : item.badge === 'Live'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer & Collapse Toggle */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white transition ${
            activeTab === 'settings' ? 'bg-white/10 text-white' : ''
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0 text-white/40" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
