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
      {
        field: "Student ID", type: "id", required: true, example: "STU-001234",
        validation: "Format: STU- followed by exactly 6 digits",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format STU-XXXXXX (STU- prefix + 6 digits)", idPrefix: "STU-", idDigits: 6, pattern: "^STU-\\d{6}$" },
          { code: "ID-002", severity: "error", description: "Must be unique across the dataset", unique: true },
        ],
      },
      {
        field: "Full Name", type: "text", required: true, example: "Ahmed Al-Mansouri",
        validation: "Max 120 characters, non-empty",
        rules: [
          { code: "BIZ-002", severity: "warning", description: "Must not exceed 120 characters", maxLength: 120 },
        ],
      },
      {
        field: "Gender", type: "enum", required: true, example: "M",
        validation: "Allowed values: M, F, U",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: M, F, U", allowedValues: ["M", "F", "U"] },
        ],
      },
      {
        field: "Date of Birth", type: "date", required: true, example: "4/15/2010",
        validation: "M/D/YYYY format, must be in the past",
        rules: [
          { code: "DATE-001", severity: "error", description: "Must be valid date in M/D/YYYY format", pattern: "^\\d{1,2}/\\d{1,2}/\\d{4}$" },
          { code: "DATE-003", severity: "error", description: "Date of birth must be in the past (not today or future)", dateConstraint: "past" },
        ],
      },
      {
        field: "Nationality", type: "enum", required: true, example: "ARE",
        validation: "ISO 3166-1 alpha-3 code (3 uppercase letters)",
        rules: [
          { code: "ENUM-002", severity: "warning", description: "Must be a valid ISO 3166-1 alpha-3 country code (3 uppercase letters)", pattern: "^[A-Z]{3}$" },
        ],
      },
      {
        field: "Grade Level", type: "enum", required: true, example: "Grade 7",
        validation: "Allowed values: Pre-K, KG1, KG2, Grade 1 through Grade 13",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Pre-K, KG1, KG2, Grade 1–Grade 13", allowedValues: ["Pre-K", "KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Grade 13"] },
        ],
      },
      {
        field: "Enrollment Date", type: "date", required: true, example: "9/1/2024",
        validation: "M/D/YYYY format",
        rules: [
          { code: "DATE-001", severity: "error", description: "Must be valid date in M/D/YYYY format", pattern: "^\\d{1,2}/\\d{1,2}/\\d{4}$" },
        ],
      },
      {
        field: "School ID", type: "id", required: true, example: "SCH-0042",
        validation: "Format: SCH- followed by exactly 4 digits",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format SCH-XXXX (SCH- prefix + 4 digits)", idPrefix: "SCH-", idDigits: 4, pattern: "^SCH-\\d{4}$" },
        ],
      },
      {
        field: "SEN Category", type: "enum", required: false, example: "None",
        validation: "Allowed values: None, Physical, Learning, Gifted, Other",
        rules: [
          { code: "ENUM-001", severity: "warning", description: "Must be one of: None, Physical, Learning, Gifted, Other", allowedValues: ["None", "Physical", "Learning", "Gifted", "Other"] },
        ],
      },
      {
        field: "Curriculum", type: "enum", required: false, example: "British",
        validation: "Allowed values: British, American, IB, Indian, MoE, Other",
        rules: [
          { code: "ENUM-001", severity: "warning", description: "Must be one of: British, American, IB, Indian, MoE, Other", allowedValues: ["British", "American", "IB", "Indian", "MoE", "Other"] },
        ],
      },
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
      {
        field: "Staff ID", type: "id", required: true, example: "STF-0092",
        validation: "Format: STF- followed by exactly 4 digits",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format STF-XXXX (STF- prefix + 4 digits)", idPrefix: "STF-", idDigits: 4, pattern: "^STF-\\d{4}$" },
          { code: "ID-002", severity: "error", description: "Must be unique across the dataset", unique: true },
        ],
      },
      {
        field: "Full Name", type: "text", required: true, example: "Sarah Johnson",
        validation: "Max 120 characters, non-empty",
        rules: [
          { code: "BIZ-002", severity: "warning", description: "Must not exceed 120 characters", maxLength: 120 },
        ],
      },
      {
        field: "Qualification", type: "enum", required: true, example: "Masters",
        validation: "Allowed values: Diploma, Bachelor, Masters, PhD",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Diploma, Bachelor, Masters, PhD", allowedValues: ["Diploma", "Bachelor", "Masters", "PhD"] },
        ],
      },
      {
        field: "Subject Area", type: "text", required: true, example: "Mathematics",
        validation: "Max 80 characters, non-empty",
        rules: [
          { code: "BIZ-002", severity: "warning", description: "Must not exceed 80 characters", maxLength: 80 },
        ],
      },
      {
        field: "Employment Type", type: "enum", required: true, example: "Full-time",
        validation: "Allowed values: Full-time, Part-time, Contract",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Full-time, Part-time, Contract", allowedValues: ["Full-time", "Part-time", "Contract"] },
        ],
      },
      {
        field: "Years of Experience", type: "number", required: true, example: "8",
        validation: "Integer between 0 and 60",
        rules: [
          { code: "BIZ-001", severity: "error", description: "Must be a valid number between 0 and 60", min: 0, max: 60 },
        ],
      },
      {
        field: "License Number", type: "id", required: true, example: "LIC-20240892",
        validation: "Format: LIC- followed by 8 digits",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format LIC-XXXXXXXX (LIC- prefix + 8 digits)", idPrefix: "LIC-", idDigits: 8, pattern: "^LIC-\\d{8}$" },
          { code: "ID-002", severity: "error", description: "Must be unique across the dataset", unique: true },
        ],
      },
      {
        field: "License Expiry", type: "date", required: true, example: "6/30/2026",
        validation: "M/D/YYYY format, must be a future date",
        rules: [
          { code: "DATE-001", severity: "error", description: "Must be valid date in M/D/YYYY format", pattern: "^\\d{1,2}/\\d{1,2}/\\d{4}$" },
          { code: "DATE-004", severity: "warning", description: "License expiry date should be in the future", dateConstraint: "future" },
        ],
      },
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
      {
        field: "Student ID", type: "id", required: true, example: "STU-001234",
        validation: "Format: STU- followed by exactly 6 digits (must exist in enrollment)",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format STU-XXXXXX (STU- prefix + 6 digits)", idPrefix: "STU-", idDigits: 6, pattern: "^STU-\\d{6}$" },
        ],
      },
      {
        field: "Subject Code", type: "id", required: true, example: "MATH-07",
        validation: "Format: 2–6 uppercase letters, hyphen, 2 digits",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format XXXX-NN (2-6 uppercase letters + hyphen + 2 digits)", pattern: "^[A-Z]{2,6}-\\d{2}$" },
        ],
      },
      {
        field: "Assessment Type", type: "enum", required: true, example: "Final Exam",
        validation: "Allowed values: Quiz, Midterm, Final Exam, Coursework",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Quiz, Midterm, Final Exam, Coursework", allowedValues: ["Quiz", "Midterm", "Final Exam", "Coursework"] },
        ],
      },
      {
        field: "Score", type: "number", required: true, example: "87",
        validation: "Number between 0 and Max Score",
        rules: [
          { code: "BIZ-001", severity: "error", description: "Must be a valid number >= 0", min: 0 },
        ],
      },
      {
        field: "Max Score", type: "number", required: true, example: "100",
        validation: "Positive integer (> 0)",
        rules: [
          { code: "BIZ-001", severity: "error", description: "Must be a positive integer greater than 0", min: 1 },
        ],
      },
      {
        field: "Academic Year", type: "text", required: true, example: "2024-2025",
        validation: "Format: YYYY-YYYY (consecutive years)",
        rules: [
          { code: "BIZ-003", severity: "error", description: "Must match YYYY-YYYY format with consecutive years", pattern: "^\\d{4}-\\d{4}$" },
        ],
      },
      {
        field: "Term", type: "enum", required: true, example: "Term 1",
        validation: "Allowed values: Term 1, Term 2, Term 3",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Term 1, Term 2, Term 3", allowedValues: ["Term 1", "Term 2", "Term 3"] },
        ],
      },
      {
        field: "Grade Letter", type: "enum", required: false, example: "B+",
        validation: "Allowed values: A*, A, B, C, D, E, U",
        rules: [
          { code: "ENUM-001", severity: "warning", description: "Must be one of: A*, A, B, C, D, E, U", allowedValues: ["A*", "A", "B", "C", "D", "E", "U"] },
        ],
      },
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
      {
        field: "School ID", type: "id", required: true, example: "SCH-0042",
        validation: "Format: SCH- followed by exactly 4 digits",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format SCH-XXXX (SCH- prefix + 4 digits)", idPrefix: "SCH-", idDigits: 4, pattern: "^SCH-\\d{4}$" },
        ],
      },
      {
        field: "Building ID", type: "id", required: true, example: "BLD-003",
        validation: "Format: BLD- followed by exactly 3 digits, unique within dataset",
        rules: [
          { code: "ID-001", severity: "error", description: "Must match format BLD-XXX (BLD- prefix + 3 digits)", idPrefix: "BLD-", idDigits: 3, pattern: "^BLD-\\d{3}$" },
          { code: "ID-002", severity: "error", description: "Must be unique across the dataset", unique: true },
        ],
      },
      {
        field: "Building Name", type: "text", required: true, example: "Science Block A",
        validation: "Max 80 characters, non-empty",
        rules: [
          { code: "BIZ-002", severity: "warning", description: "Must not exceed 80 characters", maxLength: 80 },
        ],
      },
      {
        field: "Capacity (Students)", type: "number", required: true, example: "240",
        validation: "Positive integer between 1 and 10000",
        rules: [
          { code: "BIZ-001", severity: "error", description: "Must be a positive integer between 1 and 10000", min: 1, max: 10000 },
        ],
      },
      {
        field: "Condition Score", type: "number", required: true, example: "78",
        validation: "Integer between 0 and 100",
        rules: [
          { code: "BIZ-001", severity: "error", description: "Must be a number between 0 and 100", min: 0, max: 100 },
        ],
      },
      {
        field: "Last Inspection Date", type: "date", required: true, example: "3/10/2024",
        validation: "M/D/YYYY format, must be in the past or today",
        rules: [
          { code: "DATE-001", severity: "error", description: "Must be valid date in M/D/YYYY format", pattern: "^\\d{1,2}/\\d{1,2}/\\d{4}$" },
          { code: "DATE-005", severity: "warning", description: "Inspection date should be in the past or today", dateConstraint: "pastOrToday" },
        ],
      },
      {
        field: "Accessible (Y/N)", type: "enum", required: true, example: "Y",
        validation: "Allowed values: Y, N",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Y, N", allowedValues: ["Y", "N"] },
        ],
      },
      {
        field: "Fire Safety Certified", type: "enum", required: true, example: "Y",
        validation: "Allowed values: Y, N, Pending",
        rules: [
          { code: "ENUM-001", severity: "error", description: "Must be one of: Y, N, Pending", allowedValues: ["Y", "N", "Pending"] },
        ],
      },
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
  { row: 23, field: "Date of Birth", value: "13/30/1990", message: "Invalid date — expected M/D/YYYY format", severity: "error" as const, ruleCode: "DATE-001" },
  { row: 45, field: "Nationality", value: "EMRT", message: "Unrecognized code — must be a 3-letter ISO 3166-1 alpha-3 code (e.g. ARE)", severity: "warning" as const, ruleCode: "ENUM-002" },
  { row: 78, field: "Grade Level", value: "K-14", message: "Grade out of range — must be one of: Pre-K, KG1, KG2, Grade 1–Grade 13", severity: "error" as const, ruleCode: "ENUM-001" },
  { row: 92, field: "Enrollment Date", value: "13/1/2025", message: "Month '13' is invalid — expected 1–12", severity: "error" as const, ruleCode: "DATE-002" },
  { row: 101, field: "Gender", value: "X", message: "Unrecognized code — must be one of: M, F, U", severity: "error" as const, ruleCode: "ENUM-001" },
  { row: 134, field: "School ID", value: "SCH-9999", message: "Invalid format — expected SCH- followed by 4 digits", severity: "error" as const, ruleCode: "ID-001" },
  { row: 156, field: "Date of Birth", value: "6/15/2025", message: "Date of birth must be in the past", severity: "error" as const, ruleCode: "DATE-003" },
  { row: 201, field: "Full Name", value: "", message: "Required field is empty", severity: "error" as const, ruleCode: "REQ-001" },
  { row: 220, field: "Enrollment Date", value: "1/15/2019", message: "Date predates school KHDA registration (2020)", severity: "info" as const, ruleCode: "BIZ-001" },
  { row: 245, field: "SEN Category", value: "Partial", message: "Unrecognized value — must be one of: None, Physical, Learning, Gifted, Other", severity: "warning" as const, ruleCode: "ENUM-001" },
];

export const QUALITY_DIMENSIONS = [
  { name: "Completeness", score: 94, issueCount: 2, description: "Required fields are populated" },
  { name: "Accuracy", score: 87, issueCount: 6, description: "Values conform to expected formats" },
  { name: "Consistency", score: 96, issueCount: 1, description: "Cross-field logic is coherent" },
  { name: "Timeliness", score: 99, issueCount: 0, description: "Dates are within expected ranges" },
  { name: "Uniqueness", score: 100, issueCount: 0, description: "No duplicate records found" },
  { name: "Referential Integrity", score: 89, issueCount: 2, description: "IDs match KHDA registered entities" },
];

export const SAMPLE_SOURCE_DATA: Record<string, Record<string, string[]>> = {
  enrollment: {
    student_id: ["STU-001234", "STU-001235", "STU-001236"],
    name: ["Ahmed Al-Mansouri", "Fatima Hassan", "James Wilson"],
    sex: ["M", "F", "M"],
    DOB: ["4/15/2010", "11/2/2009", "6/30/2008"],
    nationality_code: ["ARE", "IND", "GBR"],
    grade: ["Grade 7", "Grade 7", "Grade 8"],
    enroll_date: ["9/1/2024", "9/1/2024", "9/1/2023"],
    school_id: ["SCH-0042", "SCH-0042", "SCH-0042"],
    sen_type: ["None", "Learning", "None"],
    curriculum: ["British", "IB", "American"],
  },
  staff: {
    staff_no: ["STF-0092", "STF-0093", "STF-0094"],
    staff_name: ["Sarah Johnson", "Mohammed Ali", "Elena Torres"],
    highest_qual: ["Masters", "PhD", "Bachelor"],
    dept: ["Mathematics", "Science", "English"],
    emp_status: ["Full-time", "Full-time", "Part-time"],
    exp_years: ["8", "12", "3"],
    license_no: ["LIC-20240892", "LIC-20230155", "LIC-20240601"],
    license_exp: ["6/30/2026", "12/31/2025", "9/15/2026"],
  },
  performance: {
    stu_id: ["STU-001234", "STU-001235", "STU-001236"],
    subject: ["MATH-07", "ENG-07", "SCI-08"],
    test_type: ["Final Exam", "Midterm", "Quiz"],
    marks: ["87", "92", "45"],
    total_marks: ["100", "100", "50"],
    acad_year: ["2024-2025", "2024-2025", "2024-2025"],
    term: ["Term 1", "Term 1", "Term 2"],
    grade_letter: ["B+", "A", "C"],
  },
  infrastructure: {
    school_id: ["SCH-0042", "SCH-0043", "SCH-0042"],
    building_code: ["BLD-003", "BLD-001", "BLD-007"],
    bldg_name: ["Science Block A", "Main Hall", "Sports Complex"],
    student_cap: ["240", "500", "120"],
    cond_index: ["78", "92", "65"],
    last_inspect: ["3/10/2024", "1/15/2024", "11/20/2023"],
    wheelchair_access: ["Y", "Y", "N"],
    fire_cert: ["Y", "Y", "Pending"],
  },
};
