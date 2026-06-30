/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ScheduleItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Search, SlidersHorizontal, UserCheck, CalendarDays, CheckCircle2, AlertTriangle, 
  Plus, Users, Sparkles, BookOpen, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getColorForString } from '../data';
import { motion } from 'motion/react';

interface ScheduleTableProps {
  items: ScheduleItem[];
  onUpdateLecturer: (id: string, lecturer: string) => void;
  uniqueLecturers: string[];
  onAddLecturer: (name: string) => void;
}

export default function ScheduleTable({ 
  items, 
  onUpdateLecturer, 
  uniqueLecturers,
  onAddLecturer
}: ScheduleTableProps) {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [majorFilter, setMajorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ASSIGNED, UNASSIGNED
  const [newLecturerName, setNewLecturerName] = useState('');
  const [showAddLecturerModal, setShowAddLecturerModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Derive filter values
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.classCode) set.add(item.classCode);
    });
    return Array.from(set).sort();
  }, [items]);

  const uniqueMajors = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.major) set.add(item.major);
    });
    return Array.from(set).sort();
  }, [items]);

  // Handle lecturer addition
  const handleAddNewLecturer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newLecturerName.trim();
    if (name) {
      if (uniqueLecturers.some(l => l.toLowerCase() === name.toLowerCase())) {
        alert("Giảng viên này đã tồn tại trong danh sách!");
        return;
      }
      onAddLecturer(name);
      setNewLecturerName('');
      setShowAddLecturerModal(false);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      const searchStr = `${item.courseCode} ${item.courseName} ${item.classCode} ${item.lecturer}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      // Filters
      const matchesClass = classFilter === 'ALL' || item.classCode === classFilter;
      const matchesMajor = majorFilter === 'ALL' || item.major === majorFilter;
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'ASSIGNED' && item.lecturer !== 'Chưa phân công') ||
        (statusFilter === 'UNASSIGNED' && item.lecturer === 'Chưa phân công');

      return matchesSearch && matchesClass && matchesMajor && matchesStatus;
    });
  }, [items, searchTerm, classFilter, majorFilter, statusFilter]);

  // Pagination calculation
  const totalRows = filteredItems.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  // Adjust page if current page exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Lecturer statistics for dynamic chart (Sum of AP Hours per lecturer)
  const lecturerChartData = useMemo(() => {
    const stats: { [name: string]: number } = {};
    
    // Initialize all unique lecturers with 0 hours
    uniqueLecturers.forEach(l => {
      if (l !== 'Chưa phân công') stats[l] = 0;
    });

    // Sum hours based on active schedule items
    items.forEach(item => {
      const lecturer = item.lecturer;
      if (lecturer && lecturer !== 'Chưa phân công') {
        stats[lecturer] = (stats[lecturer] || 0) + item.apHours;
      }
    });

    // Convert to Recharts array
    return Object.keys(stats).map(name => ({
      name,
      hours: Math.round(stats[name] * 10) / 10,
    })).sort((a, b) => b.hours - a.hours); // sort by hours descending
  }, [items, uniqueLecturers]);

  // High level cards values
  const summaryStats = useMemo(() => {
    const totalHours = items.reduce((sum, item) => sum + item.apHours, 0);
    const assignedHours = items.reduce((sum, item) => item.lecturer !== 'Chưa phân công' ? sum + item.apHours : sum, 0);
    const unassignedHours = totalHours - assignedHours;
    const assignedPercent = totalHours > 0 ? Math.round((assignedHours / totalHours) * 100) : 0;
    const unassignedCount = items.filter(item => item.lecturer === 'Chưa phân công').length;

    return {
      totalHours,
      assignedHours,
      unassignedHours,
      assignedPercent,
      unassignedCount,
      totalItems: items.length
    };
  }, [items]);

  return (
    <div className="space-y-4" id="schedule-assignment-tab">
      
      {/* KPI Cards - High Density Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Tổng Số Suất Học</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-xl font-bold text-slate-800">{summaryStats.totalItems}</span>
            <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[9px] text-slate-500 mt-1">Lớp học cần phân công</p>
        </div>

        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Tổng Số Giờ Giảng</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-xl font-bold text-slate-800">{summaryStats.totalHours} AP</span>
            <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[9px] text-slate-500 mt-1">Tổng quy mô giờ bộ môn</p>
        </div>

        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Tỷ Lệ Đã Phân Công</span>
          <div className="flex items-end justify-between mt-2">
            <div>
              <span className="text-xl font-bold text-slate-800">{summaryStats.assignedPercent}%</span>
              <span className="text-[10px] text-slate-500 ml-1">({summaryStats.assignedHours}h)</span>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1 rounded-full transition-all duration-500" 
              style={{ width: `${summaryStats.assignedPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Chưa Phân Công</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-xl font-bold text-rose-600">{summaryStats.unassignedCount} lớp</span>
            <div className="w-7 h-7 rounded bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[9px] text-rose-500 font-medium mt-1">Còn {summaryStats.unassignedHours}h chưa có giảng viên</p>
        </div>
      </div>

      {/* Grid containing Table Filter/Search and Dynamic hours chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Main assignment area (8/12 width) */}
        <div className="xl:col-span-8 space-y-3">
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Danh sách học phần</span>
              <div className="flex gap-2">
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">Summer 2026</span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm môn, lớp, gv..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-xs outline-none focus:border-blue-400 transition-all text-slate-700"
                />
              </div>

              <div>
                <select
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs outline-none focus:border-blue-400 transition-all text-slate-700"
                >
                  <option value="ALL">Tất cả Lớp</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={majorFilter}
                  onChange={(e) => { setMajorFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs outline-none focus:border-blue-400 transition-all text-slate-700"
                >
                  <option value="ALL">Tất cả Chuyên ngành</option>
                  {uniqueMajors.map(m => (
                    <option key={m} value={m}>{m || 'Chung'}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs outline-none focus:border-blue-400 transition-all text-slate-700"
                >
                  <option value="ALL">Tất cả Trạng thái</option>
                  <option value="ASSIGNED">Đã phân công</option>
                  <option value="UNASSIGNED">Chưa phân công</option>
                </select>
              </div>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="p-2.5 font-semibold">Môn</th>
                    <th className="p-2.5 font-semibold">Tên học phần</th>
                    <th className="p-2.5 font-semibold">Lớp</th>
                    <th className="p-2.5 font-semibold hidden sm:table-cell">Chuyên ngành</th>
                    <th className="p-2.5 font-semibold text-center">Giờ AP</th>
                    <th className="p-2.5 font-semibold">Giảng viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <p className="font-medium text-slate-500">Không tìm thấy phân công nào khớp với điều kiện lọc.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          item.lecturer === 'Chưa phân công' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="p-2.5 font-mono text-blue-600 font-bold">
                          {item.courseCode}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800">
                          <div>{item.courseName.split('\n')[0]}</div>
                          {item.courseName.includes('\n') && (
                            <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5 max-w-[240px] truncate" title={item.courseName}>
                              {item.courseName.substring(item.courseName.indexOf('\n') + 1).replace(/\r/g, '').replace(/\n/g, ' ')}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600 font-semibold">
                          {item.classCode}
                        </td>
                        <td className="p-2.5 hidden sm:table-cell text-slate-500">
                          {item.major || 'Chung'}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-700">
                          {item.apHours}
                        </td>
                        <td className="p-2.5 min-w-[165px]">
                          <select
                            value={item.lecturer}
                            onChange={(e) => onUpdateLecturer(item.id, e.target.value)}
                            className={`bg-white border rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-400 outline-none transition-all cursor-pointer ${
                              item.lecturer === 'Chưa phân công'
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : 'border-slate-200 text-slate-800'
                            }`}
                          >
                            <option value="Chưa phân công">-- Chưa phân công --</option>
                            {uniqueLecturers.filter(l => l !== 'Chưa phân công').map(lecturerName => (
                              <option key={lecturerName} value={lecturerName}>
                                {lecturerName}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalRows > 0 && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase">
                  Hiển thị {Math.min(currentPage * rowsPerPage, totalRows)} / {totalRows} học phần
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Số dòng:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="text-[10px] font-bold bg-white border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-600 px-1">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Hours Chart & Lecturer Management (4/12 width) */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Add custom lecturer */}
          <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              Thêm Giảng viên Mới
            </h3>
            <form onSubmit={handleAddNewLecturer} className="space-y-2">
              <input
                type="text"
                placeholder="Nhập tên giảng viên mới..."
                value={newLecturerName}
                onChange={(e) => setNewLecturerName(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded outline-none focus:border-blue-400 text-slate-700"
                required
              />
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors uppercase cursor-pointer"
              >
                Thêm Giảng Viên +
              </button>
            </form>
          </div>

          {/* Dynamic hours chart */}
          <div className="bg-white rounded border border-slate-200 shadow-sm p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Tải trọng giảng viên (Giờ AP)
            </h3>
            
            <div className="h-[250px] w-full mt-2" id="lecturer-hours-chart-container">
              {lecturerChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Chưa có giảng viên được phân công.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={lecturerChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#475569" 
                      fontSize={10} 
                      width={65}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '6px' }}
                      formatter={(value: any) => [`${value} giờ`, 'Giờ AP']}
                    />
                    <Bar dataKey="hours" radius={[0, 2, 2, 0]} barSize={10}>
                      {lecturerChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getColorForString(entry.name)} 
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Advice box inside dynamic hours chart */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Khuyến nghị: Cân đối tải trọng giảng dạy khoảng <b>72 - 120 giờ AP</b> để đảm bảo chất lượng.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
