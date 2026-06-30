/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScheduleItem } from './types';

export const DEFAULT_CSV_DATA = `Môn;Tên môn;Lớp;Chuyên ngành;Số sinh viên cần học;Part;Giảng viên;Số giờ AP
AMD201;"Advanced Microservices Development and Deployment
- System Design
- Microservices Architechture
- Cloud Computing";CO1303;3+0 COMP&AI;21;2 Part;longndt;45
AMD201;"Advanced Microservices Development and Deployment
- System Design
- Microservices Architechture
- Cloud Computing";CO1302;3+0 COMP&AI;28;2 Part;longndt;45
COMP1551;Application Development ;CO1304;3+0 COMP&AI;22;2 Part;cuonghd7;48
COMP1589;Computer Systems and Internet Technologies ;CO1403;;18;2 Part;thoatt6;48
COMP1589;Computer Systems and Internet Technologies ;CO1402;;18;2 Part;thoatt6;48
COMP1643 ;Information and Content Management ;CO1205-Eng;3+0;10;2 Part;nathb;36
COMP1649;Human Computer Interaction and Design;TCH2902;TopUp-IT;23;2 Part;nathb;36
COMP1649;Human Computer Interaction and Design;CO1301;3+0 COMP&AI;25;2 Part;nathb;36
COMP1682.1;Final Year Projects Part 1;TCH2902;TopUp-IT;12;2 Part;tungdt2;18
COMP1682.1;"Final Year Projects
- Proposal guidance and literature review
- Generative AI in application development";CO1205-Eng;3+0;7;2 Part;tungdt2;45
COMP1682.2;Final Year Projects Part 2 - Front-end;TCH2902.1;TopUp-IT;12;2 Part;longndt;15
COMP1682.2;Final Year Projects Part 2 - Back-end;TCH2902.2;TopUp-IT;12;2 Part;longndt;15
COMP1682.2;Final Year Projects Part 2 - Game;TCH2902.3;TopUp-IT;12;2 Part;longndt;15
COMP1682.2;"Final Year Projects
- Project supervision";CO1301.1;3+0 COMP&AI;25;2 Part;tungdt2;15
COMP1682.2;"Final Year Projects
- Project supervision";CO1301.2;3+0 COMP&AI;25;2 Part;longndt;15
COMP1682.2;"Final Year Projects
- Project supervision";CO1301.3;3+0 COMP&AI;25;2 Part;thoatt6;15
COMP1682.2;"Final Year Projects
- DevOps specialization";CO1301;3+0 COMP&AI;25;2 Part;longndt;15
COMP1682.3;Final Year Projects Part 3;TCH2901.1;TopUp-IT;11;2 Part;thoatt6;18
COMP1682.3;Final Year Projects Part 3;TCH2901.2;TopUp-IT;11;2 Part;longndt;18
COMP1682.3;Final Year Projects Part 3;COMP1682 RE FA26;TopUp-IT;7;2 Part;tungntl;18
COMP1682.3;Final Year Projects Part 3;CO1203-04-05 5;3+0;10;2 Part;thoatt6;18
COMP1682.3;Final Year Projects Part 3;CO1203-04-05 4;3+0;9;2 Part;thoatt6;18
COMP1682.3;Final Year Projects Part 3;CO1203-04-05 3;3+0;10;2 Part;huongvd6;18
COMP1682.3;Final Year Projects Part 3;CO1203-04-05 2;3+0;10;2 Part;huongvd6;18
COMP1682.3;Final Year Projects Part 3;CO1203-04-05 1;3+0;10;2 Part;quandh13;18
COMP1752;Object Oriented Programming ;CO1403;;18;2 Part;quandh13;48
COMP1752;Object Oriented Programming ;CO1402;;18;2 Part;quandh13;48
COMP1753;Programming Foundations ;CO1501;3+0;20;2 Part;tungdt2;48
COMP1770;Professional Project Management ;CO1401;3+0 COMP&AI;25;2 Part;thoatt6;48
COMP1773;User Interface Design ;CO1401;3+0 COMP&AI;25;2 Part;nathb;48
COMP1786;Mobile Application Design And Development;TCH2902;TopUp-IT;20;2 Part;longndt;36
COMP1786;Mobile Application Design And Development;CO1205-Eng;3+0;10;2 Part;longndt;36
COMP1787;Requirements Management;CO1301;3+0 COMP&AI;25;2 Part;omar;36
COMP1807;Agile Development with SCRUM ;CO1304;3+0 COMP&AI;22;2 Part;omar;48
COMP1810;Data and Web Analytics;CO1304;3+0 COMP;19;2 Part;quandh13;48
COMP1841;Web Programming 1 ;CO1401;3+0 COMP&AI;25;2 Part;huongvd6;48
COMP1842;Web Programming 2 ;CO1303;3+0 COMP&AI;21;2 Part;huongvd6;48
COMP1842;Web Programming 2 ;CO1302;3+0 COMP&AI;28;2 Part;thoatt6;48
COMP1843;Principles of Security ;CO1403;;18;2 Part;omar;48
COMP1843;Principles of Security ;CO1402;;18;2 Part;omar;48
COMP1844;Information Analysis and Visualisation ;CO1303;3+0 COMP&AI;21;2 Part;nathb;48
COMP1844;Information Analysis and Visualisation ;CO1302;3+0 COMP&AI;28;2 Part;nathb;48
COMP1845;Systems Development ;CO1404;3+0 COMP&AI;10;2 Part;tungntl;48
COMP1856;Software Engineering;CO1501;3+0;20;2 Part;tungntl;48
COMP1857;Introduction to Data Science;CO1404;3+0 COMP&AI;10;2 Part;omar;48
COMP1858;Data Structures and Algorithms;CO1303;3+0 COMP&AI;21;2 Part;quandh13;48
COMP1858;Data Structures and Algorithms;CO1302;3+0 COMP&AI;28;2 Part;quandh13;48
MACG101;Advanced math for Computer Science;CO1401;;10;2 Part;tungntl;45
MATH1179;Mathematics for Computer Science ;CO1404;3+0 COMP&AI;10;2 Part;tungntl;48`;

export function parseCSV(text: string, delimiter: string = ';'): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(currentField.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        result.push(row);
      }
      row = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  if (currentField !== '' || row.length > 0) {
    row.push(currentField.trim());
    if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
      result.push(row);
    }
  }

  return result;
}

export function convertCSVToScheduleItems(csvRows: string[][]): ScheduleItem[] {
  if (csvRows.length < 2) return [];
  
  // Find header indices
  const header = csvRows[0].map(h => h.toLowerCase());
  const idxCourse = header.findIndex(h => h === 'môn');
  const idxName = header.findIndex(h => h === 'tên môn');
  const idxClass = header.findIndex(h => h === 'lớp');
  const idxMajor = header.findIndex(h => h === 'chuyên ngành');
  const idxStudents = header.findIndex(h => h === 'số sinh viên cần học');
  const idxPart = header.findIndex(h => h === 'part');
  const idxLecturer = header.findIndex(h => h === 'giảng viên');
  const idxHours = header.findIndex(h => h === 'số giờ ap');

  const items: ScheduleItem[] = [];

  for (let i = 1; i < csvRows.length; i++) {
    const r = csvRows[i];
    if (r.length < 2) continue; // skip empty or incomplete lines

    const courseCode = idxCourse !== -1 && r[idxCourse] ? r[idxCourse] : '';
    const courseName = idxName !== -1 && r[idxName] ? r[idxName] : '';
    const classCode = idxClass !== -1 && r[idxClass] ? r[idxClass] : '';
    const major = idxMajor !== -1 && r[idxMajor] ? r[idxMajor] : '';
    const studentCount = idxStudents !== -1 && r[idxStudents] ? parseInt(r[idxStudents], 10) || 0 : 0;
    const part = idxPart !== -1 && r[idxPart] ? r[idxPart] : '';
    const lecturer = idxLecturer !== -1 && r[idxLecturer] ? r[idxLecturer] : 'Chưa phân công';
    const apHours = idxHours !== -1 && r[idxHours] ? parseFloat(r[idxHours]) || 0 : 0;

    items.push({
      id: `${courseCode}-${classCode}-${i}`,
      courseCode,
      courseName,
      classCode,
      major,
      studentCount,
      part,
      lecturer: lecturer || 'Chưa phân công',
      apHours,
    });
  }

  return items;
}

export function getDefaultScheduleItems(): ScheduleItem[] {
  const parsed = parseCSV(DEFAULT_CSV_DATA, ';');
  return convertCSVToScheduleItems(parsed);
}

export const CHART_PALETTE = [
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#ec4899', // pink
  '#f97316', // orange
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f43f5e', // rose
  '#eab308', // yellow
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#22c55e', // green
  '#84cc16', // lime
  '#d946ef', // fuchsia
  '#0284c7', // light blue
  '#b45309', // amber
];

export function getColorForString(str: string): string {
  if (!str || str === 'Chưa phân công') return '#94a3b8'; // slate 400
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CHART_PALETTE.length;
  return CHART_PALETTE[index];
}

