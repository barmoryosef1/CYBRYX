import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, AlertCircle, AlertOctagon, ExternalLink, Search, Filter, Download, ChevronUp, ChevronDown, Copy, Eye, EyeOff, ChevronRight, Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useLocation, useNavigate } from "react-router-dom";

interface CVETableProps {
  onSelectCVE: (cveId: string) => void;
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
}

interface CVE {
  cve_id: string;
  description: string;
  base_severity: string;
  base_score: number;
  published: string;
}

const CVETable = ({ onSelectCVE, severityFilter, setSeverityFilter }: CVETableProps) => {
  const [cves, setCVEs] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [sortBy, setSortBy] = useState("published");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const pageSize = 10;
  const [visibleColumns, setVisibleColumns] = useState({
    cve_id: true,
    description: true,
    base_severity: true,
    published: true,
    base_score: true,
  });
  const [quickFilter, setQuickFilter] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [scoreRange, setScoreRange] = useState<{ min: number; max: number }>({ min: 0, max: 10 });
  const [expandedCVEId, setExpandedCVEId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cveFavorites') || '[]');
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load persistent state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cveTableState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.visibleColumns) setVisibleColumns(state.visibleColumns);
        if (state.sortBy) setSortBy(state.sortBy);
        if (state.sortDirection) setSortDirection(state.sortDirection);
        if (state.quickFilter) setQuickFilter(state.quickFilter);
        if (state.selectedSeverities) setSelectedSeverities(state.selectedSeverities);
        if (state.dateRange) setDateRange(state.dateRange);
        if (state.scoreRange) setScoreRange(state.scoreRange);
        if (state.showOnlyFavorites !== undefined) setShowOnlyFavorites(state.showOnlyFavorites);
      } catch {}
    }
  }, []);

  // Save persistent state to localStorage
  useEffect(() => {
    const state = {
      visibleColumns,
      sortBy,
      sortDirection,
      quickFilter,
      selectedSeverities,
      dateRange,
      scoreRange,
      showOnlyFavorites,
    };
    localStorage.setItem('cveTableState', JSON.stringify(state));
  }, [visibleColumns, sortBy, sortDirection, quickFilter, selectedSeverities, dateRange, scoreRange, showOnlyFavorites]);

  useEffect(() => {
    loadCVEs();
    localStorage.setItem('cveFavorites', JSON.stringify(favorites));
    // eslint-disable-next-line
  }, [page, severityFilter, yearFilter, sortBy, sortDirection, favorites]);

  // On mount, check for query params and set state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let changed = false;
    if (params.has('columns')) {
      try {
        const cols = JSON.parse(decodeURIComponent(params.get('columns')!));
        setVisibleColumns(cols);
        changed = true;
      } catch {}
    }
    if (params.has('sortBy')) setSortBy(params.get('sortBy')!);
    if (params.has('sortDirection')) setSortDirection(params.get('sortDirection') as 'asc' | 'desc');
    if (params.has('quickFilter')) setQuickFilter(params.get('quickFilter')!);
    if (params.has('severities')) setSelectedSeverities(params.get('severities')!.split(','));
    if (params.has('dateStart') || params.has('dateEnd')) setDateRange({ start: params.get('dateStart') || '', end: params.get('dateEnd') || '' });
    if (params.has('scoreMin') || params.has('scoreMax')) setScoreRange({ min: Number(params.get('scoreMin') || 0), max: Number(params.get('scoreMax') || 10) });
    if (params.has('favorites')) setShowOnlyFavorites(params.get('favorites') === '1');
    // Optionally, remove params from URL after loading
    if (changed) navigate(location.pathname, { replace: true });
  }, []);

  async function loadCVEs() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("cves").select("*", { count: "exact" });
      if (severityFilter && severityFilter !== "all") {
        query = query.eq("base_severity", severityFilter);
      }
      if (yearFilter) {
        query = query.ilike("cve_id", `CVE-${yearFilter}-%`);
      }
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);
      const { data, error: queryError, count } = await query;
      if (queryError) {
        setError(`Database query error: ${queryError.message}`);
        return;
      }
      setCVEs(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function searchCVEs() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("cves").select("*", { count: "exact" });
      if (searchTerm) {
        if (/^CVE-\d{4}-\d+$/i.test(searchTerm)) {
          query = query.ilike("cve_id", searchTerm);
        } else {
          query = query.or(`description.ilike.%${searchTerm}%,cve_id.ilike.%${searchTerm}%`);
        }
      }
      if (severityFilter) {
        query = query.eq("base_severity", severityFilter);
      }
      if (yearFilter) {
        query = query.ilike("cve_id", `CVE-${yearFilter}-%`);
      }
      query = query.order("published", { ascending: false }).range(0, pageSize - 1);
      const { data, error: searchError, count } = await query;
      if (searchError) {
        setError(`Search error: ${searchError.message}`);
        return;
      }
      setCVEs(data || []);
      setTotalCount(count || 0);
      setPage(0);
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function getSeverityIcon(severity: string) {
    if (!severity) return <AlertCircle className="text-gray-400" />;
    switch (severity?.toLowerCase()) {
      case "critical":
        return <AlertOctagon className="text-red-600" />;
      case "high":
        return <AlertTriangle className="text-orange-500" />;
      case "medium":
        return <AlertCircle className="text-yellow-500" />;
      case "low":
        return <AlertCircle className="text-blue-500" />;
      default:
        return <AlertCircle className="text-gray-400" />;
    }
  }

  function getSeverityClass(severity: string) {
    if (!severity) return "bg-gray-100 text-gray-500 border-gray-200";
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      searchCVEs();
    }
  }

  function exportToCSV() {
    const headers = Object.entries(visibleColumns)
      .filter(([_, visible]) => visible)
      .map(([col]) => {
        switch (col) {
          case 'cve_id': return 'CVE ID';
          case 'description': return 'Description';
          case 'base_severity': return 'Severity';
          case 'published': return 'Published';
          case 'base_score': return 'Score';
          default: return col;
        }
      });
    const csvRows = [headers];
    filteredCVEs.forEach((cve) => {
      const row = [];
      if (visibleColumns.cve_id) row.push(cve.cve_id);
      if (visibleColumns.description) row.push(cve.description);
      if (visibleColumns.base_severity) row.push(cve.base_severity);
      if (visibleColumns.published) row.push(formatDate(cve.published));
      if (visibleColumns.base_score) row.push(cve.base_score);
      csvRows.push(row);
    });
    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cve-export-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported to CSV!");
  }

  function exportToExcel() {
    const headers = Object.entries(visibleColumns)
      .filter(([_, visible]) => visible)
      .map(([col]) => {
        switch (col) {
          case 'cve_id': return 'CVE ID';
          case 'description': return 'Description';
          case 'base_severity': return 'Severity';
          case 'published': return 'Published';
          case 'base_score': return 'Score';
          default: return col;
        }
      });
    const data = filteredCVEs.map((cve) => {
      const row: any = {};
      if (visibleColumns.cve_id) row['CVE ID'] = cve.cve_id;
      if (visibleColumns.description) row['Description'] = cve.description;
      if (visibleColumns.base_severity) row['Severity'] = cve.base_severity;
      if (visibleColumns.published) row['Published'] = formatDate(cve.published);
      if (visibleColumns.base_score) row['Score'] = cve.base_score;
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CVEs");
    XLSX.writeFile(wb, `cve-export-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Exported to Excel!");
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear; year >= currentYear - 10; year--) {
    yearOptions.push(year);
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setPage(0);
  }

  function renderSortIcon(column: string) {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />;
  }

  function handleCopyCVE(cveId: string) {
    navigator.clipboard.writeText(cveId);
    toast.success("CVE ID copied!", { description: cveId });
  }

  function copyShareableLink() {
    const params = new URLSearchParams();
    params.set('columns', encodeURIComponent(JSON.stringify(visibleColumns)));
    params.set('sortBy', sortBy);
    params.set('sortDirection', sortDirection);
    if (quickFilter) params.set('quickFilter', quickFilter);
    if (selectedSeverities.length > 0) params.set('severities', selectedSeverities.join(','));
    if (dateRange.start) params.set('dateStart', dateRange.start);
    if (dateRange.end) params.set('dateEnd', dateRange.end);
    if (scoreRange.min !== 0) params.set('scoreMin', String(scoreRange.min));
    if (scoreRange.max !== 10) params.set('scoreMax', String(scoreRange.max));
    if (showOnlyFavorites) params.set('favorites', '1');
    const url = `${window.location.origin}${location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success('Shareable link copied!', { description: url });
  }

  const filteredCVEs = cves.filter(cve => {
    if (showOnlyFavorites && !favorites.includes(cve.cve_id)) return false;
    if (!quickFilter) return true;
    const q = quickFilter.toLowerCase();
    return (
      cve.cve_id?.toLowerCase().includes(q) ||
      cve.description?.toLowerCase().includes(q) ||
      cve.base_severity?.toLowerCase().includes(q)
    );
  }).filter(cve => {
    if (selectedSeverities.length === 0) return true;
    return selectedSeverities.includes((cve.base_severity || '').toUpperCase());
  }).filter(cve => {
    if (!dateRange.start && !dateRange.end) return true;
    const published = cve.published ? new Date(cve.published) : null;
    if (!published) return false;
    if (dateRange.start && published < new Date(dateRange.start)) return false;
    if (dateRange.end && published > new Date(dateRange.end)) return false;
    return true;
  }).filter(cve => {
    if (scoreRange.min === 0 && scoreRange.max === 10) return true;
    const score = typeof cve.base_score === 'number' ? cve.base_score : Number(cve.base_score);
    if (isNaN(score)) return false;
    return score >= scoreRange.min && score <= scoreRange.max;
  });

  return (
    <div className="w-full overflow-x-auto font-sans text-cyber-foreground bg-cyber-card/50 rounded-xl p-4 shadow-xl">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search CVEs by ID or description..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyber-accent focus:border-cyber-accent bg-cyber-muted text-cyber-foreground placeholder-cyber-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-cyber-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              className="px-4 py-2 bg-cyber-accent text-cyber-accent-foreground rounded-lg hover:bg-cyber-accent/80 focus:outline-none focus:ring-2 focus:ring-cyber-accent focus:ring-offset-2"
              onClick={searchCVEs}
            >
              Search
            </button>
            <button
              className="px-2 py-2 bg-cyber-muted text-cyber-foreground rounded-lg hover:bg-cyber-accent/10"
              onClick={() => setAdvancedSearch(!advancedSearch)}
              title={advancedSearch ? "Hide filters" : "Show filters"}
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              className="px-2 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
              onClick={exportToCSV}
              title="Export to CSV"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              className="px-2 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
              onClick={exportToExcel}
              title="Export to Excel"
            >
              <Download className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">Excel</span>
            </button>
            <button
              className="px-2 py-2 bg-cyber-accent text-cyber-accent-foreground rounded-lg hover:bg-cyber-accent/80"
              onClick={copyShareableLink}
              title="Copy Shareable Link"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">Share</span>
            </button>
            {(severityFilter || yearFilter) && (
              <button
                className="ml-2 px-3 py-2 rounded-lg bg-cyber-muted text-cyber-accent hover:bg-cyber-accent/10 border border-cyber-accent/20 text-xs font-semibold"
                onClick={() => { setSeverityFilter(""); setYearFilter(""); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {advancedSearch && (
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-cyber-accent mb-1">Severity</label>
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <label className="block text-sm font-medium text-cyber-accent">Severity</label>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
                  <label key={sev} className="flex items-center gap-1 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSeverities.includes(sev)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedSeverities(prev => [...prev, sev]);
                        } else {
                          setSelectedSeverities(prev => prev.filter(s => s !== sev));
                        }
                        setPage(0);
                      }}
                      className="accent-cyber-accent"
                    />
                    <span className={`px-2 py-1 rounded-full border ${getSeverityClass(sev)} uppercase`}>{sev}</span>
                  </label>
                ))}
                {selectedSeverities.length > 0 && (
                  <button
                    className="ml-2 px-2 py-1 rounded bg-cyber-muted text-cyber-accent border border-cyber-accent/20 text-xs font-semibold"
                    onClick={() => setSelectedSeverities([])}
                  >
                    Clear Severity
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-accent mb-1">Year</label>
              <select
                className="block w-full border rounded-lg px-3 py-2 bg-cyber-muted text-cyber-foreground"
                value={yearFilter}
                onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
              >
                <option value="">All</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date Range Picker and Score Range Slider */}
        <div className="mb-4 flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-cyber-accent mb-1">Published Date</label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                className="px-2 py-1 rounded border bg-cyber-muted text-cyber-foreground"
                value={dateRange.start}
                onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                max={dateRange.end || undefined}
              />
              <span className="text-cyber-muted-foreground">to</span>
              <input
                type="date"
                className="px-2 py-1 rounded border bg-cyber-muted text-cyber-foreground"
                value={dateRange.end}
                onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                min={dateRange.start || undefined}
              />
              {(dateRange.start || dateRange.end) && (
                <button
                  className="ml-2 px-2 py-1 rounded bg-cyber-muted text-cyber-accent border border-cyber-accent/20 text-xs font-semibold"
                  onClick={() => setDateRange({ start: '', end: '' })}
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-cyber-accent mb-1">Score Range</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                max={Number(scoreRange.max)}
                step={0.1}
                className="w-16 px-2 py-1 rounded border bg-cyber-muted text-cyber-foreground"
                value={scoreRange.min}
                onChange={e => setScoreRange(r => ({ ...r, min: Number(e.target.value) }))}
              />
              <span className="text-cyber-muted-foreground">to</span>
              <input
                type="number"
                min={Number(scoreRange.min)}
                max={10}
                step={0.1}
                className="w-16 px-2 py-1 rounded border bg-cyber-muted text-cyber-foreground"
                value={scoreRange.max}
                onChange={e => setScoreRange(r => ({ ...r, max: Number(e.target.value) }))}
              />
              {(scoreRange.min !== 0 || scoreRange.max !== 10) && (
                <button
                  className="ml-2 px-2 py-1 rounded bg-cyber-muted text-cyber-accent border border-cyber-accent/20 text-xs font-semibold"
                  onClick={() => setScoreRange({ min: 0, max: 10 })}
                >
                  Clear Score
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Favorites Toggle */}
        <div className="mb-2 flex items-center gap-3">
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold ${showOnlyFavorites ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-cyber-muted border-cyber-accent/20 text-cyber-accent'}`}
            onClick={() => setShowOnlyFavorites(fav => !fav)}
            title="Show only favorites"
          >
            <Star className="h-4 w-4" fill={showOnlyFavorites ? '#facc15' : 'none'} />
            {showOnlyFavorites ? 'Showing Favorites' : 'Show Only Favorites'}
          </button>
          <span className="text-xs text-cyber-muted-foreground">({favorites.length} favorited)</span>
        </div>
      </div>

      {/* Filtered Results Count and Reset Table */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
        <div className="text-sm text-cyber-muted-foreground">
          Showing {filteredCVEs.length} of {totalCount} CVEs
        </div>
        <button
          className="px-3 py-2 rounded-lg bg-cyber-muted text-cyber-accent hover:bg-cyber-accent/10 border border-cyber-accent/20 text-xs font-semibold"
          onClick={() => { setSeverityFilter(""); setYearFilter(""); setSortBy("published"); setSortDirection("desc"); setSearchTerm(""); }}
        >
          Reset Table
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Column Visibility Toggle */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <span className="text-xs text-cyber-muted-foreground mr-2">Columns:</span>
        {Object.entries(visibleColumns).map(([col, visible]) => (
          <button
            key={col}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${visible ? 'bg-cyber-accent/10 border-cyber-accent text-cyber-accent' : 'bg-cyber-muted border-cyber-muted-foreground text-cyber-muted-foreground'} transition`}
            onClick={() => setVisibleColumns(v => ({ ...v, [col]: !v[col] }))}
          >
            {visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {col.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Quick Filter Bar */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          className="w-full px-3 py-2 rounded border bg-cyber-muted text-cyber-foreground placeholder-cyber-muted-foreground"
          placeholder="Quick filter... (type to filter CVEs)"
          value={quickFilter}
          onChange={e => setQuickFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-cyber-accent/20 bg-cyber-card/50">
        <table className="min-w-full divide-y divide-cyber-accent/10 text-sm">
          <thead className="bg-cyber-muted sticky top-0 z-10">
            <tr className="border-b border-cyber-accent/20">
              {visibleColumns.cve_id && (
                <th className="px-6 py-3 text-left font-semibold text-cyber-accent uppercase tracking-wider whitespace-nowrap cursor-pointer select-none" style={{ minWidth: 120 }} onClick={() => handleSort('cve_id')}>
                  CVE ID {renderSortIcon('cve_id')}
                </th>
              )}
              {visibleColumns.description && (
                <th className="px-6 py-3 text-left font-semibold text-cyber-accent uppercase tracking-wider whitespace-nowrap" style={{ minWidth: 260, maxWidth: 400 }}>Description</th>
              )}
              {visibleColumns.base_severity && (
                <th className="px-6 py-3 text-left font-semibold text-cyber-accent uppercase tracking-wider whitespace-nowrap cursor-pointer select-none" style={{ minWidth: 100 }} onClick={() => handleSort('base_severity')}>
                  Severity {renderSortIcon('base_severity')}
                </th>
              )}
              {visibleColumns.published && (
                <th className="px-6 py-3 text-left font-semibold text-cyber-accent uppercase tracking-wider whitespace-nowrap cursor-pointer select-none" style={{ minWidth: 120 }} onClick={() => handleSort('published')}>
                  Published {renderSortIcon('published')}
                </th>
              )}
              {visibleColumns.base_score && (
                <th className="px-6 py-3 text-left font-semibold text-cyber-accent uppercase tracking-wider whitespace-nowrap cursor-pointer select-none" style={{ minWidth: 80 }} onClick={() => handleSort('base_score')}>
                  Score {renderSortIcon('base_score')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-cyber-card/50 divide-y divide-cyber-accent/10">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-6 text-center text-cyber-muted-foreground animate-pulse">
                    <div className="h-4 w-1/2 mx-auto bg-cyber-muted/40 rounded" />
                  </td>
                </tr>
              ))
            ) : filteredCVEs.length === 0 ? (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8 text-cyber-muted-foreground">
                  No CVEs found.
                </td>
              </tr>
            ) : (
              filteredCVEs.map((cve, idx) => (
                <React.Fragment key={cve.cve_id}>
                  <tr
                    className={
                      "hover:bg-cyber-accent/10 cursor-pointer transition-colors duration-150 " +
                      (idx % 2 === 0 ? "bg-cyber-muted/50" : "bg-cyber-card/50")
                    }
                    onClick={() => setExpandedCVEId(expandedCVEId === cve.cve_id ? null : cve.cve_id)}
                  >
                    <td className="px-2 py-4 whitespace-nowrap align-middle">
                      <button
                        className="p-1 rounded hover:bg-cyber-accent/10"
                        onClick={e => { e.stopPropagation(); setExpandedCVEId(expandedCVEId === cve.cve_id ? null : cve.cve_id); }}
                        title={expandedCVEId === cve.cve_id ? 'Collapse' : 'Expand'}
                      >
                        {expandedCVEId === cve.cve_id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    {visibleColumns.cve_id && (
                      <td className="px-6 py-4 whitespace-nowrap text-cyber-accent font-medium flex items-center gap-2 underline underline-offset-2">
                        <a
                          href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          {cve.cve_id}
                          <ExternalLink className="h-4 w-4 text-cyber-accent" />
                        </a>
                        <button
                          className="ml-1 p-1 rounded hover:bg-cyber-accent/10"
                          title="Copy CVE ID"
                          onClick={e => { e.stopPropagation(); handleCopyCVE(cve.cve_id); }}
                        >
                          <Copy className="h-4 w-4 text-cyber-accent" />
                        </button>
                        <button
                          className="ml-1 p-1 rounded hover:bg-yellow-100"
                          title={favorites.includes(cve.cve_id) ? 'Remove from favorites' : 'Add to favorites'}
                          onClick={e => {
                            e.stopPropagation();
                            setFavorites(favs => favs.includes(cve.cve_id)
                              ? favs.filter(id => id !== cve.cve_id)
                              : [...favs, cve.cve_id]);
                          }}
                        >
                          {favorites.includes(cve.cve_id)
                            ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                            : <StarOff className="h-4 w-4 text-cyber-muted-foreground" />}
                        </button>
                      </td>
                    )}
                    {visibleColumns.description && (
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate text-cyber-foreground/90" title={cve.description} style={{ maxWidth: 350 }}>
                        <span
                          title={cve.description}
                          className="cursor-help"
                        >
                          {cve.description}
                        </span>
                      </td>
                    )}
                    {visibleColumns.base_severity && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityClass(cve.base_severity)} gap-1 shadow-sm`} style={{ minWidth: 80 }}>
                          {getSeverityIcon(cve.base_severity)}
                          <span className="ml-1 capitalize">{cve.base_severity ? cve.base_severity : "N/A"}</span>
                        </span>
                      </td>
                    )}
                    {visibleColumns.published && (
                      <td className="px-6 py-4 whitespace-nowrap text-cyber-muted-foreground">
                        {formatDate(cve.published)}
                      </td>
                    )}
                    {visibleColumns.base_score && (
                      <td className="px-6 py-4 whitespace-nowrap text-cyber-muted-foreground">
                        {cve.base_score !== undefined && cve.base_score !== null && cve.base_score !== "" ? cve.base_score : "N/A"}
                      </td>
                    )}
                  </tr>
                  {expandedCVEId === cve.cve_id && (
                    <tr className="bg-cyber-muted/30">
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-8 py-4 text-cyber-foreground text-sm">
                        <div className="mb-2">
                          <span className="font-semibold text-cyber-accent">Full Description:</span>
                          <div className="mt-1 text-cyber-foreground/90 whitespace-pre-line">{cve.description || 'No description available.'}</div>
                        </div>
                        {cve.published && (
                          <div className="mb-2">
                            <span className="font-semibold text-cyber-accent">Published:</span> {formatDate(cve.published)}
                          </div>
                        )}
                        {cve.base_score !== undefined && cve.base_score !== null && cve.base_score !== "" && (
                          <div className="mb-2">
                            <span className="font-semibold text-cyber-accent">Score:</span> {cve.base_score}
                          </div>
                        )}
                        {cve.base_severity && (
                          <div className="mb-2">
                            <span className="font-semibold text-cyber-accent">Severity:</span> {cve.base_severity}
                          </div>
                        )}
                        {/* Add more details here as needed */}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-cyber-muted-foreground">
          Page {page + 1} of {totalPages} ({totalCount} CVEs)
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-cyber-muted text-cyber-foreground hover:bg-cyber-accent/10 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 rounded bg-cyber-muted text-cyber-foreground hover:bg-cyber-accent/10 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVETable; 