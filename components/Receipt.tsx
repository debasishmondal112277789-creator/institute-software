
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
  instituteName = "EDUNEXUS ACADEMY",
  instituteAddress = "123 Education Plaza, Knowledge Park, City-400001"
}) => {
  return (
    <div className="bg-white p-8 border-4 border-double border-gray-800 w-[800px] mx-auto text-gray-900 print:m-0 print:border-2">
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-blue-900">{instituteName}</h1>
          <p className="text-sm italic text-gray-600">{instituteAddress}</p>
          <p className="text-sm font-bold mt-1">Contact: +91 99887 76655 | info@edunexus.com</p>
        </div>
        <div className="text-right">
          <div className="bg-blue-900 text-white px-4 py-1 text-xl font-bold mb-2">FEE RECEIPT</div>
          <p className="font-bold">Receipt No: <span className="text-red-600">{payment.receiptNo}</span></p>
          <p className="font-bold">Date: {payment.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex gap-2 border-b border-gray-300 py-1">
          <span className="font-bold whitespace-nowrap">Student Name:</span>
          <span className="uppercase">{student.name}</span>
        </div>
        <div className="flex gap-2 border-b border-gray-300 py-1">
          <span className="font-bold whitespace-nowrap">Student ID:</span>
          <span>{student.id}</span>
        </div>
        <div className="flex gap-2 border-b border-gray-300 py-1">
          <span className="font-bold whitespace-nowrap">Course:</span>
          <span>{student.course}</span>
        </div>
        <div className="flex gap-2 border-b border-gray-300 py-1">
          <span className="font-bold whitespace-nowrap">Period:</span>
          <span>{payment.periodFrom} to {payment.periodTo}</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-800 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-800 p-2 text-left">Description</th>
            <th className="border border-gray-800 p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-800 p-4 min-h-[100px] align-top">
              <p className="font-bold">Course Fees / Installment</p>
              <p className="text-xs text-gray-500 mt-1">Payment Mode: {payment.mode}</p>
              {payment.remarks && <p className="text-xs text-gray-500 italic mt-1">Note: {payment.remarks}</p>}
            </td>
            <td className="border border-gray-800 p-4 text-right align-top font-bold">
              {formatCurrency(payment.amount)}
            </td>
          </tr>
          <tr className="bg-gray-50 font-bold">
            <td className="border border-gray-800 p-2 text-right">TOTAL AMOUNT PAID</td>
            <td className="border border-gray-800 p-2 text-right">{formatCurrency(payment.amount)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-8">
        <p className="font-bold">Amount in Words:</p>
        <p className="italic border-b border-gray-400 py-1 uppercase text-sm">Rupees {numberToWords(payment.amount)}</p>
      </div>

      <div className="flex justify-between items-end mt-12">
        <div className="text-center w-1/3">
          <div className="border-t border-gray-800 pt-1 text-sm font-bold">Student Signature</div>
        </div>
        <div className="text-center w-1/3">
          <p className="text-[10px] text-gray-400 mb-8 italic">Stamp Required</p>
          <div className="border-t border-gray-800 pt-1 text-sm font-bold uppercase">{instituteName}</div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-dotted border-gray-300 text-[10px] text-center text-gray-500">
        This is a computer-generated receipt and does not require a physical signature.
      </div>
    </div>
  );
};

export default Receipt;
