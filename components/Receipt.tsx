
import React from 'react';
import { Student, Payment } from '../types';
import { formatCurrency, numberToWords } from '../utils/formatters';

interface ReceiptProps {
  payment: Payment;
  student: Student;
  instituteName?: string;
  instituteAddress?: string;
}

const Receipt: React.FC<ReceiptProps> = ({ 
  payment, 
  student, 
  instituteName = "SKILLOPEDIA",
  instituteAddress = "Premium Campus, Skillopedia Heights, City Center"
}) => {
  return (
    <div className="bg-white p-10 border-[12px] border-double border-[#2d5a8e] w-[850px] mx-auto text-gray-900 shadow-2xl relative overflow-hidden print:m-0 print:border-[6px] print:shadow-none">
      {/* Decorative Brand Accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2d5a8e] via-[#9dc84a] to-[#f9a01b]"></div>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-100">
        <div className="flex gap-4">
          {/* Stylized Logo Representation */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="absolute inset-0 bg-[#2d5a8e] rounded-2xl rotate-3 shadow-lg"></div>
            <div className="absolute inset-0 bg-white border-2 border-[#2d5a8e] rounded-2xl -rotate-3 flex items-center justify-center">
               <div className="text-center">
                 <div className="flex justify-center gap-0.5 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#9dc84a]"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#9dc84a]"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#9dc84a]"></div>
                 </div>
                 <i className="fas fa-user-graduate text-[#2d5a8e] text-3xl"></i>
               </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#2d5a8e] leading-none uppercase">
              {instituteName}
            </h1>
            <h2 className="text-[11px] font-black tracking-[0.3em] text-gray-400 mt-1 uppercase">
              Personality Development Institute
            </h2>
            <div className="mt-4 space-y-1">
              <p className="text-xs font-bold text-gray-600 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-[#f9a01b]"></i> {instituteAddress}
              </p>
              <p className="text-xs font-bold text-gray-800 flex items-center gap-3">
                <span><i className="fas fa-phone-alt text-[#9dc84a]"></i> +91 8509642898</span>
                <span className="text-gray-300">|</span>
                <span><i className="fas fa-envelope text-[#f9a01b]"></i> skillopedia.institute@gmail.com</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block bg-[#2d5a8e] text-white px-6 py-2 text-2xl font-black rounded-xl shadow-md mb-3">
            OFFICIAL RECEIPT
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Receipt No: <span className="text-red-600 font-mono text-lg ml-1">{payment.receiptNo}</span>
          </p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
            Date: <span className="text-gray-800 ml-1">{payment.date}</span>
          </p>
        </div>
      </div>

      {/* Student & Payment Details */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received With Thanks From</label>
          <div className="border-b-2 border-gray-200 py-1">
            <span className="text-xl font-bold uppercase tracking-tight text-gray-800">{student.name}</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Enrollment ID</label>
          <div className="border-b-2 border-gray-200 py-1">
            <span className="text-xl font-mono font-bold text-[#2d5a8e]">{student.id}</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course / Training Module</label>
          <div className="border-b-2 border-gray-200 py-1">
            <span className="text-lg font-bold text-gray-700">{student.course}</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Installment Period</label>
          <div className="border-b-2 border-gray-200 py-1">
            <span className="text-lg font-bold text-gray-700">{payment.periodFrom} <span className="text-gray-300 mx-2">to</span> {payment.periodTo}</span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-50 text-[#2d5a8e]">
            <th className="border-2 border-gray-200 p-4 text-left text-xs font-black uppercase tracking-widest">Particulars / Fee Description</th>
            <th className="border-2 border-gray-200 p-4 text-right text-xs font-black uppercase tracking-widest w-40">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 border-gray-200 p-6 min-h-[150px] align-top">
              <p className="font-black text-xl text-gray-800 mb-2">Academic Course Fee Payment</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Payment Method</p>
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-credit-card text-[#2d5a8e]"></i> {payment.mode}
                  </p>
                </div>
                {payment.remarks && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Remarks/Ref</p>
                    <p className="text-sm font-bold text-gray-600 truncate">{payment.remarks}</p>
                  </div>
                )}
              </div>
            </td>
            <td className="border-2 border-gray-200 p-6 text-right align-top">
              <span className="text-3xl font-black text-gray-800 tracking-tighter">
                {formatCurrency(payment.amount)}
              </span>
            </td>
          </tr>
          <tr className="bg-[#2d5a8e] text-white">
            <td className="p-4 text-right font-black uppercase tracking-widest text-sm">Grand Total Amount Received</td>
            <td className="p-4 text-right text-3xl font-black tracking-tighter">
              {formatCurrency(payment.amount)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Words Section */}
      <div className="mb-12 p-6 bg-[#f9a01b]/5 rounded-2xl border-2 border-dashed border-[#f9a01b]/30 relative">
        <div className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black text-[#f9a01b] uppercase tracking-widest">Amount In Words</div>
        <p className="text-xl font-bold italic text-gray-800 tracking-tight">
          Rupees {numberToWords(payment.amount)}
        </p>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end mt-16 px-4">
        <div className="text-center w-64">
           <div className="h-16 flex items-end justify-center mb-2">
              <span className="text-gray-200 italic text-sm">Digitally Verified</span>
           </div>
           <div className="border-t-2 border-gray-800 pt-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
             Depositor Signature
           </div>
        </div>
        
        <div className="text-center w-80">
          <div className="relative h-20 flex flex-col items-center justify-center mb-2">
            <div className="absolute top-0 opacity-10 scale-150 rotate-12">
               <i className="fas fa-certificate text-6xl text-[#2d5a8e]"></i>
            </div>
            <p className="text-[10px] font-black text-[#2d5a8e] uppercase tracking-widest leading-none">Skillopedia Institute</p>
            <p className="text-[8px] font-bold text-gray-400 mt-1 italic">Authorized Academic Seal</p>
          </div>
          <div className="border-t-2 border-gray-800 pt-2 text-[11px] font-black uppercase tracking-widest text-[#2d5a8e]">
            Authorized Signatory
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-16 pt-6 border-t border-gray-100 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        <div>Generated via Skillopedia ERP Pro v1.0.4</div>
        <div className="flex gap-4">
          <span>Official Document</span>
          <span className="text-[#9dc84a]">Secured Record</span>
        </div>
      </div>
      
      {/* Brand Watermark */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
        <i className="fas fa-university text-[300px]"></i>
      </div>
    </div>
  );
};

export default Receipt;
