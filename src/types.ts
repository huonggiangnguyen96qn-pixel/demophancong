/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScheduleItem {
  id: string;          // Unique key: index or custom code
  courseCode: string;  // Môn
  courseName: string;  // Tên môn
  classCode: string;   // Lớp
  major: string;       // Chuyên ngành
  studentCount: number;// Số sinh viên cần học
  part: string;        // Part
  lecturer: string;    // Giảng viên
  apHours: number;     // Số giờ AP
}

export interface LecturerStats {
  name: string;
  totalHours: number;
  totalClasses: number;
  totalCourses: number;
}
