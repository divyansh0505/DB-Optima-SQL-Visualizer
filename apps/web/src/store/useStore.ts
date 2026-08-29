import { create } from "zustand";
import type { TableData, PipelineStep, QueryResult, OptimizationResult, VerifyIndexResult } from "@/types";
import { SAMPLE_DATASETS } from "@/lib/data/datasets";

const DEFAULT_DATA: TableData = SAMPLE_DATASETS.salesPipeline.data;

interface AppState {
  tableData: TableData;
  setTableData: (data: TableData) => void;
  addTable: (name: string) => void;
  dropTable: (name: string) => void;
  addRow: (table: string) => void;
  dropRow: (table: string, index: number) => void;
  addColumn: (table: string) => void;
  dropColumn: (table: string, col: string) => void;
  updateCell: (table: string, row: number, col: string, value: string | number | null) => void;
  renameColumn: (table: string, oldName: string, newName: string) => void;
  renameTable: (oldName: string, newName: string) => void;

  visualizerSQL: string;
  setVisualizerSQL: (sql: string) => void;
  pipeline: PipelineStep[];
  setPipeline: (steps: PipelineStep[]) => void;
  updateStepStatus: (index: number, status: PipelineStep["status"]) => void;
  queryResult: QueryResult | null;
  setQueryResult: (r: QueryResult | null) => void;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  animSpeed: number;
  setAnimSpeed: (v: number) => void;
  error: string | null;
  setError: (msg: string | null) => void;

  aiSQL: string;
  setAiSQL: (sql: string) => void;
  aiResult: OptimizationResult | null;
  setAiResult: (r: OptimizationResult | null) => void;
  aiAnalyzedSQL: string | null;
  setAiAnalyzedSQL: (sql: string | null) => void;
  aiLoading: boolean;
  setAiLoading: (v: boolean) => void;
  aiError: string | null;
  setAiError: (msg: string | null) => void;

  perfOriginalSQL: string;
  setPerfOriginalSQL: (sql: string) => void;
  perfOptimizedSQL: string;
  setPerfOptimizedSQL: (sql: string) => void;

  perfOptimizedSource: "ai" | "manual";
  setPerfOptimizedSource: (s: "ai" | "manual") => void;
  sendAiResultToPerformance: () => void;

  aiReoptimizeAttempts: number;
  setAiReoptimizeAttempts: (n: number) => void;
  reoptimizeFeedback: string | null;
  reoptimizeTrigger: number;
  requestAiReoptimize: (feedback: string) => void;

  dataVolume: number;
  setDataVolume: (v: number) => void;

  verifyResult: VerifyIndexResult | null;
  setVerifyResult: (r: VerifyIndexResult | null) => void;
  verifyLoading: boolean;
  setVerifyLoading: (v: boolean) => void;
  verifyError: string | null;
  setVerifyError: (msg: string | null) => void;

  activeDataset: string | null;
  loadDataset: (key: keyof typeof SAMPLE_DATASETS) => void;

  saveStatus: "idle" | "saving" | "saved" | "error";
  savedQueryId: string | null;
  saveError: string | null;
  setSaveStatus: (s: AppState["saveStatus"]) => void;
  setSavedQueryId: (id: string | null) => void;
  setSaveError: (msg: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  tableData: JSON.parse(JSON.stringify(DEFAULT_DATA)),
  setTableData: (data) => set({ tableData: data }),

  addTable: (name) =>
    set((s) => ({
      tableData: { [name]: [{ id: 1 }], ...s.tableData },
    })),

  dropTable: (name) =>
    set((s) => {
      const next = { ...s.tableData };
      delete next[name];
      return { tableData: next };
    }),

  addRow: (table) =>
    set((s) => {
      const rows = s.tableData[table];
      const cols = rows[0] ? Object.keys(rows[0]) : ["id"];
      const newRow: Record<string, string | number | null> = {};
      cols.forEach((c) => (newRow[c] = null));
      return { tableData: { ...s.tableData, [table]: [...rows, newRow] } };
    }),

  dropRow: (table, index) =>
    set((s) => ({
      tableData: {
        ...s.tableData,
        [table]: s.tableData[table].filter((_, i) => i !== index),
      },
    })),

  addColumn: (table) =>
    set((s) => {
      const rows = s.tableData[table];
      const colName = `col${Object.keys(rows[0] ?? {}).length + 1}`;
      return {
        tableData: {
          ...s.tableData,
          [table]: rows.map((r) => ({ ...r, [colName]: null })),
        },
      };
    }),

  dropColumn: (table, col) =>
    set((s) => {
      const rows = s.tableData[table];
      if (!rows.length || Object.keys(rows[0]).length <= 1) return s;
      return {
        tableData: {
          ...s.tableData,
          [table]: rows.map((r) => {
            const n = { ...r };
            delete n[col];
            return n;
          }),
        },
      };
    }),

  updateCell: (table, rowIdx, col, value) =>
    set((s) => {
      const rows = [...s.tableData[table]];
      rows[rowIdx] = { ...rows[rowIdx], [col]: value };
      return { tableData: { ...s.tableData, [table]: rows } };
    }),

  renameColumn: (table, oldName, newName) =>
    set((s) => {
      if (!newName || oldName === newName) return s;
      const rows = s.tableData[table].map((r) => {
        const newRow: Record<string, string | number | null> = {};
        for (const key of Object.keys(r)) {
          if (key === oldName) {
            newRow[newName] = r[oldName];
          } else {
            newRow[key] = r[key];
          }
        }
        return newRow;
      });
      return { tableData: { ...s.tableData, [table]: rows } };
    }),

  renameTable: (oldName, newName) =>
    set((s) => {
      if (!newName || oldName === newName || s.tableData[newName]) return s;
      const newTableData: TableData = {};
      for (const key of Object.keys(s.tableData)) {
        if (key === oldName) {
          newTableData[newName] = s.tableData[oldName];
        } else {
          newTableData[key] = s.tableData[key];
        }
      }
      return { tableData: newTableData };
    }),

  visualizerSQL: SAMPLE_DATASETS.salesPipeline.query,
  setVisualizerSQL: (sql) => set({ visualizerSQL: sql }),

  pipeline: [],
  setPipeline: (steps) => set({ pipeline: steps }),
  updateStepStatus: (index, status) =>
    set((s) => {
      const pipeline = [...s.pipeline];
      pipeline[index] = { ...pipeline[index], status };
      return { pipeline };
    }),

  queryResult: null,
  setQueryResult: (r) => set({ queryResult: r }),

  isRunning: false,
  setIsRunning: (v) => set({ isRunning: v }),

  animSpeed: 350,
  setAnimSpeed: (v) => set({ animSpeed: v }),

  error: null,
  setError: (msg) => set({ error: msg }),

  aiSQL: `SELECT *
FROM Orders o, Customers c
WHERE o.customer_id = c.id
AND o.quantity > 1`,
  setAiSQL: (sql) => set({ aiSQL: sql }),

  aiResult: null,
  setAiResult: (r) => set({ aiResult: r }),

  aiAnalyzedSQL: null,
  setAiAnalyzedSQL: (sql) => set({ aiAnalyzedSQL: sql }),

  aiLoading: false,
  setAiLoading: (v) => set({ aiLoading: v }),

  aiError: null,
  setAiError: (msg) => set({ aiError: msg }),

  perfOriginalSQL: SAMPLE_DATASETS.salesPipeline.query,
  setPerfOriginalSQL: (sql) => set({ perfOriginalSQL: sql }),

  perfOptimizedSQL: "",
  setPerfOptimizedSQL: (sql) => set({ perfOptimizedSQL: sql, perfOptimizedSource: "manual" }),

  perfOptimizedSource: "manual",
  setPerfOptimizedSource: (s) => set({ perfOptimizedSource: s }),

  sendAiResultToPerformance: () =>
    set((s) => {
      if (!s.aiResult?.optimized_sql) return s;
      return {
        perfOriginalSQL: s.aiAnalyzedSQL ?? s.aiSQL,
        perfOptimizedSQL: s.aiResult.optimized_sql,
        perfOptimizedSource: "ai",
        aiReoptimizeAttempts: 0,
      };
    }),

  aiReoptimizeAttempts: 0,
  setAiReoptimizeAttempts: (n) => set({ aiReoptimizeAttempts: n }),

  reoptimizeFeedback: null,
  reoptimizeTrigger: 0,
  requestAiReoptimize: (feedback) =>
    set((s) => ({
      aiSQL: s.perfOriginalSQL,
      reoptimizeFeedback: feedback,
      reoptimizeTrigger: s.reoptimizeTrigger + 1,
      aiReoptimizeAttempts: s.aiReoptimizeAttempts + 1,
    })),

  dataVolume: 10_000,
  setDataVolume: (v) => set({ dataVolume: v }),

  verifyResult: null,
  setVerifyResult: (r) => set({ verifyResult: r }),
  verifyLoading: false,
  setVerifyLoading: (v) => set({ verifyLoading: v }),
  verifyError: null,
  setVerifyError: (msg) => set({ verifyError: msg }),

  activeDataset: null,
  loadDataset: (key) =>
    set({
      tableData: JSON.parse(JSON.stringify(SAMPLE_DATASETS[key].data)),
      activeDataset: key,
      visualizerSQL: SAMPLE_DATASETS[key].query,
      perfOriginalSQL: SAMPLE_DATASETS[key].query,
      perfOptimizedSQL: "",
      perfOptimizedSource: "manual",
      aiReoptimizeAttempts: 0,
      queryResult: null,
      pipeline: [],
      aiResult: null,
      aiAnalyzedSQL: null,
      verifyResult: null,
    }),

  saveStatus: "idle",
  savedQueryId: null,
  saveError: null,
  setSaveStatus: (s) => set({ saveStatus: s }),
  setSavedQueryId: (id) => set({ savedQueryId: id }),
  setSaveError: (msg) => set({ saveError: msg }),
}));
