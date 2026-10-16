export interface RefactorSample {
  id: string;
  title: string;
  file: string;
  project: string;
  summary: string;
  before: string;
  after: string;
}

export const refactors: RefactorSample[] = [
  {
    id: "tenant-keys",
    title: "Tenant-scoped query keys",
    file: "hooks/useClientLedger.ts",
    project: "DynaTax AI",
    summary:
      "Global cache keys let one firm's ledger hydrate another's view after an org switch. A typed key factory makes the tenant part of every key — leakage becomes a compile error.",
    before: `// ❌ Global key — cache survives org switches
export function useClientLedger(clientId: string) {
  return useQuery({
    queryKey: ["ledger", clientId],
    queryFn: () => api.get(\`/ledger/\${clientId}\`),
    staleTime: Infinity,
  });
}

// somewhere in OrgSwitcher.tsx
queryClient.invalidateQueries(); // nuke everything 🙃`,
    after: `// ✅ Tenant is structurally part of every key
export const ledgerKeys = {
  all: (t: TenantScope) => ["tenant", t.orgId, "ledger"] as const,
  client: (t: TenantScope, clientId: ClientId) =>
    [...ledgerKeys.all(t), clientId] as const,
};

export function useClientLedger(clientId: ClientId) {
  const tenant = useTenantScope(); // throws outside <TenantBoundary>
  return useQuery({
    queryKey: ledgerKeys.client(tenant, clientId),
    queryFn: ({ signal }) => bff.ledger.get(tenant, clientId, { signal }),
    staleTime: 60_000,
  });
}

// OrgSwitcher.tsx — surgical, scoped invalidation
queryClient.removeQueries({ queryKey: ["tenant", prevOrgId] });`,
  },
  {
    id: "telemetry",
    title: "Telemetry off the render path",
    file: "store/telemetry.ts",
    project: "ICT Identity",
    summary:
      "30Hz camera telemetry lived in React context, re-rendering the entire identity tree each frame. Moving it into a Zustand store with selectors confined updates to the two components that care.",
    before: `// ❌ Every frame re-renders every consumer
const TelemetryContext = createContext<Telemetry | null>(null);

export function TelemetryProvider({ children }: PropsWithChildren) {
  const [frame, setFrame] = useState<Telemetry | null>(null);
  useEffect(() => camera.onFrame(setFrame), []); // ~30 updates/s
  return (
    <TelemetryContext.Provider value={frame}>
      {children /* whole identity console */}
    </TelemetryContext.Provider>
  );
}`,
    after: `// ✅ External store + selectors = surgical updates
export const useTelemetry = create<TelemetryState>()((set) => ({
  frame: null,
  confidence: 0,
  push: (f) => set({ frame: f, confidence: f.score }),
}));

camera.onFrame(useTelemetry.getState().push); // outside React

// Only re-renders when confidence crosses a bucket
export function MatchBadge() {
  const level = useTelemetry((s) => bucket(s.confidence));
  return <Badge level={level} />;
}`,
  },
  {
    id: "realtime",
    title: "Polling → event stream",
    file: "realtime/useFilingStatus.ts",
    project: "DynaTax AI",
    summary:
      "5-second polling hammered the BFF and still felt stale. A Pusher subscription writes straight into the TanStack cache: zero polling traffic, sub-second status updates.",
    before: `// ❌ N clients × 12 req/min, still up to 5s stale
export function useFilingStatus(filingId: string) {
  const [status, setStatus] = useState<FilingStatus>();
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch(\`/api/filings/\${filingId}\`);
      setStatus((await res.json()).status);
    }, 5000);
    return () => clearInterval(id);
  }, [filingId]);
  return status;
}`,
    after: `// ✅ Push-based, cache is the single source of truth
export function useFilingStatus(filingId: FilingId) {
  const tenant = useTenantScope();
  const qc = useQueryClient();
  const key = filingKeys.detail(tenant, filingId);

  useEffect(() => {
    const ch = pusher.subscribe(\`private-org-\${tenant.orgId}\`);
    const onUpdate = (e: FilingEvent) =>
      e.filingId === filingId &&
      qc.setQueryData(key, (old) => ({ ...old, status: e.status }));
    ch.bind("filing.status", onUpdate);
    return () => ch.unbind("filing.status", onUpdate);
  }, [tenant.orgId, filingId]);

  return useQuery({ queryKey: key, queryFn: () => bff.filings.get(tenant, filingId) });
}`,
  },
];
