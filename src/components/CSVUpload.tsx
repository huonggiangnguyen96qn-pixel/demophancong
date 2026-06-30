/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RotateCcw, HelpCircle } from 'lucide-react';
import { ScheduleItem } from '../types';
import { parseCSV, convertCSVToScheduleItems } from '../data';
import { motion } from 'motion/react';

interface CSVUploadProps {
  onDataLoaded: (items: ScheduleItem[]) => void;
  onResetToDefault: () => void;
  currentItemsCount: number;
}

export default function CSVUpload({ onDataLoaded, onResetToDefault, currentItemsCount }: CSVUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setSuccessMsg(null);

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Chỉ chấp nhận tệp định dạng .csv");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setError("Không thể đọc tệp tin hoặc tệp rỗng.");
          return;
        }

        // Parse CSV using semicolon or auto-detect
        let delimiter = ';';
        // Simple auto-detect: count semicolons vs commas in the first non-empty line
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const firstLine = lines[0];
          const semiCount = (firstLine.match(/;/g) || []).length;
          const commaCount = (firstLine.match(/,/g) || []).length;
          if (commaCount > semiCount) {
            delimiter = ',';
          }
        }

        const rows = parseCSV(text, delimiter);
        if (rows.length < 2) {
          setError("Tệp CSV không có đủ dữ liệu (yêu cầu ít nhất dòng tiêu đề và 1 dòng dữ liệu).");
          return;
        }

        const items = convertCSVToScheduleItems(rows);
        if (items.length === 0) {
          setError("Không thể trích xuất được bản ghi phân công nào. Vui lòng kiểm tra định dạng cột.");
          return;
        }

        onDataLoaded(items);
        setSuccessMsg(`Tải tệp thành công! Đã nạp ${items.length} bản ghi phân công giảng dạy.`);
      } catch (err: any) {
        setError(`Có lỗi xảy ra khi xử lý tệp: ${err.message || err}`);
      }
    };
    reader.onerror = () => {
      setError("Lỗi khi đọc tệp tin.");
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-4 shadow-sm" id="csv-upload-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Nhập Dữ liệu Phân công giảng dạy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải tệp .csv của kỳ học để nạp dữ liệu. Số lượng hiện tại: <strong className="text-blue-600">{currentItemsCount}</strong> hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
            title="Khôi phục lại dữ liệu phân công mặc định từ hệ thống"
            id="btn-reset-default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Dùng Dữ liệu Mẫu
          </button>
        </div>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative border border-dashed rounded p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[110px] ${
          dragActive
            ? "border-blue-500 bg-blue-50/40"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
        }`}
        id="drag-drop-container"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          id="file-upload-input"
        />

        <div className="text-blue-500 mb-1.5">
          <Upload className="w-5 h-5" />
        </div>

        <p className="text-xs font-semibold text-slate-700">
          Kéo thả tệp .csv vào đây, hoặc <span className="text-blue-600 underline decoration-dotted">bấm để chọn từ máy tính</span>
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Hỗ trợ định dạng dấu chấm phẩy (;) hoặc dấu phẩy (,). Mã hóa UTF-8.
        </p>

        {dragActive && (
          <div className="absolute inset-0 bg-blue-50/70 rounded flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Thả tệp của bạn tại đây...</span>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-2.5"
          id="upload-error-alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] block text-rose-700 mb-0.5">Lỗi nạp file</span>
            {error}
          </div>
        </motion.div>
      )}

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-start gap-2.5"
          id="upload-success-alert"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] block text-emerald-700 mb-0.5">Thành công</span>
            {successMsg}
          </div>
        </motion.div>
      )}

      {/* Guide/Format info */}
      <div className="mt-3 bg-slate-50 rounded p-3 border border-slate-200 text-[11px] text-slate-600">
        <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Quy chuẩn cấu trúc các trường thông tin trong tệp .CSV:
        </h4>
        <p className="mb-2 leading-relaxed text-[10px] text-slate-500">
          Tệp CSV phân công phải có dòng tiêu đề đầu tiên bao gồm chính xác các cột dưới đây:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px] text-slate-700 bg-white p-2 rounded border border-slate-200">
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Môn</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Tên môn</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Lớp</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Chuyên ngành</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Số sinh viên cần học</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Part</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Giảng viên</div>
          <div className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-bold">• Số giờ AP</div>
        </div>
      </div>
    </div>
  );
}
