"use client";

import { useState, useMemo } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  Copy,
  Check,
  Search,
  Filter,
  X,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle2,
  Terminal,
  Layers,
  Network,
  Maximize2,
  Minimize2,
  GitBranch,
  Info,
} from "lucide-react";
import {
  questionCategories,
  type InterviewQuestion,
  type QuestionCategory,
  type Difficulty,
  type MindmapNode,
} from "@/data/interview-questions";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/cn";

export function VsCodeQaWorkspace() {
  const { copy } = useToast();

  // Find first question for initial selection
  const allQuestions = useMemo(
    () => questionCategories.flatMap((cat) => cat.questions),
    []
  );
  const defaultQuestion = allQuestions[0];

  // State
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    defaultQuestion?.id || "rsc-vs-client"
  );
  const [openTabs, setOpenTabs] = useState<string[]>([
    defaultQuestion?.id || "rsc-vs-client",
  ]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    questionCategories.forEach((cat, idx) => {
      // First 2 folders open by default
      initial[cat.id] = idx < 2;
    });
    return initial;
  });
  const [activeSubTab, setActiveSubTab] = useState<"star" | "artifact">("star");
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | Difficulty>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedMindmapNode, setSelectedMindmapNode] = useState<string | null>(null);

  // Active question lookup
  const activeQuestion = useMemo(() => {
    return allQuestions.find((q) => q.id === activeQuestionId) || defaultQuestion;
  }, [allQuestions, activeQuestionId, defaultQuestion]);

  // Active category lookup
  const activeCategory = useMemo(() => {
    return questionCategories.find((cat) => cat.id === activeQuestion?.categoryId);
  }, [activeQuestion]);

  // Open question in tab
  const handleSelectQuestion = (q: InterviewQuestion) => {
    setActiveQuestionId(q.id);
    if (!openTabs.includes(q.id)) {
      setOpenTabs((prev) => [...prev, q.id]);
    }
  };

  // Close tab
  const handleCloseTab = (e: React.MouseEvent, qId: string) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter((id) => id !== qId);
    setOpenTabs(nextTabs);

    if (activeQuestionId === qId) {
      if (nextTabs.length > 0) {
        setActiveQuestionId(nextTabs[nextTabs.length - 1]);
      } else {
        // If all closed, fall back to first question
        setActiveQuestionId(defaultQuestion.id);
        setOpenTabs([defaultQuestion.id]);
      }
    }
  };

  // Toggle folder
  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Copy code handler
  const handleCopyCode = (content: string) => {
    void copy(content, "Code snippet");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Filtered categories and questions
  const filteredCategories = useMemo(() => {
    return questionCategories.map((category) => {
      const questions = category.questions.filter((q) => {
        const matchesDiff =
          difficultyFilter === "All" || q.difficulty === difficultyFilter;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          q.title.toLowerCase().includes(query) ||
          q.filename.toLowerCase().includes(query) ||
          q.tags.some((t) => t.toLowerCase().includes(query));
        return matchesDiff && matchesSearch;
      });
      return {
        ...category,
        questions,
      };
    });
  }, [difficultyFilter, searchQuery]);

  // Total matching count
  const totalMatching = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
  }, [filteredCategories]);

  // Helper for difficulty colors
  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case "Easy":
        return {
          pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          dot: "bg-emerald-400",
        };
      case "Medium":
        return {
          pill: "border-amber-500/30 bg-amber-500/10 text-amber-400",
          dot: "bg-amber-400",
        };
      case "Hard":
        return {
          pill: "border-rose-500/30 bg-rose-500/10 text-rose-400",
          dot: "bg-rose-400",
        };
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-line bg-surface/95 shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden font-sans",
        isMaximized
          ? "fixed inset-4 z-50 rounded-xl max-w-none h-[calc(100vh-2rem)] flex flex-col"
          : "w-full"
      )}
    >
      {/* 1. VS Code Window Titlebar */}
      <div className="flex h-10 items-center justify-between border-b border-line bg-surface-2/90 px-4 select-none">
        {/* Left: Window Controls & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors inline-block" />
            <span className="size-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors inline-block" />
            <span className="size-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors inline-block" />
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-muted">
            interview-dossier — Visual Studio Code
          </span>
        </div>

        {/* Center: Search / Filter input */}
        <div className="flex items-center gap-2 max-w-xs w-full">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter questions or tags (e.g. Next.js, Zustand)..."
              className="h-6 w-full rounded border border-line bg-obsidian/70 pl-7 pr-6 font-mono text-[11px] text-fg placeholder:text-muted/60 focus:border-emerald/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Maximize / Minimize toggle */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-cyan">
            {totalMatching} files
          </span>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="rounded p-1 text-muted hover:bg-surface hover:text-fg transition-colors"
            title={isMaximized ? "Restore window" : "Maximize window"}
          >
            {isMaximized ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Workspace Body: Left Explorer + Right Editor */}
      <div className={cn("grid lg:grid-cols-12", isMaximized ? "flex-1 overflow-hidden" : "")}>
        {/* ================= LEFT SIDEBAR: EXPLORER ================= */}
        <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-line bg-surface/50 flex flex-col max-h-[500px] lg:max-h-[780px] overflow-hidden">
          {/* Explorer Header */}
          <div className="flex items-center justify-between border-b border-line px-3 py-2 bg-surface-2/40">
            <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-muted">
              Explorer: Tech Stacks
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-fg-dim">
                {totalMatching} Q&amp;As
              </span>
            </div>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex items-center gap-1 border-b border-line/60 p-2 bg-obsidian/30 overflow-x-auto">
            <span className="text-[10px] font-mono text-muted pl-1 pr-1 flex items-center gap-1 shrink-0">
              <Filter className="size-2.5" /> Diff:
            </span>
            {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => {
              const active = difficultyFilter === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] transition-colors shrink-0",
                    active
                      ? "bg-emerald/20 text-emerald font-semibold border border-emerald/40"
                      : "text-muted hover:text-fg hover:bg-surface-2"
                  )}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {filteredCategories.map((category) => {
              const isOpen = !!openFolders[category.id];
              const matchCount = category.questions.length;

              return (
                <div key={category.id} className="select-none">
                  {/* Category Folder Row */}
                  <button
                    onClick={() => toggleFolder(category.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-2 py-1.5 font-mono text-xs transition-colors group",
                      isOpen ? "text-fg bg-surface-2/40" : "text-fg-dim hover:bg-surface-2/30"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isOpen ? (
                        <ChevronDown className="size-3.5 text-muted shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 text-muted shrink-0" />
                      )}
                      {isOpen ? (
                        <FolderOpen className="size-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Folder className="size-3.5 text-amber-400/80 shrink-0" />
                      )}
                      <span className="truncate font-semibold tracking-tight text-xs text-left">
                        {category.folderName}
                      </span>
                    </div>
                    <span className="rounded-full bg-surface-2 px-1.5 py-0.2 font-mono text-[10px] text-muted group-hover:text-fg">
                      {matchCount}
                    </span>
                  </button>

                  {/* Question Files (Easy -> Hard) */}
                  {isOpen && (
                    <div className="ml-3 pl-2 border-l border-line/60 my-1 space-y-0.5">
                      {category.questions.length === 0 ? (
                        <p className="px-3 py-1 font-mono text-[11px] text-muted italic">
                          No matching questions
                        </p>
                      ) : (
                        category.questions.map((q) => {
                          const isSelected = q.id === activeQuestionId;
                          const badge = getDifficultyBadge(q.difficulty);

                          return (
                            <button
                              key={q.id}
                              onClick={() => handleSelectQuestion(q)}
                              className={cn(
                                "flex w-full items-center justify-between rounded px-2 py-1.5 font-mono text-xs transition-colors text-left group",
                                isSelected
                                  ? "bg-emerald/15 text-emerald border border-emerald/30 font-medium"
                                  : "text-fg-dim hover:bg-surface-2/60 hover:text-fg"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-1">
                                {q.artifact.type === "code" ? (
                                  <FileCode className={cn("size-3.5 shrink-0", isSelected ? "text-emerald" : "text-cyan/70")} />
                                ) : (
                                  <Network className={cn("size-3.5 shrink-0", isSelected ? "text-emerald" : "text-amber-400/70")} />
                                )}
                                <span className="truncate text-[11.5px]">
                                  {q.filename}
                                </span>
                              </div>

                              <span
                                className={cn(
                                  "shrink-0 rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider",
                                  badge.pill
                                )}
                              >
                                {q.difficulty.slice(0, 1)}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= RIGHT MAIN PANE: VS CODE EDITOR ================= */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col bg-surface/30 min-h-[550px] lg:min-h-[780px] overflow-hidden">
          {/* Top Tabs Bar */}
          <div className="flex items-center border-b border-line bg-surface-2/60 overflow-x-auto no-scrollbar">
            {openTabs.map((qId) => {
              const q = allQuestions.find((item) => item.id === qId);
              if (!q) return null;
              const isActive = qId === activeQuestionId;

              return (
                <div
                  key={qId}
                  onClick={() => setActiveQuestionId(qId)}
                  className={cn(
                    "group flex h-9 items-center gap-2 border-r border-line px-3.5 font-mono text-xs cursor-pointer select-none transition-colors",
                    isActive
                      ? "bg-surface text-fg border-t-2 border-t-emerald font-medium"
                      : "text-muted hover:bg-surface-2 hover:text-fg-dim border-t-2 border-t-transparent"
                  )}
                >
                  {q.artifact.type === "code" ? (
                    <FileCode className={cn("size-3.5", isActive ? "text-emerald" : "text-muted")} />
                  ) : (
                    <Network className={cn("size-3.5", isActive ? "text-amber-400" : "text-muted")} />
                  )}
                  <span className="truncate max-w-[160px] sm:max-w-[200px] text-[11px]">
                    {q.filename}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCloseTab(e, qId)}
                    className="rounded p-0.5 text-muted/60 opacity-0 group-hover:opacity-100 hover:bg-surface-2 hover:text-fg transition-opacity"
                    title="Close Tab"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Breadcrumbs Bar */}
          <div className="flex items-center gap-2 border-b border-line/60 bg-surface/80 px-4 py-1.5 font-mono text-[11px] text-muted overflow-x-auto">
            <span>workspace</span>
            <ChevronRight className="size-3 text-muted/60 shrink-0" />
            <span className="text-fg-dim">{activeCategory?.folderName}</span>
            <ChevronRight className="size-3 text-muted/60 shrink-0" />
            <span className="text-emerald">{activeQuestion?.filename}</span>
            <ChevronRight className="size-3 text-muted/60 shrink-0" />
            <span className="text-cyan">
              {activeSubTab === "star" ? "STAR_Model.md" : activeQuestion?.artifact.code?.filename || "Production_Artifact"}
            </span>
          </div>

          {/* Active Question Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
            {activeQuestion ? (
              <>
                {/* Question Hero & Metadata Header */}
                <div className="rounded-xl border border-line bg-surface-2/40 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase border",
                          getDifficultyBadge(activeQuestion.difficulty).pill
                        )}
                      >
                        {activeQuestion.difficulty} Level
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                        <Clock className="size-3 text-cyan" />
                        {activeQuestion.estimatedTime}
                      </span>
                      <span className="font-mono text-[11px] text-muted/80">
                        Category: {activeCategory?.title}
                      </span>
                    </div>

                    {/* View Switcher Sub-tabs */}
                    <div className="flex items-center rounded-lg border border-line bg-obsidian/80 p-0.5 font-mono text-xs">
                      <button
                        onClick={() => setActiveSubTab("star")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors text-xs font-medium",
                          activeSubTab === "star"
                            ? "bg-emerald/20 text-emerald font-semibold shadow-sm border border-emerald/30"
                            : "text-muted hover:text-fg"
                        )}
                      >
                        <Target className="size-3" />
                        <span>STAR Breakdown</span>
                      </button>
                      <button
                        onClick={() => setActiveSubTab("artifact")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1 transition-colors text-xs font-medium",
                          activeSubTab === "artifact"
                            ? "bg-cyan/20 text-cyan font-semibold shadow-sm border border-cyan/30"
                            : "text-muted hover:text-fg"
                        )}
                      >
                        {activeQuestion.artifact.type === "code" ? (
                          <FileCode className="size-3" />
                        ) : (
                          <Network className="size-3" />
                        )}
                        <span>
                          {activeQuestion.artifact.type === "code"
                            ? "Production Code"
                            : "Mindmap Architecture"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-fg">
                    {activeQuestion.title}
                  </h2>

                  {/* Tech Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activeQuestion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-muted border border-line/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub-Tab 1: STAR Breakdown Content */}
                {activeSubTab === "star" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    {/* S: Situation */}
                    <div className="rounded-xl border border-line/80 bg-surface-2/20 p-4 sm:p-5 relative overflow-hidden group hover:border-emerald/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald/30 bg-emerald/10 text-emerald font-mono font-bold text-sm">
                          S
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald">
                              Situation (Bối Cảnh Thực Tế)
                            </h3>
                            <Compass className="size-3.5 text-emerald/60" />
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-fg-dim">
                            {activeQuestion.situation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* T: Task */}
                    <div className="rounded-xl border border-line/80 bg-surface-2/20 p-4 sm:p-5 relative overflow-hidden group hover:border-cyan/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan font-mono font-bold text-sm">
                          T
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
                              Task (Thách Thức Kỹ Thuật &amp; Mục Tiêu SLA)
                            </h3>
                            <Target className="size-3.5 text-cyan/60" />
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-fg-dim">
                            {activeQuestion.task}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* A: Action */}
                    <div className="rounded-xl border border-line/80 bg-surface-2/20 p-4 sm:p-5 relative overflow-hidden group hover:border-violet-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 font-mono font-bold text-sm">
                          A
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-violet-400">
                              Action (Các Bước Triển Khai Cốt Lõi)
                            </h3>
                            <Sparkles className="size-3.5 text-violet-400/60" />
                          </div>

                          <div className="mt-3 space-y-2.5">
                            {activeQuestion.actions.map((act, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 text-sm leading-relaxed text-fg-dim bg-obsidian/40 rounded-lg p-2.5 border border-line/50"
                              >
                                <CheckCircle2 className="size-4 shrink-0 text-violet-400 mt-0.5" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* R: Result */}
                    <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-4 sm:p-5 relative overflow-hidden">
                      <div className="flex items-start gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald/40 bg-emerald/20 text-emerald font-mono font-bold text-sm">
                          R
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald">
                              Result (Kết Quả Định Lượng &amp; Tác Động Sản Phẩm)
                            </h3>
                            <TrendingUp className="size-3.5 text-emerald" />
                          </div>

                          {/* Concrete Metrics Grid */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {activeQuestion.result.metrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 rounded-lg border border-emerald/30 bg-obsidian/70 px-3 py-2 text-xs font-mono font-semibold text-emerald shadow-sm"
                              >
                                <span className="size-1.5 rounded-full bg-emerald shrink-0" />
                                <span>{metric}</span>
                              </div>
                            ))}
                          </div>

                          <p className="mt-3.5 text-sm leading-relaxed text-fg-dim border-t border-emerald/20 pt-3">
                            <strong className="text-fg font-medium">Executive Takeaway: </strong>
                            {activeQuestion.result.summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Link to view Artifact prompt */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setActiveSubTab("artifact")}
                        className="btn btn-ghost h-8 px-3 font-mono text-xs text-cyan hover:text-cyan border border-cyan/30 bg-cyan/5"
                      >
                        <span>View Production Artifact ({activeQuestion.artifact.type === "code" ? "Code" : "Mindmap"})</span>
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Production Artifact */}
                {activeSubTab === "artifact" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="rounded-xl border border-line bg-surface-2/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-cyan uppercase tracking-wider">
                              Artifact: {activeQuestion.artifact.title}
                            </span>
                            <span className="rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-muted border border-line">
                              {activeQuestion.artifact.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-fg-dim">
                            {activeQuestion.artifact.description}
                          </p>
                        </div>

                        {activeQuestion.artifact.code && (
                          <button
                            onClick={() =>
                              handleCopyCode(activeQuestion.artifact.code?.content || "")
                            }
                            className="btn btn-ghost h-8 px-2.5 font-mono text-xs text-muted hover:text-emerald"
                            title="Copy Code to Clipboard"
                          >
                            {codeCopied ? (
                              <>
                                <Check className="size-3.5 text-emerald" />
                                <span className="text-emerald">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Render CODE Artifact */}
                      {activeQuestion.artifact.type === "code" && activeQuestion.artifact.code && (
                        <div className="mt-4 rounded-xl border border-line bg-obsidian overflow-hidden font-mono text-xs shadow-inner">
                          {/* Code Header Bar */}
                          <div className="flex items-center justify-between border-b border-line/60 bg-surface-2/50 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <FileCode className="size-3.5 text-cyan" />
                              <span className="text-[11px] text-fg-dim font-medium">
                                {activeQuestion.artifact.code.filename}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted uppercase">
                              {activeQuestion.artifact.code.language}
                            </span>
                          </div>

                          {/* Code Content with Line Numbers */}
                          <div className="p-3 overflow-x-auto max-h-[500px]">
                            {activeQuestion.artifact.code.content
                              .trim()
                              .split("\n")
                              .map((line, idx) => {
                                const isComment = line.trim().startsWith("//") || line.trim().startsWith("/*");
                                const isKeyword =
                                  line.includes("export ") ||
                                  line.includes("const ") ||
                                  line.includes("return ") ||
                                  line.includes("async ") ||
                                  line.includes("await ") ||
                                  line.includes("function ");

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-start hover:bg-surface-2/40 py-0.5 transition-colors font-mono"
                                  >
                                    <span className="w-9 shrink-0 select-none text-right pr-4 text-muted/40 text-[11px]">
                                      {idx + 1}
                                    </span>
                                    <span
                                      className={cn(
                                        "whitespace-pre font-mono text-[11.5px] leading-relaxed",
                                        isComment
                                          ? "text-muted/70 italic"
                                          : isKeyword
                                          ? "text-cyan/90 font-medium"
                                          : "text-fg-dim"
                                      )}
                                    >
                                      {line}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Render MINDMAP Artifact */}
                      {activeQuestion.artifact.type === "mindmap" && activeQuestion.artifact.mindmap && (
                        <div className="mt-4 rounded-xl border border-line bg-obsidian/90 p-4 sm:p-6 overflow-hidden">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="font-mono text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                              <Network className="size-3.5" />
                              Interactive Decision Tree / Mindmap
                            </span>
                            <span className="font-mono text-[10px] text-muted">
                              Click any node to view architectural details
                            </span>
                          </div>

                          <MindmapTreeRenderer
                            root={activeQuestion.artifact.mindmap}
                            selectedNode={selectedMindmapNode}
                            onSelectNode={(nodeLabel) => setSelectedMindmapNode(nodeLabel)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center font-mono text-sm text-muted">
                Select a file from the explorer to view the STAR technical breakdown.
              </div>
            )}
          </div>

          {/* 3. VS Code Bottom Status Bar */}
          <div className="flex h-6 items-center justify-between border-t border-line bg-surface-2/90 px-3 font-mono text-[10px] text-muted select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald hover:text-fg cursor-pointer">
                <GitBranch className="size-3" />
                <span>main*</span>
              </span>
              <span className="hidden sm:inline-block">0 errors, 0 warnings</span>
              <span className="hidden md:inline-block text-cyan">
                {activeQuestion?.difficulty} Question
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block">Spaces: 2</span>
              <span>UTF-8</span>
              <span className="hidden md:inline-block text-emerald">STAR Verified</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interactive Mindmap Renderer Component
// ---------------------------------------------------------------------------
function MindmapTreeRenderer({
  root,
  selectedNode,
  onSelectNode,
}: {
  root: MindmapNode;
  selectedNode: string | null;
  onSelectNode: (label: string) => void;
}) {
  return (
    <div className="space-y-4 font-mono">
      {/* Root Node */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => onSelectNode(root.label)}
          className={cn(
            "rounded-xl border px-4 py-2 text-center transition-all shadow-md",
            selectedNode === root.label
              ? "border-amber-400 bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/40"
              : "border-amber-400/40 bg-surface-2/80 text-fg hover:border-amber-400"
          )}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            [CORE ARCHITECTURE]
          </div>
          <div className="text-sm font-semibold mt-0.5">{root.label}</div>
          {root.detail && (
            <div className="text-[11px] text-muted mt-1 max-w-xs">{root.detail}</div>
          )}
        </button>
      </div>

      {/* Primary Children Level */}
      {root.children && root.children.length > 0 && (
        <div className="pt-2">
          <div className="mx-auto h-4 w-0.5 bg-line" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {root.children.map((child, idx) => (
              <MindmapBranch
                key={idx}
                node={child}
                selectedNode={selectedNode}
                onSelectNode={onSelectNode}
                level={1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MindmapBranch({
  node,
  selectedNode,
  onSelectNode,
  level,
}: {
  node: MindmapNode;
  selectedNode: string | null;
  onSelectNode: (label: string) => void;
  level: number;
}) {
  const isSelected = selectedNode === node.label;

  return (
    <div className="rounded-lg border border-line bg-surface/60 p-3 flex flex-col justify-between hover:border-cyan/40 transition-colors">
      <div>
        <button
          onClick={() => onSelectNode(node.label)}
          className="text-left w-full group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-cyan uppercase tracking-wider">
              Phase {level}
            </span>
            {node.children && (
              <span className="rounded bg-surface-2 px-1.5 py-0.2 text-[9px] text-muted">
                {node.children.length} sub-branches
              </span>
            )}
          </div>
          <div
            className={cn(
              "mt-1 text-xs font-bold transition-colors",
              isSelected ? "text-cyan" : "text-fg group-hover:text-cyan"
            )}
          >
            {node.label}
          </div>
          {node.detail && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-fg-dim">
              {node.detail}
            </p>
          )}
        </button>
      </div>

      {/* Sub-children if any */}
      {node.children && node.children.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-line/60 pt-2.5">
          {node.children.map((sub, sIdx) => {
            const isSubSelected = selectedNode === sub.label;
            return (
              <button
                key={sIdx}
                onClick={() => onSelectNode(sub.label)}
                className={cn(
                  "flex flex-col w-full text-left rounded p-1.5 text-[10.5px] transition-colors border",
                  isSubSelected
                    ? "border-emerald/40 bg-emerald/10 text-emerald"
                    : "border-line/40 bg-obsidian/50 text-fg-dim hover:bg-surface-2"
                )}
              >
                <span className="font-semibold text-fg text-[11px]">{sub.label}</span>
                {sub.detail && (
                  <span className="text-muted text-[10px] mt-0.5 leading-normal">
                    {sub.detail}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
