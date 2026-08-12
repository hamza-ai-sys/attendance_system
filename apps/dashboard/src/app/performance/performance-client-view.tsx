"use client";

import { useState } from "react";
import {
  PerformanceEvaluationDetails,
  PerformanceEvaluationList,
  PerformanceTemplateList
} from "./performance-sections";
import { PerformanceTemplateBuilder } from "./performance-template-builder";
import type { EvaluationData, TemplateData } from "./performance-types";

export type { EvaluationData, TemplateData } from "./performance-types";

interface PerformanceClientViewProps {
  templates: TemplateData[];
  evaluations: EvaluationData[];
}

export function PerformanceClientView({ templates, evaluations }: PerformanceClientViewProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationData | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div className="panel" style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        <div>
          <h2>HR Employee Performance Management</h2>
          <p className="muted">
            Define evaluation documents, schedule submission windows, and track team performance.
          </p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setShowBuilder(true)}>
          + Define Performance Document
        </button>
      </div>

      <PerformanceTemplateList templates={templates} />
      <PerformanceEvaluationList evaluations={evaluations} onSelect={setSelectedEvaluation} />

      {showBuilder && <PerformanceTemplateBuilder onClose={() => setShowBuilder(false)} />}
      {selectedEvaluation && (
        <PerformanceEvaluationDetails
          evaluation={selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
        />
      )}
    </div>
  );
}
