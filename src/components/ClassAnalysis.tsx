/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ScheduleItem } from '../types';
import { 
  Users, AlertTriangle, BookOpen, Search, CheckCircle2, Sliders, Info, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface ClassAnalysisProps {
  items: ScheduleItem[];
}

export default function ClassAnalysis({ items }: ClassAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyConflicts, setOnlyConflicts] = useState(false);

  // Group items by Class
  const classGroups = useMemo(() => {
    const groups: { [classCode: string]: ScheduleItem[] } = {};
    items.forEach(item => {
      if (!item.classCode) return;
      if (!groups[item.classCode]) {
        groups[item.classCode] = [];
      }
      groups[item.classCode].push(item);
    });
    return groups;
  }, [items]);

  // Analyze duplicated lecturers per class
  // Returns map of classCode -> list of duplicate report: { lecturer: string, courses: string[] }
  const duplicateLecturersMap = useMemo(() => {
    const conflicts: { [classCode: string]: Array<{ lecturer: string; courses: string[] }> } = {};

    Object.keys(classGroups).forEach(classCode => {
      const classItems = classGroups[classCode];
      // lecturer -> courseCodes list
      const lecturerCourses: { [lec: string]: string[] } = {};

      classItems.forEach(item => {
        const lec = item.lecturer;
        if (!lec || lec === 'Chưa phân công') return;

        if (!lecturerCourses[lec]) {
          lecturerCourses[lec] = [];
        }
        // Only push if not already in list to avoid counting duplicate items (if any exist due to double rows, though normally not)
        if (!lecturerCourses[lec].includes(item.courseCode)) {
          lecturerCourses[lec].push(item.courseCode);
        }
      });

      // Find those with > 1 courses taught
      const duplicatesForClass = Object.keys(lecturerCourses)
        .filter(lec => lecturerCourses[lec].length > 1)
        .map(lec => ({
          lecturer: lec,
          courses: lecturerCourses[lec]
        }));

      if (duplicatesForClass.length > 0) {
        conflicts[classCode] = duplicatesForClass;
      }
    });

    return conflicts;
  }, [classGroups]);

  // Aggregate stats on duplicate conflicts
  const conflictStats = useMemo(() => {
    const conflictedClasses = Object.keys(duplicateLecturersMap);
    let totalConflicts = 0;
    conflictedClasses.forEach(c => {
      totalConflicts += duplicateLecturersMap[c].length;
    });

    return {
      conflictedClassCount: conflictedClasses.length,
      totalConflicts
    };
  }, [duplicateLecturersMap]);

  // Filter classes based on search and conflict toggle
  const filteredClasses = useMemo(() => {
    let classes = Object.keys(classGroups);

    // Search filter
    if (searchTerm.trim() !== '') {
      classes = classes.filter(cls => cls.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Conflict only filter
    if (onlyConflicts) {
      classes = classes.filter(cls => !!duplicateLecturersMap[cls]);
    }

    // Sort alphabetically
    return classes.sort();
  }, [classGroups, searchTerm, onlyConflicts, duplicateLecturersMap]);

  return (
    <div className="space-y-4" id="class-analysis-tab">
      
      {/* Alert Header on duplicate conflicts - High Density compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Trùng lặp giảng viên dạy cùng lớp</span>
          <div className="flex items-end justify-between mt-2">
            <span className={`text-sm font-bold ${conflictStats.conflictedClassCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {conflictStats.conflictedClassCount} / {Object.keys(classGroups).length} lớp
            </span>
            <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${conflictStats.conflictedClassCount > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              {conflictStats.conflictedClassCount > 0 ? '!' : '✓'}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Cảnh báo lớp có GV dạy từ 2 môn trở lên
          </p>
        </div>

        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-center shadow-sm md:col-span-2 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700 uppercase font-bold text-[10px] block">⚠️ QUY TẮC PHÂN CÔNG TỐI ƯU:</strong>
              Một lớp không nên trùng một thầy/cô đứng lớp cho 2 môn học chuyên ngành khác nhau trong cùng một kỳ học để tạo điều kiện tiếp xúc nhiều giảng viên chuyên môn đa dạng và phân bổ rủi ro tối ưu.
            </div>
          </div>
        </div>

      </div>

      {/* Filters and search controls */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm mã lớp học (vd: CO1303)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-700 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyConflicts(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded uppercase border transition-all cursor-pointer ${
              onlyConflicts 
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Chỉ xem lớp có trùng lặp ({conflictStats.conflictedClassCount})
          </button>
        </div>
      </div>

      {/* Classes Cards Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded border border-slate-200 p-8 text-center text-slate-400">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-600 text-xs uppercase tracking-wider">Không tìm thấy thông tin lớp học nào.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bộ lọc trùng lặp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="classes-grid">
          {filteredClasses.map((classCode) => {
            const classItems = classGroups[classCode];
            const conflicts = duplicateLecturersMap[classCode] || [];
            const major = classItems[0]?.major || 'Chung';

            return (
              <motion.div
                key={classCode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`bg-white rounded border p-3.5 flex flex-col justify-between transition-all hover:shadow-sm ${
                  conflicts.length > 0 
                    ? 'border-amber-300 bg-amber-50/10' 
                    : 'border-slate-200'
                }`}
              >
                {/* Header of class card */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-800 tracking-tight">{classCode}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1 py-0.5 rounded ml-1.5 uppercase">
                        {major}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-medium">
                      Sĩ số: <strong className="text-slate-700">{classItems[0]?.studentCount} SV</strong>
                    </div>
                  </div>

                  {/* Duplicate conflict alert box */}
                  {conflicts.length > 0 && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] space-y-1 text-amber-900">
                      <div className="font-bold flex items-center gap-1 text-amber-800 uppercase text-[9px] tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        TRÙNG LẶP GIẢNG VIÊN
                      </div>
                      {conflicts.map((conf, idx) => (
                        <div key={idx} className="leading-relaxed pl-3.5 list-item list-disc">
                          Thầy/Cô <strong className="font-bold text-slate-850">{conf.lecturer}</strong> phụ trách cả {conf.courses.length} môn ({conf.courses.join(', ')}).
                        </div>
                      ))}
                    </div>
                  )}

                  {/* List of courses in class */}
                  <div className="space-y-1.5 mt-2">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Môn học học kỳ này:</div>
                    <div className="divide-y divide-slate-100">
                      {classItems.map((item) => (
                        <div key={item.id} className="py-1.5 flex items-center justify-between text-xs gap-3">
                          <div className="flex-1 truncate">
                            <span className="font-mono font-bold text-slate-500">{item.courseCode}</span>
                            <span className="text-slate-700 font-semibold ml-1 text-[11px] truncate max-w-[150px] inline-block align-middle" title={item.courseName}>
                              {item.courseName.split('\n')[0]}
                            </span>
                          </div>
                          <div className="shrink-0 text-right">
                            {item.lecturer === 'Chưa phân công' ? (
                              <span className="text-rose-600 font-bold italic bg-rose-50 px-1 py-0.5 rounded text-[10px] border border-rose-100">
                                CHƯA PHÂN CÔNG
                              </span>
                            ) : (
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] border ${
                                conflicts.some(c => c.lecturer === item.lecturer)
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-100'
                              }`}>
                                🧑‍🏫 {item.lecturer}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer status card info */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Số lượng: <b className="text-slate-700">{classItems.length} môn học</b></span>
                  <span>Tổng khối lượng: <b className="text-slate-700">{classItems.reduce((s, i) => s + i.apHours, 0)}h AP</b></span>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
