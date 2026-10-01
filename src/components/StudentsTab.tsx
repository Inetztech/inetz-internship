"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StudentHeaderControls from "./students/StudentHeaderControls";
import StudentTable, { StudentRecord } from "./students/StudentTable";
import StudentPagination from "./students/StudentPagination";
import AddStudentModal from "./students/AddStudentModal";
import EditStudentModal from "./students/EditStudentModal";

const DEFAULT_DURATIONS = ["1 Week", "2 Weeks", "1 Month", "2 Months", "3 Months", "6 Months"];

export default function StudentsTab() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  // Summary Metrics State
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    duesCount: 0,
    clearCount: 0,
  });

  // Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");

  // Date Range States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch dynamic tracks to populate domain dropdown list
  const fetchAvailableTracks = useCallback(async () => {
    try {
      let res = await fetch("/api/tracks");
      if (!res.ok) {
        res = await fetch("/api/programs");
      }

      if (res.ok) {
        const rawData = await res.json();
        const list: any[] = Array.isArray(rawData)
          ? rawData
          : rawData.programs || rawData.data || [];

        const titles = Array.from(
          new Set(list.map((item) => item.title?.trim()).filter(Boolean))
        ) as string[];

        if (titles.length > 0) {
          setAvailableDomains(["All", ...titles]);
        }
      }
    } catch (err) {
      console.error("Failed to load tracks for domains list:", err);
    }
  }, []);

  useEffect(() => {
    fetchAvailableTracks();
  }, [fetchAvailableTracks]);

  // Fetch students with normalized filters
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        search: debouncedSearch.trim(),
        page: page.toString(),
        limit: "15",
      };

      // Case-insensitive check: only append if not 'all'
      if (domainFilter.trim().toLowerCase() !== "all") {
        queryParams.domain = domainFilter.trim();
      }

      if (durationFilter.trim().toLowerCase() !== "all") {
        queryParams.duration = durationFilter.trim();
      }

      if (fromDate) queryParams.fromDate = fromDate;
      if (toDate) queryParams.toDate = toDate;

      const query = new URLSearchParams(queryParams);
      const res = await axios.get(`/api/students?${query.toString()}`);

      if (res.data.success) {
        setStudents(res.data.students || []);

        if (res.data.summary) {
          setSummary(res.data.summary);
        }

        // Merge backend-provided domains if available
        if (Array.isArray(res.data.availableDomains) && res.data.availableDomains.length > 0) {
          setAvailableDomains((prev) => {
            const combined = Array.from(
              new Set([...prev, ...res.data.availableDomains.map((d: string) => d.trim())])
            );
            return combined.filter((d) => d.toLowerCase() !== "all").length > 0
              ? ["All", ...combined.filter((d) => d.toLowerCase() !== "all")]
              : ["All"];
          });
        }

        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, domainFilter, durationFilter, fromDate, toDate, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleDomainChange = (val: string) => {
    setDomainFilter(val);
    setPage(1);
  };

  const handleDurationChange = (val: string) => {
    setDurationFilter(val);
    setPage(1);
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setPage(1);
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setPage(1);
  };

  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleOpenEditModal = (student: StudentRecord) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <StudentHeaderControls
        summary={summary}
        search={search}
        onSearchChange={handleSearchChange}
        domainFilter={domainFilter}
        onDomainChange={handleDomainChange}
        availableDomains={availableDomains}
        durationFilter={durationFilter}
        onDurationChange={handleDurationChange}
        availableDurations={["All", ...DEFAULT_DURATIONS]}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        onClearDates={handleClearDates}
        loading={loading}
        onRefresh={fetchStudents}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <StudentTable
        students={students}
        loading={loading}
        onOpenEditModal={handleOpenEditModal}
      />

      <StudentPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStudents}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        student={selectedStudent}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchStudents}
      />
    </div>
  );
}
