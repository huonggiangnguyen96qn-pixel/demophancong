/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ScheduleItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  GraduationCap, Users, BookOpen, AlertCircle, ArrowUpRight, ArrowDownRight, Award, Trophy
} from 'lucide-react';
import { getColorForString } from '../data';
import { motion } from 'motion/react';

interface CourseAnalysisProps {
  items: ScheduleItem[];
}

export default function CourseAnalysis({ items }: CourseAnalysisProps) {
  const [activeMetric, setActiveMetric] = useState<'STUDENTS' | 'LECTURERS'>('STUDENTS');

  // Compute stats per course
  const courseStatsList = useMemo(() => {
    const courseMap: { 
      [code: string]: { 
        code: string; 
        name: string; 
        studentCount: number; 
        lecturers: Set<string>; 
        classCount: number; 
      } 
    } = {};

    items.forEach(item => {
      const code = item.courseCode;
      if (!courseMap[code]) {
        courseMap[code] = {
          code,
          name: item.courseName.split('\n')[0].trim(),
          studentCount: 0,
          lecturers: new Set<string>(),
          classCount: 0
        };
      }
      courseMap[code].studentCount += item.studentCount;
      courseMap[code].classCount += 1;
      if (item.lecturer && item.lecturer !== 'Chưa phân công') {
        courseMap[code].lecturers.add(item.lecturer);
      }
    });

    return Object.values(courseMap).map(g => ({
      code: g.code,
      name: g.name,
      studentCount: g.studentCount,
      lecturerCount: g.lecturers.size,
      lecturersList: Array.from(g.lecturers),
      lecturersText: Array.from(g.lecturers).join(', ') || 'Chưa phân công',
      classCount: g.classCount
    }));
  }, [items]);

  // Find course with most unique lecturers
  const courseWithMostLecturers = useMemo(() => {
    if (courseStatsList.length === 0) return null;
    return [...courseStatsList].sort((a, b) => b.lecturerCount - a.lecturerCount)[0];
  }, [courseStatsList]);

  // Find course with fewest unique lecturers
  const courseWithFewestLecturers = useMemo(() => {
    if (courseStatsList.length === 0) return null;
    // We only consider courses that have at least 1 lecturer assigned, or if none, 0
    return [...courseStatsList].sort((a, b) => a.lecturerCount - b.lecturerCount)[0];
  }, [courseStatsList]);

  // Find course with most students
  const courseWithMostStudents = useMemo(() => {
    if (courseStatsList.length === 0) return null;
    return [...courseStatsList].sort((a, b) => b.studentCount - a.studentCount)[0];
  }, [courseStatsList]);

  // Chart data sorting
  const chartData = useMemo(() => {
    if (activeMetric === 'STUDENTS') {
      return [...courseStatsList].sort((a, b) => b.studentCount - a.studentCount);
    } else {
      return [...courseStatsList].sort((a, b) => b.lecturerCount - a.lecturerCount);
    }
  }, [courseStatsList, activeMetric]);

  return (
    <div className="space-y-4" id="course-analysis-tab">
      
      {/* High-level KPIs - High Density compact theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Most Lecturers */}
        {courseWithMostLecturers && (
          <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Nhiều giảng viên nhất</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-sm font-bold text-slate-800 font-mono">{courseWithMostLecturers.code}</span>
              <div className="w-7 h-7 rounded bg-amber-50 flex items-center justify-center text-amber-600">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-1" title={courseWithMostLecturers.lecturersText}>
              {courseWithMostLecturers.lecturerCount} giảng viên • {courseWithMostLecturers.lecturersText}
            </p>
          </div>
        )}

        {/* Fewest Lecturers */}
        {courseWithFewestLecturers && (
          <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Ít giảng viên nhất</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-sm font-bold text-slate-800 font-mono">{courseWithFewestLecturers.code}</span>
              <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-1" title={courseWithFewestLecturers.lecturersText}>
              {courseWithFewestLecturers.lecturerCount} giảng viên • {courseWithFewestLecturers.lecturersText}
            </p>
          </div>
        )}

        {/* Most Students */}
        {courseWithMostStudents && (
          <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Quy mô học viên lớn nhất</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-sm font-bold text-slate-800 font-mono">{courseWithMostStudents.code}</span>
              <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-1">
              {courseWithMostStudents.studentCount} Sinh viên • {courseWithMostStudents.name}
            </p>
          </div>
        )}

        {/* Total Unique Courses */}
        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Tổng số môn học kỳ</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-sm font-bold text-slate-800">{courseStatsList.length} Học phần</span>
            <div className="w-7 h-7 rounded bg-teal-50 flex items-center justify-center text-teal-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Phân phối mở cho các chuyên ngành CNTT
          </p>
        </div>

      </div>

      {/* Graphical Chart */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-4 space-y-4">
        
        {/* Toggle & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              BIỂU ĐỒ SO SÁNH GIỮA CÁC MÔN HỌC
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Xem quy mô số lượng học viên hoặc số giảng viên dạy của từng môn học.
            </p>
          </div>

          <div className="inline-flex p-0.5 bg-slate-100 rounded border border-slate-200 self-start sm:self-center gap-0.5">
            <button
              onClick={() => setActiveMetric('STUDENTS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase transition-all cursor-pointer ${
                activeMetric === 'STUDENTS'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              TỔNG SỐ SINH VIÊN
            </button>
            <button
              onClick={() => setActiveMetric('LECTURERS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase transition-all cursor-pointer ${
                activeMetric === 'LECTURERS'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              SỐ GIẢNG VIÊN DẠY
            </button>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="h-[260px] w-full bg-slate-50/20 p-2 rounded border border-slate-100" id="course-metric-chart-container">
          {courseStatsList.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Chưa có dữ liệu phân công để hiển thị biểu đồ.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="code" 
                  stroke="#475569" 
                  fontSize={9} 
                  angle={-35} 
                  textAnchor="end"
                  height={40}
                  tickLine={false}
                />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '6px' }}
                  labelFormatter={(code) => {
                    const original = courseStatsList.find(c => c.code === code);
                    return `Môn học: ${code} - ${original?.name || ''}`;
                  }}
                  formatter={(value: any) => [
                    activeMetric === 'STUDENTS' ? `${value} Sinh viên` : `${value} Giảng viên`, 
                    activeMetric === 'STUDENTS' ? 'Tổng Sinh viên' : 'Số Giảng viên dạy'
                  ]}
                />
                <Bar 
                  dataKey={activeMetric === 'STUDENTS' ? 'studentCount' : 'lecturerCount'} 
                  radius={[2, 2, 0, 0]}
                  barSize={12}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColorForString(entry.code)} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Main detail table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          Bảng Chi Tiết Chỉ Số Theo Môn Học
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-150">
                <th className="p-2.5 font-semibold w-[100px]">Mã môn</th>
                <th className="p-2.5 font-semibold min-w-[200px]">Tên môn học</th>
                <th className="p-2.5 font-semibold text-center w-[90px]">Tổng số lớp</th>
                <th className="p-2.5 font-semibold text-center w-[120px]">Tổng Sinh viên</th>
                <th className="p-2.5 font-semibold text-center w-[120px]">Số Giảng viên dạy</th>
                <th className="p-2.5 font-semibold">Danh sách giảng viên phụ trách môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {courseStatsList.map((course) => (
                <tr key={course.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-slate-600">
                    {course.code}
                  </td>
                  <td className="p-2.5 font-semibold text-slate-800">
                    {course.name}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold">
                    {course.classCount}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-blue-600">
                    {course.studentCount}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-[10px] ${
                      course.lecturerCount === 0 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {course.lecturerCount} GV
                    </span>
                  </td>
                  <td className="p-2.5 text-[11px] font-medium text-slate-500">
                    {course.lecturersList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {course.lecturersList.map(name => (
                          <span key={name} className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-semibold font-mono">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-red-500 font-bold italic text-[10px]">⚠️ Chưa có giảng viên</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
