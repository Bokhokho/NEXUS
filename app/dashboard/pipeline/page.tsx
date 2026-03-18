"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Download, Loader2, Search, X } from "lucide-react";

// ---- Types ----
type SamOpp = {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  type?: string;
  typeOfSetAside?: string;
  typeOfSetAsideDescription?: string;
  naicsCode?: string;
  classificationCode?: string;
  responseDeadLine?: string;
  postedDate?: string;
  uiLink?: string;
  fullParentPathName?: string;
  department?: string;
  subTier?: string;
  office?: string;
  placeOfPerformance?: {
    city?: { name?: string };
    state?: { code?: string };
  };
  pointOfContact?: Array<{
    type?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  }>;
};

type Bid = {
  id: number;
  prime: string;
  projectTitle: string;
  client: string;
  setAside: string;
  dueDate: string;
  dueDateISO: string;
  dueTime: string;
  dueTimeMA: string;
  location: string;
  samLink: string;
  poc: string;
  status: string;
  notes: string;
};

// ---- Constants ----
const NOTICE_OPTS = [
  { val: "o", label: "Solicitation" },
  { val: "p", label: "Presolicitation" },
  { val: "k", label: "Combined Synopsis" },
  { val: "r", label: "Sources Sought" },
  { val: "s", label: "Special Notice" },
  { val: "a", label: "Award Notice" },
  { val: "u", label: "Justification / J&A" },
];

const SETASIDE_OPTS = [
  { val: "SBA", label: "SBA — Total Small Business" },
  { val: "SBP", label: "SBP — Partial Small Business" },
  { val: "8A", label: "8A — 8(a) Set-Aside" },
  { val: "8AN", label: "8AN — 8(a) Sole Source" },
  { val: "HZC", label: "HZC — HUBZone Set-Aside" },
  { val: "HZS", label: "HZS — HUBZone Sole Source" },
  { val: "SDVOSBC", label: "SDVOSBC — SDVOSB Set-Aside" },
  { val: "SDVOSBS", label: "SDVOSBS — SDVOSB Sole Source" },
  { val: "WOSB", label: "WOSB — WOSB Set-Aside" },
  { val: "WOSBSS", label: "WOSBSS — WOSB Sole Source" },
  { val: "EDWOSB", label: "EDWOSB — EDWOSB Set-Aside" },
  { val: "EDWOSBSS", label: "EDWOSBSS — EDWOSB Sole Source" },
  { val: "VSA", label: "VSA — Veteran-Owned (VA)" },
  { val: "VSS", label: "VSS — Veteran Sole Source (VA)" },
  { val: "IEE", label: "IEE — Indian Economic Enterprise" },
  { val: "ISBEE", label: "ISBEE — Indian Small Business" },
  { val: "BICiv", label: "BICiv — Buy Indian (IHS)" },
];

const SETASIDE_SHORT: Record<string, string> = {
  SBA: "SBA", SBP: "SBP", "8A": "8(a)", "8AN": "8(a) SS",
  HZC: "HUBZone", HZS: "HUBZone SS", SDVOSBC: "SDVOSB", SDVOSBS: "SDVOSB SS",
  WOSB: "WOSB", WOSBSS: "WOSB SS", EDWOSB: "EDWOSB", EDWOSBSS: "EDWOSB SS",
  LAS: "Local Area", IEE: "IEE", ISBEE: "ISBEE", BICiv: "Buy Indian",
  VSA: "VOSB", VSS: "VOSB SS",
};

const SETASIDE_TO_BID: Record<string, string> = {
  SBA: "SB", SBP: "SB", "8A": "8(a)", "8AN": "8(a)",
  HZC: "SB", HZS: "SB", SDVOSBC: "SDVOSB", SDVOSBS: "SDVOSB",
  WOSB: "WOSB", WOSBSS: "WOSB", EDWOSB: "WOSB", EDWOSBSS: "WOSB",
  VSA: "VOSB", VSS: "VOSB", IEE: "INDIAN", ISBEE: "INDIAN", BICiv: "INDIAN",
};

const PAGE_SIZE = 50;

// ---- Helpers ----
function parseDeadline(str?: string) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(str?: string) {
  const d = parseDeadline(str);
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysLeft(str?: string) {
  const d = parseDeadline(str);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function oppToId(o: SamOpp) {
  return o.noticeId || o.solicitationNumber || "";
}

function oppToBid(o: SamOpp): Omit<Bid, "id"> {
  const dl = parseDeadline(o.responseDeadLine);
  const dueDate = dl
    ? dl.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const dueDateISO = dl ? dl.toISOString().slice(0, 10) : "";
  const dueTime = dl
    ? dl.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })
    : "";
  const dueTimeMA = dl
    ? new Date(dl.getTime() + 3600000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const loc = [o.placeOfPerformance?.city?.name, o.placeOfPerformance?.state?.code]
    .filter(Boolean)
    .join(", ");
  const saCode = (o.typeOfSetAside || "").toUpperCase();
  const samUrl =
    o.uiLink && o.uiLink !== "null" ? o.uiLink : `https://sam.gov/opp/${o.noticeId}/view`;
  const orgFull = o.fullParentPathName || o.department || "";
  const client = orgFull.split(".")[0]?.trim() || orgFull;
  const poc = Array.isArray(o.pointOfContact)
    ? o.pointOfContact.find((p) => p.type === "primary") || o.pointOfContact[0]
    : null;
  const pocStr = poc ? [poc.fullName, poc.email].filter(Boolean).join(" | ") : "";

  return {
    prime: "",
    projectTitle: o.title || "",
    client,
    setAside: SETASIDE_TO_BID[saCode] || "",
    dueDate,
    dueDateISO,
    dueTime,
    dueTimeMA,
    location: loc,
    samLink: samUrl,
    poc: pocStr,
    status: "",
    notes: "",
  };
}

function toApiDate(iso: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

// ---- Component ----
export default function PipelinePage() {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Fetch params
  const [apiKey, setApiKey] = useState("SAM-367a1b7a-3591-42ad-90bc-e3d858a06d2b");
  const [dateFrom, setDateFrom] = useState(yesterday);
  const [dateTo, setDateTo] = useState(today);
  const [titleKw, setTitleKw] = useState("");
  const [naics, setNaics] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [org, setOrg] = useState("");
  const [solnum, setSolnum] = useState("");
  const [ccode, setCcode] = useState("");
  const [rdlFrom, setRdlFrom] = useState("");
  const [rdlTo, setRdlTo] = useState("");
  const [checkedNotices, setCheckedNotices] = useState<Set<string>>(new Set());
  const [checkedSetAsides, setCheckedSetAsides] = useState<Set<string>>(new Set());

  // Results
  const [allOpps, setAllOpps] = useState<SamOpp[]>([]);
  const [samTotal, setSamTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [lastFetch, setLastFetch] = useState("");

  // Client filters
  const [quickKw, setQuickKw] = useState("");
  const [dueIn, setDueIn] = useState("");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Sort
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Import
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  async function fetchOpportunities() {
    if (!apiKey) { setFetchError("Please enter your SAM.gov API key."); return; }
    if (!dateFrom || !dateTo) { setFetchError("Posted From and To dates are required."); return; }

    setLoading(true);
    setFetchError("");
    setAllOpps([]);
    setSelected(new Set());
    setPage(1);

    const params = new URLSearchParams({
      api_key: apiKey,
      limit: "1000",
      offset: "0",
      postedFrom: toApiDate(dateFrom)!,
      postedTo: toApiDate(dateTo)!,
    });

    if (titleKw) params.set("title", titleKw);
    const notices = [...checkedNotices];
    if (notices.length >= 1) params.set("ptype", notices[0]);
    const setAsides = [...checkedSetAsides];
    if (setAsides.length >= 1) params.set("typeOfSetAside", setAsides[0]);
    if (naics) params.set("ncode", naics);
    if (ccode) params.set("ccode", ccode);
    if (stateCode) params.set("state", stateCode.toUpperCase());
    if (org) params.set("organizationName", org);
    if (solnum) params.set("solnum", solnum);
    if (rdlFrom) params.set("rdlfrom", toApiDate(rdlFrom)!);
    if (rdlTo) params.set("rdlto", toApiDate(rdlTo)!);

    try {
      const res = await fetch(`/api/sam?${params}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status} — ${j.error || "Unknown error"}`);
      }
      const data = await res.json();
      const opps: SamOpp[] = data.opportunitiesData || [];
      setAllOpps(opps);
      setSamTotal(data.totalRecords || 0);
      setLastFetch(`${new Date().toLocaleTimeString()} · ${opps.length} loaded`);
    } catch (e: any) {
      setFetchError(`Fetch failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let res = allOpps;

    if (quickKw) {
      const kw = quickKw.toLowerCase();
      res = res.filter((o) => (o.title || "").toLowerCase().includes(kw));
    }

    if (dueIn) {
      const days = parseInt(dueIn);
      const now = Date.now();
      res = res.filter((o) => {
        const dl = parseDeadline(o.responseDeadLine);
        if (!dl) return false;
        const d = (dl.getTime() - now) / 86400000;
        return d >= 0 && d <= days;
      });
    }

    // Multi-setaside client filter (API only accepts one)
    const saArr = [...checkedSetAsides];
    if (saArr.length > 1) {
      res = res.filter((o) => saArr.includes((o.typeOfSetAside || "").toUpperCase()));
    }

    // Multi-notice client filter (API only accepts one)
    const noticeArr = [...checkedNotices];
    if (noticeArr.length > 1) {
      const LABELS: Record<string, string> = {
        o: "Solicitation", p: "Presolicitation", k: "Combined Synopsis",
        r: "Sources Sought", s: "Special Notice", a: "Award Notice", u: "Justification",
      };
      res = res.filter((o) => {
        const t = o.type || "";
        const code = Object.entries(LABELS).find(([, v]) => v === t)?.[0] || t;
        return noticeArr.includes(code) || noticeArr.includes(t);
      });
    }

    return res;
  }, [allOpps, quickKw, dueIn, checkedSetAsides, checkedNotices]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortCol === "title") { va = a.title || ""; vb = b.title || ""; }
      else if (sortCol === "deadline") {
        va = parseDeadline(a.responseDeadLine)?.getTime() || 0;
        vb = parseDeadline(b.responseDeadLine)?.getTime() || 0;
      } else if (sortCol === "posted") {
        va = parseDeadline(a.postedDate)?.getTime() || 0;
        vb = parseDeadline(b.postedDate)?.getTime() || 0;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (filtered.length > 0 && filtered.every((o) => selected.has(oppToId(o)))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(oppToId)));
    }
  }

  function toggleNotice(val: string) {
    setCheckedNotices((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  function toggleSetAside(val: string) {
    setCheckedSetAsides((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  async function importToActiveBids() {
    if (!selected.size) return;
    setImporting(true);
    setImportMsg("");

    try {
      // 1. Load existing bids from Supabase
      const { data: existing, error: loadErr } = await supabase
        .from("active-bids")
        .select("payload");
      if (loadErr) throw loadErr;

      const existingBids: any[] = (existing ?? []).map((r: any) => r.payload);
      const existingLinks = new Set(existingBids.map((b) => b.samLink).filter(Boolean));

      // 2. Build new bids, skip duplicates by samLink
      const toImport = allOpps.filter((o) => selected.has(oppToId(o)));
      const newBids = toImport
        .filter((o) => {
          const url =
            o.uiLink && o.uiLink !== "null"
              ? o.uiLink
              : `https://sam.gov/opp/${o.noticeId}/view`;
          return !existingLinks.has(url);
        })
        .map((o) => ({
          id: Date.now() + Math.floor(Math.random() * 100000),
          ...oppToBid(o),
        }));

      if (newBids.length === 0) {
        setImportMsg("All selected opportunities are already in Active Bids.");
        return;
      }

      // 3. Merge and replace-all (same strategy as Active Bids page)
      const merged = [...existingBids, ...newBids];

      const { error: delErr } = await supabase
        .from("active-bids")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) throw delErr;

      const rows = merged.map((b) => ({ payload: b }));
      const { error: insErr } = await supabase.from("active-bids").insert(rows);
      if (insErr) throw insErr;

      setImportMsg(
        `✓ ${newBids.length} opportunit${newBids.length > 1 ? "ies" : "y"} imported to Active Bids.`
      );
      setSelected(new Set());
    } catch (e: any) {
      setImportMsg(`✗ Import failed: ${e.message}`);
    } finally {
      setImporting(false);
      setTimeout(() => setImportMsg(""), 6000);
    }
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((o) => selected.has(oppToId(o)));

  function getPageRange(c: number, t: number) {
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    if (c <= 4) return [1, 2, 3, 4, 5, "...", t];
    if (c >= t - 3) return [1, "...", t - 4, t - 3, t - 2, t - 1, t];
    return [1, "...", c - 1, c, c + 1, "...", t];
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">
            Fetch opportunities from SAM.gov and import to Active Bids
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="text-xs text-muted-foreground font-mono">{lastFetch}</span>
          )}
          {selected.size > 0 && (
            <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1">
              {selected.size} selected
            </span>
          )}
          <Button
            onClick={importToActiveBids}
            disabled={selected.size === 0 || importing}
            className="gap-2"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Import to Active Bids
          </Button>
        </div>
      </div>

      {importMsg && (
        <div
          className={`text-sm rounded-md px-3 py-2 font-mono ${
            importMsg.startsWith("✓")
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {importMsg}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        {/* Row 1: API key + dates + fetch */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-[220px] font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Posted From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Posted To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <Button onClick={fetchOpportunities} disabled={loading} className="gap-2 self-end">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Fetching…" : "Fetch Opportunities"}
          </Button>
        </div>

        {/* Row 2: Other API filters */}
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Title keyword"
            value={titleKw}
            onChange={(e) => setTitleKw(e.target.value)}
            className="w-[180px]"
          />
          <Input
            placeholder="NAICS"
            value={naics}
            onChange={(e) => setNaics(e.target.value)}
            className="w-[110px]"
          />
          <Input
            placeholder="State (e.g. VA)"
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            className="w-[110px]"
            maxLength={2}
          />
          <Input
            placeholder="Organization"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="w-[180px]"
          />
          <Input
            placeholder="Solicitation #"
            value={solnum}
            onChange={(e) => setSolnum(e.target.value)}
            className="w-[150px]"
          />
          <Input
            placeholder="Class. Code"
            value={ccode}
            onChange={(e) => setCcode(e.target.value)}
            className="w-[120px]"
          />
        </div>

        {/* Row 3: Response deadline */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Response Deadline From</label>
            <Input
              type="date"
              value={rdlFrom}
              onChange={(e) => setRdlFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Response Deadline To</label>
            <Input
              type="date"
              value={rdlTo}
              onChange={(e) => setRdlTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
        </div>

        {/* Notice type + Set-aside checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
              Notice Type
            </p>
            <div className="grid grid-cols-2 gap-0.5">
              {NOTICE_OPTS.map((o) => (
                <label
                  key={o.val}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded cursor-pointer transition-colors select-none ${
                    checkedNotices.has(o.val)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedNotices.has(o.val)}
                    onChange={() => toggleNotice(o.val)}
                    className="accent-primary w-3 h-3 cursor-pointer"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
              Set-Aside
            </p>
            <div className="grid grid-cols-2 gap-0.5 max-h-48 overflow-y-auto pr-1">
              {SETASIDE_OPTS.map((o) => (
                <label
                  key={o.val}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded cursor-pointer transition-colors select-none ${
                    checkedSetAsides.has(o.val)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedSetAsides.has(o.val)}
                    onChange={() => toggleSetAside(o.val)}
                    className="accent-primary w-3 h-3 cursor-pointer"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {fetchError && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
            {fetchError}
          </div>
        )}
      </div>

      {/* Results toolbar */}
      {allOpps.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            SAM.gov total:{" "}
            <strong className="text-primary">{samTotal.toLocaleString()}</strong>
            {" · "}Loaded: <strong>{allOpps.length}</strong>
            {" · "}Filtered: <strong>{filtered.length}</strong>
            {samTotal > 1000 && (
              <span className="text-yellow-500 ml-2">
                ⚠ 1,000 cap — narrow your date range for more
              </span>
            )}
          </span>
          <div className="flex-1" />
          <Input
            placeholder="Quick filter title…"
            value={quickKw}
            onChange={(e) => { setQuickKw(e.target.value); setPage(1); }}
            className="w-[220px]"
          />
          <select
            value={dueIn}
            onChange={(e) => { setDueIn(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
          >
            <option value="">Due: Any</option>
            <option value="3">Due in 3 days</option>
            <option value="7">Due in 7 days</option>
            <option value="14">Due in 14 days</option>
            <option value="30">Due in 30 days</option>
            <option value="60">Due in 60 days</option>
          </select>
          {(quickKw || dueIn) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setQuickKw(""); setDueIn(""); }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin opacity-40" />
            <p className="text-sm">Pulling from SAM.gov…</p>
          </div>
        ) : allOpps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground">
            <Search className="w-10 h-10 opacity-20" />
            <p className="text-sm">Configure filters and click Fetch Opportunities</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground">
            <X className="w-10 h-10 opacity-20" />
            <p className="text-sm">No results match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 w-8">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      className="accent-primary w-3 h-3 cursor-pointer"
                    />
                  </th>
                  <th
                    className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => toggleSort("title")}
                  >
                    Title {sortCol === "title" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Type
                  </th>
                  <th className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Set-Aside
                  </th>
                  <th className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Organization
                  </th>
                  <th className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    NAICS
                  </th>
                  <th className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Location
                  </th>
                  <th
                    className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => toggleSort("deadline")}
                  >
                    Due {sortCol === "deadline" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => toggleSort("posted")}
                  >
                    Posted {sortCol === "posted" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="p-2 text-left font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    POC
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((o) => {
                  const id = oppToId(o);
                  const sel = selected.has(id);
                  const daysLeft = getDaysLeft(o.responseDeadLine);
                  const saCode = (o.typeOfSetAside || "").toUpperCase();
                  const saLabel = SETASIDE_SHORT[saCode] || o.typeOfSetAsideDescription || "";
                  const orgFull =
                    o.fullParentPathName ||
                    [o.department, o.subTier, o.office].filter(Boolean).join(" › ") ||
                    "—";
                  const orgShort = orgFull.split(".").pop()?.trim() || orgFull;
                  const loc =
                    [o.placeOfPerformance?.city?.name, o.placeOfPerformance?.state?.code]
                      .filter(Boolean)
                      .join(", ") || "—";
                  const samUrl =
                    o.uiLink && o.uiLink !== "null"
                      ? o.uiLink
                      : `https://sam.gov/opp/${o.noticeId}/view`;
                  const poc = Array.isArray(o.pointOfContact)
                    ? o.pointOfContact.find((p) => p.type === "primary") || o.pointOfContact[0]
                    : null;

                  let dueDateColor = "text-muted-foreground";
                  if (daysLeft !== null) {
                    if (daysLeft <= 3) dueDateColor = "text-red-500 font-semibold";
                    else if (daysLeft <= 7) dueDateColor = "text-yellow-500";
                    else dueDateColor = "text-green-500";
                  }

                  return (
                    <tr
                      key={id}
                      onClick={() => toggleRow(id)}
                      className={`border-b cursor-pointer transition-colors ${
                        sel
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleRow(id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-primary w-3 h-3 cursor-pointer"
                        />
                      </td>
                      <td className="p-2 max-w-[260px]">
                        <a
                          href={samUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-foreground font-medium hover:text-primary hover:underline flex items-start gap-1"
                          title={o.title}
                        >
                          <span className="line-clamp-2">{o.title || "—"}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
                        </a>
                        {o.solicitationNumber && (
                          <div className="text-muted-foreground font-mono text-[10px] mt-0.5">
                            {o.solicitationNumber}
                          </div>
                        )}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded px-1.5 py-0.5 font-mono text-[10px]">
                          {o.type || "—"}
                        </span>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {saLabel ? (
                          <span className="bg-green-500/10 text-green-500 border border-green-500/20 rounded px-1.5 py-0.5 font-mono text-[10px]">
                            {saLabel}
                          </span>
                        ) : (
                          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
                            Unrestricted
                          </span>
                        )}
                      </td>
                      <td
                        className="p-2 max-w-[160px] truncate text-muted-foreground"
                        title={orgFull}
                      >
                        {orgShort}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
                          {o.naicsCode || "—"}
                        </span>
                      </td>
                      <td className="p-2 whitespace-nowrap text-muted-foreground">{loc}</td>
                      <td className={`p-2 whitespace-nowrap font-mono ${dueDateColor}`}>
                        {formatDate(o.responseDeadLine)}
                        {daysLeft !== null && (
                          <div className="text-[10px] opacity-70">{daysLeft}d</div>
                        )}
                      </td>
                      <td className="p-2 whitespace-nowrap font-mono text-muted-foreground">
                        {formatDate(o.postedDate)}
                      </td>
                      <td className="p-2">
                        {poc ? (
                          <div className="text-muted-foreground">
                            {poc.fullName && <div>{poc.fullName}</div>}
                            {poc.email && (
                              <a
                                href={`mailto:${poc.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary hover:underline text-[10px]"
                              >
                                {poc.email}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs font-mono text-muted-foreground">
            Page {page}/{totalPages} · {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </Button>
            {getPageRange(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1 text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
