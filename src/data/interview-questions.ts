export type Difficulty = "Easy" | "Medium" | "Hard";
export type ArtifactType = "code" | "mindmap";

export interface MindmapNode {
  label: string;
  detail?: string;
  children?: MindmapNode[];
}

export interface QuestionArtifact {
  type: ArtifactType;
  title: string;
  description: string;
  code?: {
    language: string;
    filename: string;
    content: string;
  };
  mindmap?: MindmapNode;
}

export interface InterviewQuestion {
  id: string;
  categoryId: string;
  filename: string;
  title: string;
  difficulty: Difficulty;
  estimatedTime: string;
  tags: string[];
  situation: string;
  task: string;
  actions: string[];
  result: {
    metrics: string[];
    summary: string;
  };
  artifact: QuestionArtifact;
}

export interface QuestionCategory {
  id: string;
  folderName: string;
  title: string;
  iconType: "react" | "state" | "perf" | "lead" | "mobile" | "backend";
  description: string;
  questions: InterviewQuestion[];
}

export const questionCategories: QuestionCategory[] = [
  {
    id: "react-nextjs",
    folderName: "01-react-nextjs",
    title: "Next.js & React Core",
    iconType: "react",
    description: "React 19 Server Components, App Router, Streaming CLS, Fiber reconciliation",
    questions: [
      {
        id: "rsc-vs-client",
        categoryId: "react-nextjs",
        filename: "01-rsc-vs-client-boundary.tsx",
        title: "Khi nào dùng Server Components (RSC) vs Client Components trong Next.js App Router?",
        difficulty: "Easy",
        estimatedTime: "5 mins",
        tags: ["Next.js", "RSC", "Architecture"],
        situation:
          "Dự án Infini AI có giao diện nghiên cứu phức tạp kết hợp giữa render công thức toán học và streaming AI tokens. Initial bundle ban đầu bị phình to do nhiều thư viện xử lý markdown được đóng gói vào client bundle.",
        task:
          "Thiết lập boundary rõ ràng giữa React Server Components và Client Components để tối ưu Time To First Byte (TTFB) và giảm thiểu JavaScript gửi về trình duyệt.",
        actions: [
          "Mặc định giữ toàn bộ component dạng RSC (Server-first) để tận dụng stream HTML trực tiếp từ edge mà không tốn chi phí bundle client.",
          "Chỉ đẩy chỉ thị 'use client' xuống các leaf node có tương tác: Form inputs, copy button, audio playback và theme toggle.",
          "Sử dụng kỹ thuật 'Passing Server Components to Client Components as Props/Children' để client wrapper không biến các component con thành client-side.",
          "Kết hợp Next.js dynamic imports (`next/dynamic` với `ssr: false`) cho các module nặng như PDF Viewer để loại bỏ khỏi initial payload.",
        ],
        result: {
          metrics: ["-42% Client Bundle JS", "TTFB giảm từ 920ms xuống 280ms", "LCP đạt 1.1s"],
          summary: "Tối ưu triệt để chi phí tải mã nguồn client mà vẫn giữ trọn vẹn trải nghiệm tương tác mượt mà.",
        },
        artifact: {
          type: "code",
          title: "Server/Client Boundary Architecture",
          description: "Mẫu kiến trúc bọc Leaf Client Components bên ngoài Server Rendered subtrees",
          code: {
            language: "tsx",
            filename: "components/ResearchWorkspace.tsx",
            content: `// ✅ Server Component (Default in App Router)
// Không gửi markdown parser hay highlight.js vào client bundle!
import { Suspense } from "react";
import { fetchPaperMetadata } from "@/lib/academic-api";
import { InteractiveToolbar } from "./InteractiveToolbar"; // 'use client'
import { StaticPaperViewer } from "./StaticPaperViewer"; // RSC

export default async function ResearchWorkspace({ paperId }: { paperId: string }) {
  const paper = await fetchPaperMetadata(paperId); // Chạy trên Server

  return (
    <div className="workspace-layout">
      {/* Client Component chỉ đảm nhận tương tác state cục bộ */}
      <InteractiveToolbar paperId={paperId} initialBookmarked={paper.isBookmarked}>
        {/* Pass RSC as children: Không bị bundle vào client JS của InteractiveToolbar */}
        <Suspense fallback={<PaperSkeleton />}>
          <StaticPaperViewer content={paper.content} citations={paper.citations} />
        </Suspense>
      </InteractiveToolbar>
    </div>
  );
}`,
          },
        },
      },
      {
        id: "streaming-cls-katex",
        categoryId: "react-nextjs",
        filename: "02-streaming-zero-cls.tsx",
        title: "Làm sao để stream Markdown + KaTeX từ AI engine theo thời gian thực mà CLS = 0?",
        difficulty: "Medium",
        estimatedTime: "8 mins",
        tags: ["Next.js 15", "KaTeX", "Streaming", "CLS"],
        situation:
          "Trong nền tảng Infini AI, AI trả lời bằng văn bản markdown kèm công thức toán học LaTeX dài. Khi token stream về liên tục, DOM bị giãn cách liên tục gây layout shift giật cục (CLS > 0.25).",
        task:
          "Thiết kế cơ chế streaming parser kết hợp layout slot reservation giữ vững khung giao diện, đạt chuẩn Web Vitals CLS = 0.",
        actions: [
          "Xây dựng buffer phân tách token theo block (dòng văn bản vs block toán học `$$...$$`) trước khi mount vào cây render.",
          "Với các khối công thức toán học KaTeX, áp dụng kỹ thuật tính toán chiều cao ước lượng (Slot Reservation) qua CSS `content-visibility: auto` và `contain-intrinsic-size`.",
          "Sử dụng React 19 `useOptimistic` và micro-chunk rendering để cập nhật text node không làm trigger recalculate toàn bộ container.",
          "Áp dụng Web Worker để parse chuỗi LaTeX nặng ra HTML ngoài main thread, trả về kết quả pre-computed cho giao diện.",
        ],
        result: {
          metrics: ["CLS = 0.000 tuyệt đối", "Giữ vững 60 FPS trong suốt quá trình stream", "0 hiện tượng text nhảy giật"],
          summary: "Người dùng đọc công thức toán học mượt mà như đang viết ra từng ký tự mà không bị giật trang.",
        },
        artifact: {
          type: "code",
          title: "Buffered Streaming Slot Parser",
          description: "Bộ đệm stream giữ layout ổn định chống giật màn hình",
          code: {
            language: "tsx",
            filename: "lib/streaming/useStableMathStream.ts",
            content: `export function useStableMathStream(streamReader: ReadableStreamDefaultReader<string>) {
  const [contentBlocks, setContentBlocks] = useState<Block[]>([]);
  const bufferRef = useRef("");

  useEffect(() => {
    let active = true;
    async function pump() {
      while (active) {
        const { done, value } = await streamReader.read();
        if (done) break;

        bufferRef.current += value;
        // Kiểm tra block toán học đã đóng gói đầy đủ: $$...$$
        const parsed = parseCompleteBlocks(bufferRef.current);
        
        setContentBlocks((prev) => mergeWithoutReflow(prev, parsed));
      }
    }
    pump();
    return () => { active = false; };
  }, [streamReader]);

  return (
    <div className="stream-viewport contain-layout">
      {contentBlocks.map((block) => (
        <div key={block.id} className="min-h-[2.5rem] will-change-contents">
          {block.type === "math" ? <KaTeXRenderer tex={block.raw} /> : <p>{block.raw}</p>}
        </div>
      ))}
    </div>
  );
}`,
          },
        },
      },
      {
        id: "fiber-concurrency-scheduler",
        categoryId: "react-nextjs",
        filename: "03-react-concurrency-deepdive.tsx",
        title: "Ứng dụng React Fiber và Concurrent Features (useTransition, useDeferredValue) để xử lý tác vụ nặng?",
        difficulty: "Hard",
        estimatedTime: "12 mins",
        tags: ["React 19", "Fiber", "Concurrency", "Performance"],
        situation:
          "Khi người dùng gõ tìm kiếm tài liệu học thuật với hơn 5.000 kết quả trong Infini AI, việc vừa cập nhật input gõ vừa lọc mảng lớn khiến bàn phím bị delay nặng nề (~150ms input latency).",
        task:
          "Áp dụng cơ chế điều phối luồng xử lý ưu tiên của React Fiber để tách biệt tác vụ khẩn cấp (Urgent: gõ bàn phím) với tác vụ không khẩn cấp (Non-urgent: lọc danh sách).",
        actions: [
          "Phân tầng độ ưu tiên: Dùng state thông thường cho giá trị input hiển thị tức thời trong 16ms.",
          "Bọc tác vụ cập nhật danh sách tìm kiếm trong `startTransition` hoặc dùng `useDeferredValue` cho query filter.",
          "Tận dụng khả năng interruptible rendering của Fiber: Nếu người dùng tiếp tục gõ, React sẽ tạm hoãn lượt render dở dang của danh sách để render ký tự mới ngay lập tức.",
          "Kết hợp web worker cho thuật toán fuzzy search mảng lớn, giải phóng hoàn toàn UI thread.",
        ],
        result: {
          metrics: ["Input Latency từ 150ms -> 8ms", "0 dropped frames khi gõ nhanh", "INP (Interaction to Next Paint) = 38ms (Good)"],
          summary: "Giao diện phản hồi gõ bàn phím ngay lập tức, danh sách kết quả tự động cập nhật mượt mà phía sau.",
        },
        artifact: {
          type: "code",
          title: "Interruptible Search Filter with Concurrent React",
          description: "Phân luồng độ ưu tiên render với useTransition",
          code: {
            language: "tsx",
            filename: "components/ConcurrentAcademicSearch.tsx",
            content: `export function ConcurrentAcademicSearch({ corpus }: { corpus: PaperItem[] }) {
  const [inputValue, setInputValue] = useState("");
  const [filteredResults, setFilteredResults] = useState(corpus);
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    
    // ⚡️ Urgent update: Cập nhật ký tự input tức thời trên màn hình
    setInputValue(nextQuery);

    // 🐢 Non-urgent update: Cho phép React ngắt quãng nếu người dùng gõ tiếp
    startTransition(() => {
      const matched = corpus.filter(p => p.searchIndex.includes(nextQuery.toLowerCase()));
      setFilteredResults(matched);
    });
  };

  return (
    <div>
      <input value={inputValue} onChange={handleSearchChange} placeholder="Search 5,000+ papers..." />
      {isPending && <span className="text-muted text-xs">Refining search...</span>}
      <PaperVirtualGrid items={filteredResults} />
    </div>
  );
}`,
          },
        },
      },
    ],
  },
  {
    id: "state-management",
    folderName: "02-state-data-layer",
    title: "State Management & Data Layer",
    iconType: "state",
    description: "TanStack Query, Zustand, Apollo GraphQL, Cache Invalidation, Multi-Tenant Isolation",
    questions: [
      {
        id: "zustand-atomic-selectors",
        categoryId: "state-management",
        filename: "01-zustand-atomic-selectors.ts",
        title: "Tại sao chọn Zustand thay vì Redux Toolkit cho dự án Enterprise và cách viết atomic selector?",
        difficulty: "Easy",
        estimatedTime: "5 mins",
        tags: ["Zustand", "State", "Boilerplate"],
        situation:
          "Nền tảng kiểm soát ra vào ICT CMC Global cần quản lý cấu hình giao diện, filter bảng định danh và auth context của người dùng với tần suất render cao.",
        task:
          "Giảm thiểu boilerplate code của Redux, đồng thời ngăn chặn hiện tượng re-render lan tỏa (cascading renders) khi một state nhỏ thay đổi.",
        actions: [
          "Chọn Zustand nhờ kiến trúc Hook-based nhỏ gọn (<1.2kB), không cần bọc Provider bao quanh toàn bộ component tree.",
          "Áp dụng chuẩn Atomic Selectors: Mỗi component chỉ đăng ký lắng nghe đúng trường dữ liệu nó tiêu thụ qua selector function.",
          "Sử dụng `useShallow` từ `zustand/react/shallow` khi cần lấy nhiều trường cùng lúc mà không gây re-render nếu tham chiếu object thay đổi nhưng giá trị bằng nhau.",
        ],
        result: {
          metrics: ["Giảm 60% dòng code boilerplate", "Loại bỏ hoàn toàn re-render không cần thiết trên 15+ màn hình quản trị"],
          summary: "Đơn giản hóa cấu trúc store, giúp team mới onboard nhanh chóng và code cực kỳ dễ test.",
        },
        artifact: {
          type: "code",
          title: "Zustand Atomic Selector Pattern",
          description: "Đăng ký lắng nghe state nguyên tử chống re-render",
          code: {
            language: "typescript",
            filename: "store/useIdentityFilterStore.ts",
            content: `import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface FilterState {
  departmentId: string | null;
  status: "ACTIVE" | "EXPIRED" | "ALL";
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  resetFilters: () => void;
}

export const useIdentityFilterStore = create<FilterState>((set) => ({
  departmentId: null,
  status: "ALL",
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFilters: () => set({ departmentId: null, status: "ALL", searchQuery: "" }),
}));

// ✅ Component chỉ re-render KHI searchQuery đổi, các thay đổi khác bị bỏ qua
export function SearchInputBar() {
  const query = useIdentityFilterStore((s) => s.searchQuery);
  const setQuery = useIdentityFilterStore((s) => s.setSearchQuery);
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`,
          },
        },
      },
      {
        id: "multi-tenant-isolation-keys",
        categoryId: "state-management",
        filename: "02-multi-tenant-cache-isolation.ts",
        title: "Chiến lược chống rò rỉ dữ liệu chéo (Cross-Tenant Leakage) với TanStack Query trong SaaS B2B?",
        difficulty: "Medium",
        estimatedTime: "10 mins",
        tags: ["TanStack Query", "Security", "Multi-Tenant", "Fintech"],
        situation:
          "Tại DynaTax AI, kiểm toán viên thường xuyên chuyển đổi giữa hàng chục công ty khách hàng (Tenant) khác nhau. Nếu dùng cache key toàn cục (ví dụ: `['ledger']`), dữ liệu tài chính nhạy cảm của Tenant A có thể bị hiển thị sang Tenant B trước khi kịp refetch.",
        task:
          "Xây dựng cơ chế cô lập cache cứng ở tầng client sao cho rò rỉ dữ liệu chéo là điều bất khả thi ở cấp độ compile-time.",
        actions: [
          "Xây dựng Query Key Factory ép buộc mọi cache key đều phải bắt đầu bằng namespace `['tenant', orgId, clientId, ...domainKey]`.",
          "Tạo Custom Hook `<TenantBoundary>` kiểm tra context bắt buộc; ném lỗi biên dịch/runtime nếu query không truyền đủ thông tin tenant.",
          "Khi người dùng chuyển đổi Org/Tenant trong OrgSwitcher, kích hoạt hàm `queryClient.removeQueries({ queryKey: ['tenant', prevOrgId] })` để xóa vĩnh viễn dữ liệu cũ khỏi bộ nhớ thay vì chỉ invalidate.",
        ],
        result: {
          metrics: ["0 sự cố rò rỉ dữ liệu (Zero Leakage)", "100% type-safe trên hơn 200 custom hooks", "Tốc độ switch org < 100ms"],
          summary: "Loại bỏ hoàn toàn rủi ro bảo mật dữ liệu tài chính mà vẫn tận dụng được sức mạnh caching của TanStack Query.",
        },
        artifact: {
          type: "code",
          title: "Type-Safe Tenant Key Factory & Boundary",
          description: "Factory quản lý key cô lập dữ liệu theo tổ chức",
          code: {
            language: "typescript",
            filename: "lib/api/queryKeyFactory.ts",
            content: `export interface TenantContext {
  orgId: string;
  clientId: string;
}

export const tenantQueryKeys = {
  root: (ctx: TenantContext) => ["tenant", ctx.orgId, ctx.clientId] as const,
  taxReturns: (ctx: TenantContext) => [...tenantQueryKeys.root(ctx), "returns"] as const,
  returnDetail: (ctx: TenantContext, returnId: string) =>
    [...tenantQueryKeys.taxReturns(ctx), returnId] as const,
};

// Custom Hook an toàn tuyệt đối
export function useTaxReturnDetail(ctx: TenantContext, returnId: string) {
  if (!ctx.orgId || !ctx.clientId) throw new Error("Tenant Context Required!");

  return useQuery({
    queryKey: tenantQueryKeys.returnDetail(ctx, returnId),
    queryFn: () => bffClient.getTaxReturn(ctx, returnId),
    staleTime: 60_000,
  });
}`,
          },
        },
      },
      {
        id: "hybrid-data-orchestration",
        categoryId: "state-management",
        filename: "03-hybrid-apollo-zustand.ts",
        title: "Thiết kế Hybrid Data Architecture kết hợp GraphQL (Apollo), REST và WebSockets/Zustand?",
        difficulty: "Hard",
        estimatedTime: "12 mins",
        tags: ["Architecture", "Apollo", "Zustand", "WebSockets"],
        situation:
          "Hệ thống kiểm soát ra vào ICT CMC Global vừa phải đồng bộ dữ liệu định danh nhân viên định kỳ từ .NET GraphQL backend, vừa phải nhận telemetry stream tần số cao (30 FPS) từ camera nhận diện khuôn mặt ngoại vi.",
        task:
          "Thiết kế kiến trúc dữ liệu lai tách biệt luồng dữ liệu tĩnh/bán tĩnh với luồng dữ liệu thời gian thực tần số cao để tránh nghẽn luồng xử lý của React.",
        actions: [
          "Phân tầng dữ liệu: Tầng Remote Identity dùng Apollo Client Cache với normalized entities, tối ưu query và mutation.",
          "Tầng Hardware Telemetry: Nhận qua WebSocket stream, cập nhật thẳng vào Zustand Store nằm ngoài React Lifecycle.",
          "Thành phần UI chỉ kết nối với Zustand qua selector ngưỡng (threshold bucket): Chỉ khi độ chính xác camera vượt ngưỡng tin cậy (VD: >95%) thì component mới nhận thông báo render.",
        ],
        result: {
          metrics: ["FPS ổn định ở mức 60 FPS", "CPU utilization của trình duyệt giảm 45%", "0 hiện tượng tràn bộ nhớ (Memory Leak)"],
          summary: "Tách bạch triệt để trách nhiệm giữa server state và high-frequency hardware state.",
        },
        artifact: {
          type: "mindmap",
          title: "Hybrid Data Layer Architecture Flow",
          description: "Sơ đồ luồng phân tầng dữ liệu giữa GraphQL và High-Frequency Telemetry",
          mindmap: {
            label: "Hybrid Data Engine",
            detail: "Separation of Concerns for High-Performance UI",
            children: [
              {
                label: "Remote Domain Layer",
                detail: "Apollo Client + GraphQL",
                children: [
                  { label: "Normalized Cache", detail: "Cache-First for Employee Profiles" },
                  { label: "RBAC Credentials", detail: "Credential Start/Expiry Lifecycles" },
                ],
              },
              {
                label: "Hardware Telemetry Layer",
                detail: "High-Frequency (30 FPS)",
                children: [
                  { label: "Native Camera Capture", detail: "WebSockets / WebRTC Stream" },
                  { label: "Zustand Store", detail: "Atomic Selectors Outside React DOM" },
                  { label: "Threshold Guard", detail: "Emit render only when confidence > 95%" },
                ],
              },
            ],
          },
        },
      },
    ],
  },
  {
    id: "performance-virtualization",
    folderName: "03-performance-virtualization",
    title: "Performance & Virtualization",
    iconType: "perf",
    description: "TanStack Virtual, 10k Records @ 60 FPS, Dynamic Code Splitting, Bundle Budgets",
    questions: [
      {
        id: "bundle-splitting-rules",
        categoryId: "performance-virtualization",
        filename: "01-code-splitting-tactics.ts",
        title: "Quy tắc thiết lập Dynamic Code Splitting để giảm 45% Initial Bundle trong ứng dụng lớn?",
        difficulty: "Easy",
        estimatedTime: "5 mins",
        tags: ["Webpack", "Vite", "Bundle Size"],
        situation:
          "Ứng dụng quản trị tài chính tại DynaTax AI ban đầu tải file main JS lên tới 1.8MB, dẫn đến thời gian tải trang ở mạng 4G/di động mất hơn 4 giây.",
        task:
          "Phân tích bundle và chia nhỏ gói mã nguồn (code-splitting) sao cho initial chunk chỉ tải đúng những gì cần thiết cho First Contentful Paint.",
        actions: [
          "Dùng `@next/bundle-analyzer` để xác định các thư viện đồ sộ: PDF viewer, charting engine (Recharts), bảng tính tính thuế.",
          "Áp dụng `next/dynamic` kết hợp component level splitting cho toàn bộ modal, drawer và document viewer.",
          "Cấu hình Vite manualChunks tách riêng vendor libraries ít thay đổi (`react`, `react-dom`, `tanstack`) vào cache dài hạn của trình duyệt.",
        ],
        result: {
          metrics: ["Initial JS từ 1.8MB -> 720kB (-45%)", "First Load JS < 150kB", "LCP cải thiện từ 4.0s -> 1.8s"],
          summary: "Tối ưu dung lượng tải ban đầu, tăng điểm Core Web Vitals trên mọi thiết bị.",
        },
        artifact: {
          type: "code",
          title: "Route & Component-Level Code Splitting",
          description: "Tách gói tài nguyên thông minh với next/dynamic",
          code: {
            language: "typescript",
            filename: "components/TaxReportViewer.tsx",
            content: `import dynamic from "next/dynamic";
import { SkeletonLoader } from "@/components/ui/Skeleton";

// 🚀 Dynamic import chỉ tải file khi người dùng thực sự mở viewer
const HeavyPdfViewer = dynamic(
  () => import("@/components/viewers/HeavyPdfViewer").then((m) => m.HeavyPdfViewer),
  {
    loading: () => <SkeletonLoader className="h-[600px] w-full" />,
    ssr: false, // Tắt SSR đối với thư viện can thiệp trực tiếp canvas/DOM
  }
);

export function TaxReportSection({ shouldOpen }: { shouldOpen: boolean }) {
  if (!shouldOpen) return null;
  return <HeavyPdfViewer documentUrl="/api/v1/tax-export.pdf" />;
}`,
          },
        },
      },
      {
        id: "virtualize-10k-financial-tree",
        categoryId: "performance-virtualization",
        filename: "02-virtualize-10k-nodes.tsx",
        title: "Cách render cây dữ liệu tài chính 10,000+ bản ghi ở 60 FPS không nghẽn Main Thread?",
        difficulty: "Medium",
        estimatedTime: "9 mins",
        tags: ["Virtualization", "TanStack Virtual", "60 FPS"],
        situation:
          "Báo cáo tài chính chi tiết tại DynaTax AI chứa cấu trúc cây cha-con nhiều tầng lồng nhau với hơn 10.000 dòng. Nếu render toàn bộ DOM cùng lúc, trình duyệt bị đóng băng (Frame drop xuống 4 FPS) mất hơn 3 giây để scroll.",
        task:
          "Triển khai kỹ thuật DOM Virtualization (Windowing) cho dữ liệu cây phân cấp với độ cao dòng động mà vẫn giữ nguyên trải nghiệm cuộn mượt mà.",
        actions: [
          "Làm phẳng (flatten) cây dữ liệu phân cấp thành một mảng 1 chiều có gắn metadata `depth`, `isExpanded`, `parentId`.",
          "Tích hợp `@tanstack/react-virtual` với dynamic measurement (`measureElement`) để tự động đo đạc độ cao thực tế của từng hàng.",
          "Chỉ gắn vào DOM khoảng 35 node nằm trong viewport hiển thị kèm 5 node overscan bên trên và bên dưới.",
          "Áp dụng CSS `transform: translateY(...)` thay vì thay đổi thuộc tính `top` để việc di chuyển node được xử lý trực tiếp trên GPU compositor thread.",
        ],
        result: {
          metrics: ["Khóa chặt 60.0 FPS khi scroll nhanh", "Chỉ render tối đa 40 DOM nodes cùng lúc", "Bộ nhớ DOM giảm 85%"],
          summary: "Biến một danh sách 10.000 dòng nặng nề thành một khung nhìn siêu nhẹ không tốn tài nguyên máy tính.",
        },
        artifact: {
          type: "code",
          title: "Flattened Tree Virtualization Implementation",
          description: "Mẫu code render cây tài chính ảo hóa siêu tốc",
          code: {
            language: "tsx",
            filename: "components/VirtualizedFinancialTree.tsx",
            content: `import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export function VirtualizedFinancialTree({ flatNodes }: { flatNodes: FlatTreeNode[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // Ước lượng chiều cao mỗi dòng 44px
    overscan: 5,            // Render trước 5 phần tử trên/dưới tránh giật mép
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto border border-line">
      <div
        className="relative w-full"
        style={{ height: \`\${rowVirtualizer.getTotalSize()}px\` }}
      >
        {rowVirtualizer.getVirtualItems().map((item) => {
          const node = flatNodes[item.index];
          return (
            <div
              key={node.id}
              ref={rowVirtualizer.measureElement}
              data-index={item.index}
              className="absolute left-0 top-0 w-full flex items-center px-4"
              style={{
                transform: \`translateY(\${item.start}px)\`,
                paddingLeft: \`\${node.depth * 20 + 16}px\`,
              }}
            >
              <span>{node.title}</span>
              <span className="ml-auto font-mono">{node.amount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
          },
        },
      },
      {
        id: "web-worker-tax-computation",
        categoryId: "performance-virtualization",
        filename: "03-off-thread-web-workers.ts",
        title: "Tối ưu Main-thread budget: Chuyển tác vụ tính toán thuế nặng sang Web Workers & Comlink?",
        difficulty: "Hard",
        estimatedTime: "12 mins",
        tags: ["Web Workers", "Comlink", "Performance Budget"],
        situation:
          "Mỗi khi người dùng điều chỉnh tỷ lệ khấu trừ thuế, thuật toán phải tính toán lại hàng nghìn chỉ số liên kết theo bảng luật thuế liên bang Hoa Kỳ, gây đơ chuột (Long Task kéo dài 450ms).",
        task:
          "Giải phóng Main Thread bằng cách đưa toàn bộ logic tính toán tài chính nặng sang Web Worker, giao tiếp bất đồng bộ qua RPC.",
        actions: [
          "Sử dụng thư viện `comlink` để trừu tượng hóa giao tiếp `postMessage` phức tạp thành các lời gọi hàm TypeScript có type-safety đầy đủ.",
          "Gửi mảng dữ liệu qua SharedArrayBuffer hoặc structured clone mà không gây block UI.",
          "Áp dụng cơ chế debounce và AbortController để hủy bỏ các phép tính dở dang nếu người dùng tiếp tục nhập số mới.",
        ],
        result: {
          metrics: ["Long Tasks trên Main Thread = 0ms", "Total Blocking Time (TBT) < 50ms", "Người dùng tiếp tục tương tác bình thường trong lúc tính toán"],
          summary: "Tách rời hoàn toàn logic tính toán tài chính nặng khỏi luồng vẽ giao diện.",
        },
        artifact: {
          type: "code",
          title: "Web Worker Computation with Comlink",
          description: "Tính toán ngoài luồng UI giữ vững độ mượt của trình duyệt",
          code: {
            language: "typescript",
            filename: "workers/taxCalculation.worker.ts",
            content: `import * as Comlink from "comlink";

export const taxCalculatorApi = {
  computeAggregateDeductions(records: FinancialRecord[]) {
    // Thuật toán tính toán nặng tốn ~300ms CPU
    let total = 0;
    for (let i = 0; i < records.length; i++) {
      total += complexDepreciationFormula(records[i]);
    }
    return total;
  },
};

Comlink.expose(taxCalculatorApi);

// Tại React Component:
// const worker = new Worker(new URL('./taxCalculation.worker.ts', import.meta.url));
// const api = Comlink.wrap<typeof taxCalculatorApi>(worker);
// const result = await api.computeAggregateDeductions(data);`,
          },
        },
      },
    ],
  },
  {
    id: "engineering-leadership",
    folderName: "04-engineering-leadership",
    title: "Architecture & Leadership",
    iconType: "lead",
    description: "Squad Leadership (5 devs), CI/CD Gates, Vitest, Playwright, RFC Process, Zero Regressions",
    questions: [
      {
        id: "rfc-culture-architecture",
        categoryId: "engineering-leadership",
        filename: "01-rfc-decision-process.md",
        title: "Quy trình thiết kế kiến trúc theo văn hóa RFC (Request for Comments) trước khi code?",
        difficulty: "Easy",
        estimatedTime: "6 mins",
        tags: ["Leadership", "RFC", "Architecture Standards"],
        situation:
          "Khi bắt đầu dự án nền tảng định danh ICT Access Control với backend .NET và phần cứng ngoại vi, các kỹ sư thường tự ý code mà không thống nhất cấu trúc contract, gây xung đột mã nguồn và đập đi xây lại nhiều lần.",
        task:
          "Xây dựng văn hóa RFC nhẹ nhàng (Lightweight RFC) để toàn bộ squad và các bên liên quan (Backend, QA, Hardware) phản biện kỹ thuật trước khi gõ dòng code đầu tiên.",
        actions: [
          "Soạn thảo template RFC chuẩn gồm 5 phần: Bối cảnh vấn đề, Các phương án kiến trúc, Phân tích Trade-offs (Được & Mất), Kế hoạch Rollback rủi ro, và Kế hoạch kiểm thử.",
          "Tổ chức buổi phản biện kỹ thuật async kéo dài 48h trên Pull Request/Notion để toàn team đặt câu hỏi và phản biện các edge cases.",
          "Chỉ khi có đủ ít nhất 2 approvals từ Senior/Lead và Product Manager thì tài liệu mới được chốt thành Architecture Decision Record (ADR).",
        ],
        result: {
          metrics: ["Giảm 70% trường hợp sửa đổi kiến trúc giữa chừng", "Thời gian estimate tính năng chính xác hơn 30%", "Mọi quyết định đều có lịch sử lưu vết rõ ràng"],
          summary: "Biến việc ra quyết định kỹ thuật từ ý kiến cá nhân thành tài sản trí tuệ chung của toàn đội ngũ.",
        },
        artifact: {
          type: "mindmap",
          title: "RFC Lifecycle Flow",
          description: "Quy trình từ ý tưởng kiến trúc tới bàn giao sản xuất",
          mindmap: {
            label: "RFC Lifecycle",
            detail: "Zero Surprises Architecture Process",
            children: [
              {
                label: "1. Problem Framing",
                detail: "Define Constraints & Business Impact",
                children: [
                  { label: "Metrics Target", detail: "e.g. LCP < 1.8s" },
                  { label: "Non-Goals", detail: "What we explicitly will NOT build" },
                ],
              },
              {
                label: "2. Technical Review",
                detail: "48h Async Peer Review",
                children: [
                  { label: "Trade-offs Analysis", detail: "Option A vs Option B" },
                  { label: "Failure Modes", detail: "Fallback & Rollback strategy" },
                ],
              },
              {
                label: "3. Execution Gate",
                detail: "ADR Stored in Git Repo",
                children: [
                  { label: "API Contracts", detail: "TypeScript interfaces shared with .NET team" },
                  { label: "Test Plan Sign-off", detail: "Unit + E2E Acceptance criteria" },
                ],
              },
            ],
          },
        },
      },
      {
        id: "zero-regression-cicd-pipeline",
        categoryId: "engineering-leadership",
        filename: "02-zero-regression-pipeline.yaml",
        title: "Thiết lập hệ thống kiểm thử tự động Vitest + Playwright trên Azure DevOps giảm 35% PR cycle?",
        difficulty: "Medium",
        estimatedTime: "9 mins",
        tags: ["CI/CD", "Vitest", "Playwright", "Azure DevOps"],
        situation:
          "Team 5 kỹ sư tại CMC Global mất quá nhiều thời gian review thủ công từng màn hình. Một số lỗi hồi quy (regression) liên quan đến quyền truy cập RBAC vẫn bị lọt vào môi trường Staging.",
        task:
          "Xây dựng pipeline CI/CD tự động hóa toàn bộ việc kiểm thử chất lượng code trên Azure DevOps với tiêu chí 0 lỗi lọt vào production.",
        actions: [
          "Pre-commit gate (Husky + lint-staged): Bắt buộc kiểm tra TypeScript type check và ESLint format trước khi push code.",
          "Unit & Integration Suite (Vitest + RTL): Chạy song song hơn 300 test cases trong vòng dưới 20 giây nhờ tốc độ của Vite runner.",
          "E2E Smoke Gate (Playwright headless): Tự động dựng môi trường preview và chạy kịch bản luồng đăng nhập, cấp phát quyền, quét camera thẻ ra vào.",
          "Quy tắc Branch Protection: PR chỉ được merge khi 100% test pass và đạt test coverage tối thiểu 75%.",
        ],
        result: {
          metrics: ["0 lỗi hồi quy (Zero Regression Escapes)", "Thời gian duyệt PR giảm 35%", "Test suite chạy hoàn tất trong 3 phút trên Azure Pipelines"],
          summary: "Chất lượng phần mềm được bảo vệ bằng hệ thống tự động thay vì dựa vào trí nhớ của con người.",
        },
        artifact: {
          type: "code",
          title: "Azure DevOps Automated Quality Pipeline",
          description: "Cấu hình pipeline tự động hóa kiểm thử đa tầng",
          code: {
            language: "yaml",
            filename: "azure-pipelines.yml",
            content: `trigger:
  branches:
    include: [main, release/*]

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: QualityGates
    displayName: 'Automated Code Verification'
    jobs:
      - job: StaticAndUnit
        displayName: 'Lint, Types & Vitest'
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: '20.x' }
          - script: npm ci
          - script: npm run lint
            displayName: 'ESLint Gate'
          - script: npx tsc --noEmit
            displayName: 'TypeCheck Gate'
          - script: npm run test:coverage
            displayName: 'Vitest Unit Suites (>80%)'

      - job: PlaywrightE2E
        displayName: 'Headless E2E Smoke Tests'
        dependsOn: StaticAndUnit
        steps:
          - script: npx playwright install --with-deps
          - script: npx playwright test --project=chromium
            displayName: 'Critical RBAC Journeys'`,
          },
        },
      },
      {
        id: "mentoring-squad-delivery",
        categoryId: "engineering-leadership",
        filename: "03-squad-velocity-mentorship.md",
        title: "Phương pháp dẫn dắt squad 5 kỹ sư, đào tạo junior và duy trì velocity ổn định trong kỳ release nước rút?",
        difficulty: "Hard",
        estimatedTime: "12 mins",
        tags: ["Squad Lead", "Mentorship", "Agile", "Velocity"],
        situation:
          "Trong giai đoạn bàn giao module lõi Identity Platform cho CMC Global, squad gồm 1 Senior, 2 Mid-level và 2 Junior gặp tình trạng tồn đọng công việc (bottleneck) ở các task tích hợp phần cứng và bảo mật phức tạp.",
        task:
          "Tái cấu trúc quy trình phân chia công việc, kèm cặp (mentorship) để nâng cao năng lực cho các bạn junior, đảm bảo bàn giao đúng tiến độ cam kết với khách hàng.",
        actions: [
          "Áp dụng phương pháp Pair Programming theo cặp (Senior kèm Junior) trong 2 ngày đầu của mỗi module mới để thống nhất pattern.",
          "Chia nhỏ User Story thành các sub-task kỹ thuật độc lập với Definition of Done (DoD) rõ ràng: Type definition -> UI Component -> Integration -> Test case.",
          "Tổ chức phiên 'Engineering Office Hours' 30 phút mỗi ngày để gỡ các vướng mắc (blockers) kỹ thuật ngay lập tức, tránh để dev tự bế tắc quá 2 tiếng.",
          "Tạo bộ UI Component Kit mẫu và hướng dẫn viết Custom Hooks chuẩn mực của dự án trong tài liệu nội bộ.",
        ],
        result: {
          metrics: ["Bàn giao toàn bộ module đúng hạn 100%", "2 bạn junior tự chủ hoàn toàn các module tiếp theo", "Squad velocity tăng 25% sau 2 sprints"],
          summary: "Xây dựng đội ngũ tự tin, hiểu sâu kiến trúc và có khả năng độc lập giải quyết bài toán phức tạp.",
        },
        artifact: {
          type: "mindmap",
          title: "Squad Leadership Framework",
          description: "Mô hình kèm cặp và tối ưu tốc độ phân phối dự án",
          mindmap: {
            label: "High-Velocity Squad Engine",
            detail: "Empowering Engineers & Delivery Reliability",
            children: [
              {
                label: "Skill Uplift (Mentorship)",
                detail: "Pair Programming & Office Hours",
                children: [
                  { label: "Pattern Modeling", detail: "Senior writes standard scaffold" },
                  { label: "Code Review Rituals", detail: "Focus on Architecture & Safety" },
                ],
              },
              {
                label: "Execution Discipline",
                detail: "Continuous Integration & DoD",
                children: [
                  { label: "Micro-Tasks", detail: "Task size < 1 day of development" },
                  { label: "Blocker Triage", detail: "Escalate within 2 hours maximum" },
                ],
              },
            ],
          },
        },
      },
    ],
  },
  {
    id: "mobile-react-native",
    folderName: "05-mobile-react-native",
    title: "Mobile (React Native)",
    iconType: "mobile",
    description: "TurboModules, Bridge, Goong Maps 60 FPS, Offline-First Sync, iOS & Android parity",
    questions: [
      {
        id: "rn-offline-first-retry",
        categoryId: "mobile-react-native",
        filename: "01-offline-first-queue.ts",
        title: "Thiết kế kiến trúc Offline-First và Queue-based retry trên React Native khi mất sóng mạng?",
        difficulty: "Easy",
        estimatedTime: "5 mins",
        tags: ["React Native", "Offline-First", "MMKV"],
        situation:
          "Trong ứng dụng logistics đa dịch vụ tại CMC Global, tài xế giao hàng thường xuyên di chuyển vào tầng hầm hoặc khu vực sóng di động chập chờn khi cập nhật trạng thái đơn hàng.",
        task:
          "Xây dựng cơ chế lưu trữ cục bộ và hàng đợi đồng bộ tự động gửi lại dữ liệu khi có mạng mà không làm mất trạng thái của shipper.",
        actions: [
          "Sử dụng MMKV (thay thế AsyncStorage chậm chạp) để lưu trữ tức thời hành động của tài xế vào bảng hàng đợi (Action Queue).",
          "Lắng nghe sự kiện kết nối mạng bằng `@react-native-community/netinfo`.",
          "Khi mạng phục hồi, Worker ngầm sẽ duyệt hàng đợi tuần tự (FIFO) với thuật toán Exponential Backoff để gửi lại các gói tin lên server.",
        ],
        result: {
          metrics: ["100% đơn hàng không bị mất trạng thái", "Tốc độ đọc ghi offline < 2ms với MMKV", "Trải nghiệm mượt mà không bị treo app"],
          summary: "Tài xế thao tác liên tục không bị gián đoạn dù mạng yếu hay mất kết nối hoàn toàn.",
        },
        artifact: {
          type: "code",
          title: "Offline Sync Queue Manager",
          description: "Hàng đợi lưu trữ và đẩy bù dữ liệu khi mạng hoạt động lại",
          code: {
            language: "typescript",
            filename: "services/offlineQueue.ts",
            content: `import { MMKV } from "react-native-mmkv";
import NetInfo from "@react-native-community/netinfo";

const storage = new MMKV();

export class OfflineQueueService {
  static enqueueAction(action: { type: string; payload: unknown }) {
    const queue = JSON.parse(storage.getString("offline_queue") || "[]");
    queue.push({ ...action, timestamp: Date.now() });
    storage.set("offline_queue", JSON.stringify(queue));
  }

  static async flushQueue() {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;

    const queue: any[] = JSON.parse(storage.getString("offline_queue") || "[]");
    if (!queue.length) return;

    while (queue.length > 0) {
      const item = queue[0];
      try {
        await apiClient.post("/api/sync", item);
        queue.shift(); // Xóa khỏi hàng đợi khi gửi thành công
        storage.set("offline_queue", JSON.stringify(queue));
      } catch (err) {
        break; // Tạm dừng nếu gặp lỗi kết nối
      }
    }
  }
}`,
          },
        },
      },
      {
        id: "rn-goong-maps-concurrency",
        categoryId: "mobile-react-native",
        filename: "02-goong-maps-60fps.tsx",
        title: "Tối ưu hóa JS Thread và UI Native Thread để render GPS tracking bản đồ mượt mà ở 60 FPS?",
        difficulty: "Medium",
        estimatedTime: "9 mins",
        tags: ["React Native", "Goong Maps", "GPS", "60 FPS"],
        situation:
          "Trong ứng dụng vận tải của CMC Global, xe di chuyển gửi vị trí GPS liên tục 2 lần mỗi giây. Việc setState tọa độ liên tục trên React Native JS Thread gây drop FPS nghiêm trọng (xuống ~20 FPS) và làm đơ bản đồ.",
        task:
          "Tách biệt luồng xử lý tọa độ vị trí ra khỏi React State và can thiệp trực tiếp vào Native UI Thread để biểu tượng xe di chuyển mượt mà.",
        actions: [
          "Sử dụng React Native Reanimated v3 để cập nhật tọa độ Marker trực tiếp trên luồng Native (UI Thread) thông qua Animated Value.",
          "Áp dụng thuật toán Spherical Linear Interpolation (SLERP) để nội suy mượt mà vị trí xe giữa 2 điểm GPS cách nhau 500ms thay vì nhảy cóc.",
          "Hạn chế tối đa việc re-render các component React xung quanh bản đồ bằng cách đóng gói Marker thành standalone native view.",
        ],
        result: {
          metrics: ["Bản đồ cuộn và xe chạy ổn định 60.0 FPS", "JS Thread Utilization giảm từ 85% xuống <15%", "Tiết kiệm 30% pin cho thiết bị"],
          summary: "Tạo chuyển động mượt mà cho xe chạy theo thời gian thực trên bản đồ vệ tinh.",
        },
        artifact: {
          type: "code",
          title: "Native Thread Marker Interpolation",
          description: "Nội suy vị trí xe mượt mà trên UI thread của React Native",
          code: {
            language: "tsx",
            filename: "components/AnimatedVehicleMarker.tsx",
            content: `import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

export function AnimatedVehicleMarker({ nextCoords }: { nextCoords: { latitude: number; longitude: number } }) {
  const lat = useSharedValue(nextCoords.latitude);
  const lng = useSharedValue(nextCoords.longitude);

  useEffect(() => {
    // 🚗 Chạy trực tiếp trên Native Thread qua withTiming (500ms duration)
    lat.value = withTiming(nextCoords.latitude, { duration: 500 });
    lng.value = withTiming(nextCoords.longitude, { duration: 500 });
  }, [nextCoords]);

  // Marker can thiệp trực tiếp không trigger render JS
  return <NativeMarkerBridge lat={lat} lng={lng} icon="car-marker" />;
}`,
          },
        },
      },
    ],
  },
  {
    id: "backend-bff-node",
    folderName: "06-backend-bff-node",
    title: "Backend & BFF (Node.js)",
    iconType: "backend",
    description: "Node.js Gateway, Redis Cache (TTL 60s–900s), Pusher WebSockets, Stripe Payments",
    questions: [
      {
        id: "redis-ttl-caching-strategy",
        categoryId: "backend-bff-node",
        filename: "01-redis-adaptive-ttl.ts",
        title: "Chiến lược phân tầng Redis Caching với TTL động (60s–900s) cho API Gateway?",
        difficulty: "Easy",
        estimatedTime: "5 mins",
        tags: ["Node.js", "Redis", "BFF", "Caching"],
        situation:
          "Hàng nghìn người dùng truy cập kiểm tra báo cáo thuế tại DynaTax AI vào kỳ quyết toán thuế, khiến cơ sở dữ liệu chính bị quá tải hàng nghìn truy vấn trùng lặp.",
        task:
          "Xây dựng tầng đệm Redis Caching trên Node.js BFF với cơ chế TTL thích ứng tùy theo mức độ biến động của dữ liệu.",
        actions: [
          "Phân loại dữ liệu: Báo cáo thuế đã chốt (Imutable) đặt TTL cao 900 giây (15 phút).",
          "Dữ liệu bảng tính đang soạn thảo đặt TTL ngắn 60 giây kết hợp cơ chế Cache-Aside (Lazy Loading).",
          "Chủ động xóa cache (Invalidation) ngay khi người dùng thực hiện thao tác POST/PUT/DELETE trên tài liệu tương ứng.",
        ],
        result: {
          metrics: ["Database Query Load giảm 75%", "API Latency p95 giảm từ 680ms xuống 45ms", "Tiết kiệm 40% chi phí hạ tầng máy chủ"],
          summary: "Tăng cường khả năng chịu tải hàng nghìn CCU mà không cần nâng cấp database phần cứng.",
        },
        artifact: {
          type: "code",
          title: "Adaptive Redis Cache-Aside Middleware",
          description: "Middleware tự động cache và xóa cache theo domain event",
          code: {
            language: "typescript",
            filename: "bff/middleware/redisCache.ts",
            content: `export function adaptiveCache(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const cacheKey = \`bff:\${req.tenant.orgId}:\${req.originalUrl}\`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      res.setHeader("X-Cache-Status", "HIT");
      return res.json(JSON.parse(cachedData));
    }

    res.setHeader("X-Cache-Status", "MISS");
    // Intercept response để lưu cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redisClient.setex(cacheKey, ttlSeconds, JSON.stringify(body));
      return originalJson(body);
    };
    next();
  };
}`,
          },
        },
      },
      {
        id: "pusher-realtime-events",
        categoryId: "backend-bff-node",
        filename: "02-websocket-realtime-sync.ts",
        title: "Thay thế HTTP Polling cũ bằng kiến trúc Event-Driven qua Pusher WebSockets?",
        difficulty: "Medium",
        estimatedTime: "8 mins",
        tags: ["WebSockets", "Pusher", "Event-Driven", "Real-Time"],
        situation:
          "Trước đây DynaTax AI sử dụng HTTP Polling cứ 5 giây gửi 1 request để kiểm tra tiến độ xuất file PDF và trạng thái nộp thuế. Điều này tạo ra hàng triệu request rác mỗi ngày làm chậm server.",
        task:
          "Thay thế polling bằng kiến trúc hướng sự kiện thời gian thực (Event-Driven) dùng Pusher WebSockets và Redis Pub/Sub.",
        actions: [
          "Khi Background Worker hoàn thành việc tính thuế, phát ra một event lên kênh Redis channel nội bộ.",
          "Node.js API Gateway lắng nghe Redis và đẩy message đến đúng kênh riêng tư `private-org-{orgId}` của khách hàng qua Pusher.",
          "Client nhận event và cập nhật trực tiếp vào TanStack Query cache mà không cần reload trang.",
        ],
        result: {
          metrics: ["Giảm 92% số lượng request HTTP rác", "Cập nhật trạng thái tức thì < 200ms", "Hỗ trợ cộng tác nhiều người cùng xem 1 hồ sơ"],
          summary: "Trải nghiệm cập nhật thời gian thực tức thì với chi phí băng thông cực kỳ thấp.",
        },
        artifact: {
          type: "code",
          title: "Event-Driven Realtime Dispatcher",
          description: "Phát sự kiện từ Background Worker tới Client qua WebSocket",
          code: {
            language: "typescript",
            filename: "services/eventDispatcher.ts",
            content: `import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "ap1",
  useTLS: true,
});

export async function notifyFilingStatusChange(orgId: string, filingId: string, status: string) {
  const channel = \`private-org-\${orgId}\`;
  
  await pusher.trigger(channel, "filing:updated", {
    filingId,
    status,
    timestamp: new Date().toISOString(),
  });
}`,
          },
        },
      },
    ],
  },
];
