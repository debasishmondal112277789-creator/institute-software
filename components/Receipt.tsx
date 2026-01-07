
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
  instituteName = "SKILLOPEDIA PERSONALITY DEVELOPMENT INSTITUTE",
  instituteAddress = "Premium Campus, Skillopedia Heights, City Center"
}) => {
  return (
    <div className="bg-white p-8 border-4 border-double border-gray-800 w-[800px] mx-auto text-gray-900 print:m-0 print:border-2">
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#2d5a8e] rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-graduation-cap text-2xl"></i>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-[#2d5a8e] leading-tight uppercase">{instituteName}</h1>
          </div>
          <p className="text-sm italic text-gray-600">{instituteAddress}</p>
          <p className="text-sm font-bold mt-1 text-gray-800">
            <i className="fas fa-phone-alt mr-2 text-green-600"></i> +91 8509642898 | 
            <i className="fas fa-envelope ml-2 mr-2 text-orange-500"></i> skillopedia.institute@gmail.com
          </p>
        </div>
        <div className="text-right">
          <div className="bg-[#2d5a8e] text-white px-4 py-1 text-xl font-bold mb-2 rounded">FEE RECEIPT</div>
          <p className="font-bold">Receipt No: <span className="text-red-600 font-mono">{payment.receiptNo}</span></p>
          <p className="font-bold text-sm">Date: {payment.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex gap-2 border-b border-gray-200 py-1">
          <span className="font-bold whitespace-nowrap text-gray-500 text-xs uppercase">Student Name:</span>
          <span className="uppercase font-bold tracking-wide">{student.name}</span>
        </div>
        <div className="flex gap-2 border-b border-gray-200 py-1">
          <span className="font-bold whitespace-nowrap text-gray-500 text-xs uppercase">Student ID:</span>
          <span className="font-mono">{student.id}</span>
        </div>
        <div className="flex gap-2 border-b border-gray-200 py-1">
          <span className="font-bold whitespace-nowrap text-gray-500 text-xs uppercase">Course:</span>
          <span className="font-bold">{student.course}</span>
        </div>
        <div className="flex gap-2 border-b border-gray-200 py-1">
          <span className="font-bold whitespace-nowrap text-gray-500 text-xs uppercase">Payment Period:</span>
          <span className="font-medium text-sm">{payment.periodFrom} to {payment.periodTo}</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-800 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-800 p-2 text-left text-xs uppercase tracking-wider">Particulars / Description</th>
            <th className="border border-gray-800 p-2 text-right text-xs uppercase tracking-wider w-32">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-800 p-4 min-h-[120px] align-top">
              <p className="font-bold text-lg">Course Fees Installment</p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-bold text-gray-700">Payment Mode:</span> {payment.mode}
              </p>
              {payment.remarks && (
                <p className="text-xs text-gray-500 italic mt-2">
                  <span className="font-bold text-gray-700">Remarks:</span> {payment.remarks}
                </p>
              )}
            </td>
            <td className="border border-gray-800 p-4 text-right align-top font-black text-xl">
              {formatCurrency(payment.amount)}
            </td>
          </tr>
          <tr className="bg-gray-50 font-black">
            <td className="border border-gray-800 p-3 text-right text-gray-600">TOTAL AMOUNT RECEIVED</td>
            <td className="border border-gray-800 p-3 text-right text-2xl text-[#2d5a8e]">{formatCurrency(payment.amount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-10 p-3 bg-gray-50 rounded border border-dashed border-gray-300">
        <p className="font-bold text-xs text-gray-500 uppercase mb-1">Amount in Words:</p>
        <p className="italic font-bold tracking-wide text-gray-800">Rupees {numberToWords(payment.amount)}</p>
      </div>

      <div className="flex justify-between items-end mt-16">
        <div className="text-center w-1/3">
          <div className="border-t border-gray-800 pt-1 text-xs font-bold uppercase">Depositor Signature</div>
        </div>
        <div className="text-center w-1/3">
          <p className="text-[10px] text-gray-400 mb-8 italic">Authorized Stamp & Signature</p>
          <div className="border-t border-gray-800 pt-1 text-xs font-bold uppercase tracking-tighter">
            {instituteName}
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-4 border-t border-dotted border-gray-300 text-[9px] text-center text-gray-400 uppercase tracking-[0.2em]">
        System Generated Receipt • Skillopedia ERP Pro v1.0.4
      </div>
    </div>
  );
};

export default Receipt;
