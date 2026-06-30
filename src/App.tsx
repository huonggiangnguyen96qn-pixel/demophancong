/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Users, BookOpen, Layers, Download, CheckCircle, 
  HelpCircle, RefreshCw, Sparkles, FileText, Settings, Sliders 
} from 'lucide-react';
import { ScheduleItem } from './types';
import { getDefaultScheduleItems } from './data';
import CSVUpload from './components/CSVUpload';
import ScheduleTable from './components/ScheduleTable';
import LecturerAnalysis from './components/LecturerAnalysis';
import CourseAnalysis from './components/CourseAnalysis';
import ClassAnalysis from './components/ClassAnalysis';
import { motion, AnimatePresence } from 'motion/react';

type TabId = 'ASSIGNMENT' | 'LECTURERS' | 'COURSES' | 'CLASSES';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('ASSIGNMENT');
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);
  const [manualLecturers, setManualLecturers] = useState<string[]>([]);

  // Load initial state from local storage or fallback to defaults
  useEffect(() => {
    const cachedList = localStorage.getItem('assigned_schedule_list');
    const cachedManualLecturers = localStorage.getItem('manual_lecturers_list');

    if (cachedList) {
      try {
        setScheduleList(JSON.parse(cachedList));
      } catch (e) {
        setScheduleList(getDefaultScheduleItems());
      }
    } else {
      setScheduleList(getDefaultScheduleItems());
    }

    if (cachedManualLecturers) {
      try {
        setManualLecturers(JSON.parse(cachedManualLecturers));
      } catch (e) {
        setManualLecturers([]);
      }
    }
  }, []);

  // Save to local storage whenever state changes
  const saveState = (list: ScheduleItem[], manualLecs: string[]) => {
    localStorage.setItem('assigned_schedule_list', JSON.stringify(list));
    localStorage.setItem('manual_lecturers_list', JSON.stringify(manualLecs));
  };

  // Update schedule items
  const handleUpdateScheduleList = (newList: ScheduleItem[]) => {
    setScheduleList(newList);
    // Automatically capture all unique lecturers from this new list to merge
    const activeLecs = Array.from(new Set(newList.map(item => item.lecturer)))
      .filter(l => l && l !== 'Chưa phân công');
    
    // Clean manual list from duplicates that are already in active list
    const updatedManual = manualLecturers.filter(l => !activeLecs.includes(l));
    setManualLecturers(updatedManual);
    saveState(newList, updatedManual);
  };

  const handleUpdateLecturer = (id: string, lecturer: string) => {
    const updatedList = scheduleList.map(item => {
      if (item.id === id) {
        return { ...item, lecturer };
      }
      return item;
    });
    setScheduleList(updatedList);
    saveState(updatedList, manualLecturers);
  };

  const handleAddLecturer = (name: string) => {
    const updatedManual = [...manualLecturers, name];
    setManualLecturers(updatedManual);
    saveState(scheduleList, updatedManual);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục lại dữ liệu phân công mặc định? Mọi thay đổi hiện tại của bạn sẽ bị ghi đè.")) {
      const defaultItems = getDefaultScheduleItems();
      setScheduleList(defaultItems);
      setManualLecturers([]);
      saveState(defaultItems, []);
    }
  };

  // Extracted unique lecturers available for selection
  const uniqueLecturers = useMemo(() => {
    const lecturersSet = new Set<string>();
    
    // 1. From active schedule items
    scheduleList.forEach(item => {
      if (item.lecturer && item.lecturer !== 'Chưa phân công') {
        lecturersSet.add(item.lecturer);
      }
    });

    // 2. From manually added ones
    manualLecturers.forEach(l => {
      if (l) lecturersSet.add(l);
    });

    return Array.from(lecturersSet).sort();
  }, [scheduleList, manualLecturers]);

  // Export back to CSV
  const handleExportCSV = () => {
    const headers = "Môn;Tên môn;Lớp;Chuyên ngành;Số sinh viên cần học;Part;Giảng viên;Số giờ AP";
    const rows = scheduleList.map(item => {
      const escapedName = item.courseName.includes('\n') || item.courseName.includes(';')
        ? `"${item.courseName.replace(/"/g, '""')}"`
        : item.courseName;
      return `${item.courseCode};${escapedName};${item.classCode};${item.major};${item.studentCount};${item.part};${item.lecturer};${item.apHours}`;
    });
    
    const csvContent = "\uFEFF" + [headers, ...rows].join('\n'); // Add BOM character for Vietnamese in Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `phan_cong_lich_day_FPT.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics for overall header
  const unassignedCount = useMemo(() => {
    return scheduleList.filter(item => item.lecturer === 'Chưa phân công').length;
  }, [scheduleList]);

  // High Density theme KPI calculations
  const totalHours = useMemo(() => {
    return scheduleList.reduce((sum, item) => sum + item.apHours, 0);
  }, [scheduleList]);

  const assignedLecturersCount = useMemo(() => {
    const assigned = new Set(
      scheduleList
        .filter(item => item.lecturer && item.lecturer !== 'Chưa phân công')
        .map(item => item.lecturer)
    );
    return assigned.size;
  }, [scheduleList]);

  const totalUniqueLecturersCount = useMemo(() => {
    return uniqueLecturers.filter(l => l !== 'Chưa phân công').length;
  }, [uniqueLecturers]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans overflow-hidden" id="app-root-container">
      
      {/* Top Header - High Density Slate style */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0" id="main-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
            EduAssign Pro <span className="text-blue-400 font-normal text-xs uppercase">v2.4</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {unassignedCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400 font-semibold animate-pulse">
              <span>⚠️ {unassignedCount} lớp chưa phân công</span>
            </div>
          )}
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition-colors text-xs font-bold cursor-pointer text-white"
            title="Xuất dữ liệu phân công sang tệp CSV"
            id="btn-export-csv"
          >
            <Download className="w-4 h-4" />
            XUẤT FILE .CSV
          </button>
          
          <div className="h-8 w-px bg-slate-700 mx-1 hidden sm:block"></div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Trưởng Bộ Môn</p>
            <p className="text-sm font-semibold text-slate-200 mt-1">Nguyễn Văn A</p>
          </div>
        </div>
      </header>

      {/* Main Content Layout with Sidebar + Work Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar Nav */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 justify-between" id="app-sidebar">
          <nav className="flex-1 p-3 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('ASSIGNMENT')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer w-full text-left ${
                activeTab === 'ASSIGNMENT'
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-2'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              id="tab-btn-assignment"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              Phân Công Lịch
            </button>
            
            <button
              onClick={() => setActiveTab('LECTURERS')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer w-full text-left ${
                activeTab === 'LECTURERS'
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-2'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              id="tab-btn-lecturers"
            >
              <Users className="w-4 h-4 shrink-0" />
              Phân Tích Giảng Viên
            </button>

            <button
              onClick={() => setActiveTab('COURSES')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer w-full text-left ${
                activeTab === 'COURSES'
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-2'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              id="tab-btn-courses"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Phân Tích Môn Học
            </button>

            <button
              onClick={() => setActiveTab('CLASSES')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer w-full text-left ${
                activeTab === 'CLASSES'
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 pl-2'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              id="tab-btn-classes"
            >
              <Layers className="w-4 h-4 shrink-0" />
              Phân Tích Lớp Học
            </button>
          </nav>

          {/* Sidebar Status Box */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Trạng thái file</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                scheduleList.length > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {scheduleList.length > 0 ? 'Đã tải' : 'Trống'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium truncate" title="phan_cong_ky_he_2026.csv">
              {scheduleList.length > 0 ? 'phan_cong_ky_he_2026.csv' : 'Chưa nạp dữ liệu'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {scheduleList.length} hàng • Khối CNTT FPT
            </p>
          </div>
        </aside>

        {/* Main Workspace Data Area */}
        <main className="flex-1 flex flex-col p-5 gap-5 bg-[#F1F5F9] overflow-y-auto" id="main-content-panel">
          
          {/* Active Tab Header & KPIs block */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0" id="active-tab-header">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {activeTab === 'ASSIGNMENT' && 'Bảng Phân Công Giảng Dạy'}
                {activeTab === 'LECTURERS' && 'Thống Kê & Phân Tích Giảng Viên'}
                {activeTab === 'COURSES' && 'Thông Tin & Phân Tích Môn Học'}
                {activeTab === 'CLASSES' && 'Cảnh Báo & Phân Tích Lớp Học'}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Kỳ Summer 2026 • Khối Công nghệ thông tin
              </p>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <div className="bg-white rounded border border-slate-200 px-3 py-1.5 flex flex-col min-w-[100px] shadow-sm">
                <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Tổng giờ AP</span>
                <span className="text-base font-bold text-slate-700 mt-0.5">{totalHours.toLocaleString()}</span>
              </div>
              <div className="bg-white rounded border border-slate-200 px-3 py-1.5 flex flex-col min-w-[120px] shadow-sm">
                <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Giảng viên hiện diện</span>
                <span className="text-base font-bold text-blue-600 mt-0.5">{assignedLecturersCount} / {totalUniqueLecturersCount || '--'}</span>
              </div>
            </div>
          </div>

          {/* Active Tab Component Container */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeTab === 'ASSIGNMENT' && (
                  <div className="space-y-6" id="assignment-tab-container">
                    {/* CSV File Loader Panel */}
                    <CSVUpload 
                      onDataLoaded={handleUpdateScheduleList}
                      onResetToDefault={handleResetToDefault}
                      currentItemsCount={scheduleList.length}
                    />

                    {/* Primary schedule list & dropdown editor */}
                    <ScheduleTable 
                      items={scheduleList}
                      onUpdateLecturer={handleUpdateLecturer}
                      uniqueLecturers={uniqueLecturers}
                      onAddLecturer={handleAddLecturer}
                    />
                  </div>
                )}

                {activeTab === 'LECTURERS' && (
                  <LecturerAnalysis items={scheduleList} />
                )}

                {activeTab === 'COURSES' && (
                  <CourseAnalysis items={scheduleList} />
                )}

                {activeTab === 'CLASSES' && (
                  <ClassAnalysis items={scheduleList} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest shrink-0 font-medium">
        <div className="flex gap-6">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
            Kết nối máy chủ ổn định
          </span>
          <span>DB V.2024.1.2</span>
        </div>
        <div>© 2026 DEPT MGMT SYSTEM • INTERNAL USE ONLY</div>
      </footer>

    </div>
  );
}
