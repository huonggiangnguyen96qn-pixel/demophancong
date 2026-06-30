/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ScheduleItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Clock, Presentation, Layers, Users, TrendingUp, AlertCircle, Sparkles, Filter 
} from 'lucide-react';
import { getColorForString } from '../data';
import { motion } from 'motion/react';

interface LecturerAnalysisProps {
  items: ScheduleItem[];
}

type ChartType = 'HOURS_BY_CLASS' | 'CLASSES_BY_COURSE' | 'COURSES_BY_CLASS';

export default function LecturerAnalysis({ items }: LecturerAnalysisProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('HOURS_BY_CLASS');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Unique active lecturers (excluding 'Chưa phân công')
  const activeLecturers = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.lecturer && item.lecturer !== 'Chưa phân công') {
        set.add(item.lecturer);
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered lecturers based on search
  const filteredLecturers = useMemo(() => {
    return activeLecturers.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeLecturers, searchQuery]);

  // 2. Transformed data for Chart 1: Stacked Hours by Class
  const hoursByClassData = useMemo(() => {
    const classKeysSet = new Set<string>();
    const data = filteredLecturers.map(l => {
      const lecturerItems = items.filter(item => item.lecturer === l);
      const row: any = { name: l };
      
      lecturerItems.forEach(item => {
        const cls = item.classCode || 'Khác';
        row[cls] = (row[cls] || 0) + item.apHours;
        classKeysSet.add(cls);
      });
      return row;
    });

    return {
      data,
      keys: Array.from(classKeysSet).sort()
    };
  }, [items, filteredLecturers]);

  // 3. Transformed data for Chart 2: Stacked Classes by Course
  const classesByCourseData = useMemo(() => {
    const courseKeysSet = new Set<string>();
    const data = filteredLecturers.map(l => {
      const lecturerItems = items.filter(item => item.lecturer === l);
      const row: any = { name: l };

      lecturerItems.forEach(item => {
        const course = item.courseCode || 'Khác';
        row[course] = (row[course] || 0) + 1; // 1 row is 1 class
        courseKeysSet.add(course);
      });
      return row;
    });

    return {
      data,
      keys: Array.from(courseKeysSet).sort()
    };
  }, [items, filteredLecturers]);

  // 4. Transformed data for Chart 3: Stacked Courses by Class
  const coursesByClassData = useMemo(() => {
    const classKeysSet = new Set<string>();
    const data = filteredLecturers.map(l => {
      const lecturerItems = items.filter(item => item.lecturer === l);
      const row: any = { name: l };

      // Map to find unique courses per class
      const classToCoursesMap: { [cls: string]: Set<string> } = {};
      lecturerItems.forEach(item => {
        const cls = item.classCode || 'Khác';
        if (!classToCoursesMap[cls]) {
          classToCoursesMap[cls] = new Set<string>();
        }
        classToCoursesMap[cls].add(item.courseCode);
        classKeysSet.add(cls);
      });

      Object.keys(classToCoursesMap).forEach(cls => {
        row[cls] = classToCoursesMap[cls].size;
      });

      return row;
    });

    return {
      data,
      keys: Array.from(classKeysSet).sort()
    };
  }, [items, filteredLecturers]);

  // Summary Metrics per lecturer for table listing
  const lecturerSummaryList = useMemo(() => {
    return activeLecturers.map(l => {
      const lecturerItems = items.filter(item => item.lecturer === l);
      const totalHours = lecturerItems.reduce((sum, item) => sum + item.apHours, 0);
      const totalClasses = lecturerItems.length;
      const uniqueCourses = new Set(lecturerItems.map(item => item.courseCode)).size;

      return {
        name: l,
        totalHours,
        totalClasses,
        uniqueCourses,
      };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [items, activeLecturers]);

  // Highlights
  const statisticsSummary = useMemo(() => {
    if (lecturerSummaryList.length === 0) return null;
    const maxHours = lecturerSummaryList[0];
    const minHours = lecturerSummaryList[lecturerSummaryList.length - 1];
    
    const averageHours = Math.round(
      lecturerSummaryList.reduce((sum, l) => sum + l.totalHours, 0) / lecturerSummaryList.length
    );

    return {
      maxHours,
      minHours,
      averageHours,
      totalCount: lecturerSummaryList.length
    };
  }, [lecturerSummaryList]);

  return (
    <div className="space-y-4" id="lecturer-analysis-tab">
      
      {/* Overview stats cards - High Density compact theme */}
      {statisticsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Giảng viên nhiều giờ nhất</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-sm font-bold text-slate-800">{statisticsSummary.maxHours.name}</span>
              <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                MAX
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              {statisticsSummary.maxHours.totalHours} giờ ({statisticsSummary.maxHours.totalClasses} lớp)
            </p>
          </div>

          <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Giảng viên ít giờ nhất</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-sm font-bold text-slate-800">{statisticsSummary.minHours.name}</span>
              <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                MIN
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              {statisticsSummary.minHours.totalHours} giờ ({statisticsSummary.minHours.totalClasses} lớp)
            </p>
          </div>

          <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Số giờ dạy TB / Giảng viên</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-sm font-bold text-slate-800">{statisticsSummary.averageHours} giờ / kỳ</span>
              <div className="w-7 h-7 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Tổng số GV được phân công: {statisticsSummary.totalCount}
            </p>
          </div>
        </div>
      )}

      {/* Main Charts area */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-4 space-y-4">
        
        {/* Header and Toggle buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              BIỂU ĐỒ THỐNG KÊ XẾP CHỒNG (STACKED CHARTS)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Phân tích cơ cấu phân công theo: Số giờ dạy, số lớp đảm nhận, số môn học giảng dạy.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded border border-slate-200 self-start md:self-center gap-0.5">
            <button
              onClick={() => setActiveChart('HOURS_BY_CLASS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase transition-all cursor-pointer ${
                activeChart === 'HOURS_BY_CLASS'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              CƠ CẤU GIỜ (LỚP)
            </button>
            <button
              onClick={() => setActiveChart('CLASSES_BY_COURSE')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase transition-all cursor-pointer ${
                activeChart === 'CLASSES_BY_COURSE'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              CƠ CẤU LỚP (MÔN)
            </button>
            <button
              onClick={() => setActiveChart('COURSES_BY_CLASS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase transition-all cursor-pointer ${
                activeChart === 'COURSES_BY_CLASS'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              CƠ CẤU MÔN (LỚP)
            </button>
          </div>
        </div>

        {/* Filter input */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 max-w-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Lọc tên giảng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-700 font-medium"
          />
        </div>

        {/* Recharts Stacked Chart display */}
        <div className="h-[320px] w-full bg-slate-50/20 p-2 rounded border border-slate-100 relative">
          {activeLecturers.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
              Chưa có dữ liệu phân công để hiển thị biểu đồ.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'HOURS_BY_CLASS' ? (
                <BarChart
                  data={hoursByClassData.data}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '6px' }}
                    cursor={{fill: 'rgba(241, 245, 249, 0.4)'}}
                  />
                  <Legend iconSize={6} iconType="square" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                  {hoursByClassData.keys.map((cls) => (
                    <Bar 
                      key={cls} 
                      dataKey={cls} 
                      stackId="hours" 
                      fill={getColorForString(cls)} 
                      name={`Lớp ${cls}`}
                    />
                  ))}
                </BarChart>
              ) : activeChart === 'CLASSES_BY_COURSE' ? (
                <BarChart
                  data={classesByCourseData.data}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '6px' }}
                    cursor={{fill: 'rgba(241, 245, 249, 0.4)'}}
                  />
                  <Legend iconSize={6} iconType="square" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                  {classesByCourseData.keys.map((course) => (
                    <Bar 
                      key={course} 
                      dataKey={course} 
                      stackId="classes" 
                      fill={getColorForString(course)} 
                      name={`Môn ${course}`}
                    />
                  ))}
                </BarChart>
              ) : (
                <BarChart
                  data={coursesByClassData.data}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '6px' }}
                    cursor={{fill: 'rgba(241, 245, 249, 0.4)'}}
                  />
                  <Legend iconSize={6} iconType="square" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                  {coursesByClassData.keys.map((cls) => (
                    <Bar 
                      key={cls} 
                      dataKey={cls} 
                      stackId="courses" 
                      fill={getColorForString(cls)} 
                      name={`Lớp ${cls}`}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-start gap-2 text-[10px] text-slate-500">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700 uppercase">Hướng dẫn đọc biểu đồ xếp chồng: </span>
            <ul className="list-disc list-inside mt-0.5 space-y-0.5">
              <li><b>Cơ cấu Số giờ:</b> Hiển thị tổng tải trọng AP (cột dọc) của từng giảng viên. Các màu sắc phân biệt phần giờ dạy đóng góp từ các <b>Lớp học khác nhau</b>.</li>
              <li><b>Cơ cấu Số lớp:</b> Hiển thị số lượng lớp giảng viên đảm nhiệm. Các phần màu tương ứng với các <b>Môn học khác nhau</b>.</li>
              <li><b>Cơ cấu Số môn:</b> Hiển thị số môn chuyên môn giảng viên phụ trách. Màu sắc chia theo các <b>Lớp học khác nhau</b>.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Lecturer stats summary list */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Bảng Thống Kê Chi Tiết Giảng Viên
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-150">
                <th className="p-2.5 font-semibold">Tên Giảng viên</th>
                <th className="p-2.5 font-semibold text-center">Tổng số giờ AP</th>
                <th className="p-2.5 font-semibold text-center">Số lớp đảm trách</th>
                <th className="p-2.5 font-semibold text-center">Số môn phụ trách</th>
                <th className="p-2.5 font-semibold">Các lớp phân công chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {lecturerSummaryList.map((item) => {
                const classesTaught = Array.from(
                  new Set(items.filter(row => row.lecturer === item.name).map(row => row.classCode))
                ).join(', ');

                return (
                  <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-800">
                      🧑‍🏫 {item.name}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-blue-600">
                      {item.totalHours} AP
                    </td>
                    <td className="p-2.5 text-center font-semibold text-slate-600">
                      {item.totalClasses} lớp
                    </td>
                    <td className="p-2.5 text-center font-semibold text-slate-600">
                      {item.uniqueCourses} môn
                    </td>
                    <td className="p-2.5 text-slate-500 truncate max-w-[280px]" title={classesTaught}>
                      {classesTaught || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
