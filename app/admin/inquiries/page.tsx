'use client';

import { useState, useEffect } from 'react';
import { getInitialInquiries, saveInquiries, Inquiry } from '../../../data/store';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    setInquiries(getInitialInquiries());
  }, []);

  const handleStatusChange = (id: string, newStatus: Inquiry['status']) => {
    const updated = inquiries.map((inq) => {
      if (inq.id === id) {
        return { ...inq, status: newStatus };
      }
      return inq;
    });
    setInquiries(updated);
    saveInquiries(updated);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  const filtered = inquiries.filter((inq) => {
    const matchSearch = inq.name.toLowerCase().includes(search.toLowerCase()) || inq.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#683846]">Work With Us Inquiries</h1>
        <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
          View and respond to brand partnerships and collaboration requests.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by contact or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#332D2F] bg-white focus:ring-2 focus:ring-[#B75B70]"
        >
          <option value="ALL">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Responded">Responded</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* List & Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden divide-y divide-gray-100">
          {filtered.map((inq) => (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              className={`p-4 cursor-pointer transition-colors space-y-1 ${
                selectedInquiry?.id === inq.id ? 'bg-[#F8EDEF] border-l-4 border-[#B75B70]' : 'hover:bg-[#F8EDEF]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-[#683846]">{inq.name}</h3>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  inq.status === 'New' ? 'bg-[#F8EDEF] text-[#B75B70] border border-[#B75B70]/30' : 'bg-green-100 text-green-800'
                }`}>
                  {inq.status}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#B75B70]">{inq.company}</p>
              <p className="text-[11px] text-[#332D2F]/70 line-clamp-1">{inq.message}</p>
            </div>
          ))}
        </div>

        {/* Selected Details View */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-8 space-y-4 font-sans">
          {selectedInquiry ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#683846]">{selectedInquiry.name}</h2>
                  <p className="text-xs text-[#332D2F] font-semibold">{selectedInquiry.company} • {selectedInquiry.email}</p>
                  <p className="text-[10px] text-[#332D2F]/60 mt-0.5">Received on {selectedInquiry.date}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#332D2F] uppercase mb-1">Status</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as Inquiry['status'])}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#683846] bg-white"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Responded">Responded</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#683846] uppercase tracking-wider mb-2">Inquiry Message</h3>
                <div className="bg-[#F8EDEF] p-5 rounded-2xl border border-[#B75B70]/20 text-xs text-[#332D2F] leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: MummaBeeBlog Collaboration - ${selectedInquiry.company}`}
                  className="btn-primary"
                >
                  Reply via Email →
                </a>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#332D2F]/60">
              Select an inquiry from the left to view message details and update status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
