import React from "react";
import ResourceLibraryPage from "@/components/resources/ResourceLibraryPage";
import { getSubjectsForGrade } from "@/data/learningCatalog";

export default function GradePage({ grade, language = "km" }) {
  const numericGrade = Number(grade);
  const isKhmer = language === "km";
  const subjects = getSubjectsForGrade(numericGrade);
  const isBacIiGrade = numericGrade === 12;

  return (
    <ResourceLibraryPage
      language={language}
      fixedGrade={numericGrade}
      eyebrow={
        isBacIiGrade
          ? isKhmer
            ? "មុខវិជ្ជាប្រឡងបាក់ឌុប"
            : "Bac II exam subjects"
          : isKhmer
            ? "រៀបតាមថ្នាក់"
            : "Grade resources"
      }
      title={
        isBacIiGrade
          ? isKhmer
            ? "ឯកសារមុខវិជ្ជាប្រឡងបាក់ឌុប ថ្នាក់ទី ១២"
            : "Grade 12 Bac II Exam Resources"
          : isKhmer
            ? `ឯកសារសិក្សា ថ្នាក់ទី ${grade}`
            : `Grade ${grade} Resources`
      }
      description={
        isBacIiGrade && isKhmer
          ? `ស្វែងរកឯកសារប្រឡងបាក់ឌុបថ្នាក់ទី ១២ តាមមុខវិជ្ជា និងប្រភេទ ដូចជា កំណែលំហាត់ រូបមន្ត វិញ្ញាសា ឯកសារ និង E-Book។ មាន ${subjects.length} មុខវិជ្ជាសំខាន់ៗ។`
          : isBacIiGrade
            ? `Browse Grade 12 Bac II resources by subject and category, including answer keys, formulas, exam papers, study documents, and e-books across ${subjects.length} subjects.`
            : isKhmer
          ? `ស្វែងរកឯកសារថ្នាក់ទី ${grade} តាមមុខវិជ្ជា និងប្រភេទ ដូចជា កំណែលំហាត់ រូបមន្ត វិញ្ញាសា ឯកសារ និង E-Book។ មាន ${subjects.length} មុខវិជ្ជាសម្រាប់ថ្នាក់នេះ។`
          : `Browse Grade ${grade} files by subject and category, including answer keys, formulas, exam papers, study documents, and e-books.`
      }
    />
  );
}
