import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import auth from "../../../authService";
import Header from "../../../components/shared/Header";
import TutorScheduleFilters from "../../../components/users/tutors/TutorScheduleFilters";
import TutorScheduleGrid from "../../../components/users/tutors/TutorScheduleGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { SemesterContext } from "../../../context/currentSemester";
import {
    parseTime,
    formatTime12h,
    buildTimeRows,
    filterSchedules,
    popularBlocks,
    tutorWeeklyHours,
} from "../../../lib/schedule";

const EMPTY_FILTERS = { search: "", majors: [], course: "", blockStart: "", blockEnd: "" };

function Tutors() {
    const [tutors, setTutors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [majors, setMajors] = useState([]);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { selectedSemesterId } = useContext(SemesterContext);
    const semesterQuery = selectedSemesterId ? `?semester_id=${selectedSemesterId}` : "";

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [tutorsRes, schedulesRes, catalogRes, majorsRes] = await Promise.all([
                    auth.get(`/api/tutors${semesterQuery}`),
                    auth.get(`/api/schedules${semesterQuery}`),
                    auth.get(`/api/courses/catalog${semesterQuery}`),
                    auth.get("/api/majors"),
                ]);
                setTutors(tutorsRes.data.tutors || []);
                setSchedules(schedulesRes.data.schedules || []);
                setCourses(catalogRes.data.courses || []);
                setMajors(majorsRes.data.majors || []);
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.msg || e.response?.data?.error || "Failed to load tutor schedules");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [semesterQuery]);

    const tutorsById = useMemo(() => {
        const map = new Map();
        tutors.forEach((t) => map.set(Number(t.id), t));
        return map;
    }, [tutors]);

    const enrichedSchedules = useMemo(
        () => schedules.map((s) => ({ ...s, ...(tutorsById.get(Number(s.id)) || {}) })),
        [schedules, tutorsById]
    );

    const timeRows = useMemo(() => buildTimeRows(enrichedSchedules), [enrichedSchedules]);

    const timeOptions = useMemo(() => {
        const set = new Set();
        enrichedSchedules.forEach((s) => {
            set.add(s.start_time);
            set.add(s.end_time);
        });
        return [...set]
            .sort((a, b) => parseTime(a) - parseTime(b))
            .map((t) => ({ value: t.slice(0, 5), label: formatTime12h(t) }));
    }, [enrichedSchedules]);

    const popular = useMemo(
        () => popularBlocks(enrichedSchedules).map((b) => ({
            ...b,
            value_start: b.start_time.slice(0, 5),
            value_end: b.end_time.slice(0, 5),
            label: `${formatTime12h(b.start_time)} – ${formatTime12h(b.end_time)}`,
        })),
        [enrichedSchedules]
    );

    const filteredSchedules = useMemo(
        () => filterSchedules(enrichedSchedules, tutorsById, filters),
        [enrichedSchedules, tutorsById, filters]
    );

    const { resultCount, totalCount, totalWeeklyHours } = useMemo(() => {
        const allIds = new Set();
        const matchIds = new Set();
        enrichedSchedules.forEach((s) => allIds.add(String(s.id)));
        filteredSchedules.forEach((s) => matchIds.add(String(s.id)));
        const hours = [...allIds].reduce((sum, id) => sum + tutorWeeklyHours(enrichedSchedules, id), 0);
        return { resultCount: matchIds.size, totalCount: allIds.size, totalWeeklyHours: hours };
    }, [enrichedSchedules, filteredSchedules]);

    const onFilterChange = useCallback((next) => setFilters(next), []);

    const StatChip = ({ icon, label, value }) => (
        <div className="flex items-center gap-3 rounded-[10px] border border-[#ddd] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <i className={`bx ${icon} text-[22px] text-[#0a84ff]`}></i>
            <div>
                <p className="mb-0 text-[18px] font-bold leading-tight text-[#222]">{value}</p>
                <p className="mb-0 text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">{label}</p>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <section className="section">
                <div className="mx-5 mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col items-start">
                        <h1 className="mb-1 text-[28px] font-bold text-[#222]">Tutor Schedules</h1>
                        <p className="m-0 text-[13px] text-[#666]">
                            Weekly availability overview{tutors.length > 0 ? ` · ${tutors.length} tutors in the tutor roster` : ""}
                        </p>
                    </div>
                    <Link className="inline-flex items-center gap-1.5 rounded-md border border-[#0a84ff] px-4 py-2 text-[13px] font-semibold text-[#0a84ff] transition-colors hover:bg-[#0a84ff] hover:text-white" to={'/tutors/add'}>
                        <i className="bx bx-plus"></i> Add Tutor
                    </Link>
                </div>

                {error && (
                    <div className="mx-5 mb-2.5 rounded-md border border-[#f0a8a8] bg-[#fdecec] px-4 py-3 text-[13px] text-[#b91c1c]">
                        {error}
                    </div>
                )}

                { /*
                <div className="mb-4 flex flex-wrap gap-3 px-5 max-md:px-2.5">
                    <StatChip icon="bx-group" label="Tutors with schedules" value={totalCount} />
                    <StatChip icon="bx-calendar-check" label="Currently matching" value={resultCount} />
                    <StatChip icon="bx-time" label="Weekly hours covered" value={totalWeeklyHours.toFixed(1)} />
                </div>
                */}

                <TutorScheduleFilters
                    filters={filters}
                    onFilterChange={onFilterChange}
                    majors={majors}
                    courses={courses}
                    timeOptions={timeOptions}
                    popularBlocks={popular}
                    resultCount={resultCount}
                    totalCount={totalCount}
                />

                {loading ? (
                    <div className="mx-5 mt-2.5 rounded-[10px] border border-[#ddd] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <Skeleton className="mb-3 h-8 w-1/3" />
                        <div className="grid gap-2">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    </div>
                ) : (
                    <TutorScheduleGrid schedules={filteredSchedules} timeRows={timeRows} />
                )}
            </section>
        </>
    );
}

export default Tutors;