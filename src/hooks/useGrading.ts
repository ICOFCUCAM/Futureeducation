import { useMemo } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import type { GradeBand } from '@/regions/types';

export function useGrading() {
  const { region } = useRegion();

  return useMemo(() => {
    const scale: GradeBand[] = region.gradeScale;
    const classification = region.classification;
    const scaleMax = region.gpaScaleMax;

    function calculateGrade(totalScore: number) {
      const band = scale.find((b) => totalScore >= b.minScore && totalScore <= b.maxScore);
      if (!band) {
        const fail = scale[scale.length - 1];
        return { grade: fail.grade, gradePoint: fail.gradePoint, remark: fail.remark };
      }
      return { grade: band.grade, gradePoint: band.gradePoint, remark: band.remark };
    }

    function calculateTotalScore(caScore: number, examScore: number): number {
      return Math.min(caScore + examScore, 100);
    }

    function calculateQualityPoints(gradePoint: number, creditUnit: number): number {
      return Number((gradePoint * creditUnit).toFixed(2));
    }

    function calculateGPA(results: Array<{ gradePoint: number; creditUnit: number }>): number {
      if (results.length === 0) return 0;
      const totalQP = results.reduce((s, r) => s + r.gradePoint * r.creditUnit, 0);
      const totalCU = results.reduce((s, r) => s + r.creditUnit, 0);
      if (totalCU === 0) return 0;
      return Number((totalQP / totalCU).toFixed(2));
    }

    function calculateCGPA(
      semesters: Array<{ results: Array<{ gradePoint: number; creditUnit: number }> }>,
    ): number {
      let totalQP = 0;
      let totalCU = 0;
      for (const sem of semesters) {
        for (const r of sem.results) {
          totalQP += r.gradePoint * r.creditUnit;
          totalCU += r.creditUnit;
        }
      }
      if (totalCU === 0) return 0;
      return Number((totalQP / totalCU).toFixed(2));
    }

    function getClassification(cgpa: number): string {
      const band = classification.find((c) => cgpa >= c.minCgpa);
      return band?.label || 'Fail';
    }

    function getClassificationShort(cgpa: number): string {
      const band = classification.find((c) => cgpa >= c.minCgpa);
      return band?.shortLabel || 'Fail';
    }

    function getGradeColor(grade: string): string {
      const ranked = scale.map((s) => s.grade);
      const idx = ranked.indexOf(grade);
      if (idx === -1) return 'text-gray-600 bg-gray-50';
      const palette = [
        'text-emerald-600 bg-emerald-50',
        'text-emerald-600 bg-emerald-50',
        'text-blue-600 bg-blue-50',
        'text-blue-600 bg-blue-50',
        'text-yellow-600 bg-yellow-50',
        'text-yellow-600 bg-yellow-50',
        'text-orange-600 bg-orange-50',
        'text-orange-600 bg-orange-50',
        'text-red-500 bg-red-50',
        'text-red-700 bg-red-100',
      ];
      return palette[Math.min(idx, palette.length - 1)] || 'text-gray-600 bg-gray-50';
    }

    function getGPAColor(gpa: number): string {
      const ratio = scaleMax > 0 ? gpa / scaleMax : 0;
      if (ratio >= 0.9) return 'text-emerald-600';
      if (ratio >= 0.7) return 'text-blue-600';
      if (ratio >= 0.5) return 'text-yellow-600';
      if (ratio >= 0.3) return 'text-orange-600';
      return 'text-red-600';
    }

    return {
      scale,
      classification,
      scaleMax,
      calculateGrade,
      calculateTotalScore,
      calculateQualityPoints,
      calculateGPA,
      calculateCGPA,
      getClassification,
      getClassificationShort,
      getGradeColor,
      getGPAColor,
    };
  }, [region]);
}
