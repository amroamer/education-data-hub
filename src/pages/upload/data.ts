import { DataTemplate } from "./types";

export const DATA_TEMPLATES: DataTemplate[] = [
  {
    id: "enrollment",
    label: "Student Enrollment",
    description: "Headcount, demographics, grade distribution, and enrollment status by academic year.",
    frequency: "Term",
    icon: "👨‍🎓",
    rowCount: "100–10,000",
    columns: [
      { field: "Student ID", type: "id", required: true, example: "STU-001234", validation: "Format: STU-XXXXXX" },
      { field: "Full Name", type: "text", required: true, example: "Ahmed Al-Mansouri", validation: "Max 120 chars" },
      { field: "Gender", type: "enum", required: true, example: "M", validation: "M / F / U" },
      { field: "Date of Birth", type: "date", required: true, example: "2010-04-15", validation: "ISO 8601 YYYY-MM-DD" },
      { field: "Nationality", type: "enum", required: true, example: "ARE", validation: "ISO 3166-1 alpha-3" },
      { field: "Grade Level", type: "enum", required: true, example: "Grade 7", validation: "Pre-K through Grade 13" },
      { field: "Enrollment Date", type: "date", required: true, example: "2024-09-01", validation: "ISO 8601" },
      { field: "School ID", type: "id", required: true, example: "SCH-0042", validation: "KHDA registered school" },
      { field: "SEN Category", type: "enum", required: false, example: "None", validation: "None / Physical / Learning / Gifted / Other" },
      { field: "Curriculum", type: "enum", required: false, example: "British", validation: "British / American / IB / Indian / MoE / Other" },
    ],
  },
  {
    id: "staff",
    label: "Staff & Faculty",
    description: "Teaching staff qualifications, subject areas, employment type, and licensing data.",
    frequency: "Annual",
    icon: "👩‍🏫",
    rowCount: "10–2,000",
    columns: [
      { field: "Staff ID", type: "id", required: true, example: "STF-0092", validation: "Format: STF-XXXX" },
      { field: "Full Name", type: "text", required: true, example: "Sarah Johnson", validation: "Max 120 chars" },
      { field: "Qualification", type: "enum", required: true, example: "Masters", validation: "Diploma / Bachelor / Masters / PhD" },
      { field: "Subject Area", type: "text", required: true, example: "Mathematics", validation: "Standard subject taxonomy" },
      { field: "Employment Type", type: "enum", required: true, example: "Full-time", validation: "Full-time / Part-time / Contract" },
      { field: "Years of Experience", type: "number", required: true, example: "8", validation: "0–60" },
      { field: "License Number", type: "id", required: true, example: "LIC-20240892", validation: "KHDA-issued teacher license" },
      { field: "License Expiry", type: "date", required: true, example: "2026-06-30", validation: "Must be future date" },
    ],
  },
  {
    id: "performance",
    label: "Academic Performance",
    description: "Assessment scores, subject grades, pass/fail rates, and improvement metrics.",
    frequency: "Term",
    icon: "📊",
    rowCount: "500–50,000",
    columns: [
      { field: "Student ID", type: "id", required: true, example: "STU-001234", validation: "Must exist in enrollment" },
      { field: "Subject Code", type: "id", required: true, example: "MATH-07", validation: "Standard subject code" },
      { field: "Assessment Type", type: "enum", required: true, example: "Final Exam", validation: "Quiz / Midterm / Final Exam / Coursework" },
      { field: "Score", type: "number", required: true, example: "87", validation: "0 – Max Score" },
      { field: "Max Score", type: "number", required: true, example: "100", validation: "Positive integer" },
      { field: "Academic Year", type: "text", required: true, example: "2024-2025", validation: "YYYY-YYYY" },
      { field: "Term", type: "enum", required: true, example: "Term 1", validation: "Term 1 / Term 2 / Term 3" },
      { field: "Grade Letter", type: "enum", required: false, example: "B+", validation: "A* A B C D E U" },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure & Safety",
    description: "Campus buildings, classroom capacity, safety inspections, and accessibility data.",
    frequency: "Annual",
    icon: "🏫",
    rowCount: "10–500",
    columns: [
      { field: "School ID", type: "id", required: true, example: "SCH-0042", validation: "KHDA registered school" },
      { field: "Building ID", type: "id", required: true, example: "BLD-003", validation: "Unique within school" },
      { field: "Building Name", type: "text", required: true, example: "Science Block A", validation: "Max 80 chars" },
      { field: "Capacity (Students)", type: "number", required: true, example: "240", validation: "Positive integer" },
      { field: "Condition Score", type: "number", required: true, example: "78", validation: "0–100" },
      { field: "Last Inspection Date", type: "date", required: true, example: "2024-03-10", validation: "ISO 8601" },
      { field: "Accessible (Y/N)", type: "enum", required: true, example: "Y", validation: "Y / N" },
      { field: "Fire Safety Certified", type: "enum", required: true, example: "Y", validation: "Y / N / Pending" },
    ],
  },
];

export const SAMPLE_SOURCE_COLUMNS: Record<string, string[]> = {
  enrollment: ["student_id", "name", "sex", "DOB", "nationality_code", "grade", "enroll_date", "school_id", "sen_type", "curriculum"],
  staff: ["staff_no", "staff_name", "highest_qual", "dept", "emp_status", "exp_years", "license_no", "license_exp"],
  performance: ["stu_id", "subject", "test_type", "marks", "total_marks", "acad_year", "term", "grade_letter"],
  infrastructure: ["school_id", "building_code", "bldg_name", "student_cap", "cond_index", "last_inspect", "wheelchair_access", "fire_cert"],
};

export const MOCK_ISSUES = [
  { row: 14, field: "Student ID", value: "STU-14X", message: "Invalid ID format — expected STU-XXXXXX (6 digits)", severity: "error" as const, ruleCode: "ID-001" },
  { row: 23, field: "Date of Birth", value: "1990/02/30", message: "Invalid date — February has no 30th day", severity: "error" as const, ruleCode: "DATE-002" },
  { row: 45, field: "Nationality", value: "EMRT", message: "Unrecognized code — use ISO 3166-1 alpha-3 (e.g. ARE)", severity: "warning" as const, ruleCode: "ENUM-003" },
  { row: 78, field: "Grade Level", value: "K-14", message: "Grade out of range — valid values: Pre-K through Grade 13", severity: "error" as const, ruleCode: "ENUM-001" },
  { row: 92, field: "Enrollment Date", value: "2025-13-01", message: "Month '13' is invalid — expected 01–12", severity: "error" as const, ruleCode: "DATE-001" },
  { row: 101, field: "Gender", value: "X", message: "Unrecognized code — expected M, F, or U", severity: "warning" as const, ruleCode: "ENUM-002" },
  { row: 134, field: "School ID", value: "SCH-9999", message: "School not found in KHDA registry", severity: "error" as const, ruleCode: "REF-001" },
  { row: 156, field: "Date of Birth", value: "2025-06-15", message: "Student birth date is in the future", severity: "error" as const, ruleCode: "DATE-003" },
  { row: 201, field: "Full Name", value: "", message: "Required field is empty", severity: "error" as const, ruleCode: "REQ-001" },
  { row: 220, field: "Enrollment Date", value: "2019-01-15", message: "Date predates school KHDA registration (2020)", severity: "info" as const, ruleCode: "BIZ-001" },
  { row: 245, field: "SEN Category", value: "Partial", message: "Unrecognized value — expected None / Physical / Learning / Gifted / Other", severity: "warning" as const, ruleCode: "ENUM-004" },
];

export const QUALITY_DIMENSIONS = [
  { name: "Completeness", score: 94, issueCount: 2, description: "Required fields are populated" },
  { name: "Accuracy", score: 87, issueCount: 6, description: "Values conform to expected formats" },
  { name: "Consistency", score: 96, issueCount: 1, description: "Cross-field logic is coherent" },
  { name: "Timeliness", score: 99, issueCount: 0, description: "Dates are within expected ranges" },
  { name: "Uniqueness", score: 100, issueCount: 0, description: "No duplicate records found" },
  { name: "Referential Integrity", score: 89, issueCount: 2, description: "IDs match KHDA registered entities" },
];
