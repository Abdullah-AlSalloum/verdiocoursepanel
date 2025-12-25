"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface Course {
  id: string;
  titleAr: string;
}

interface Video {
  id: string;
  title_ar: string;
  title_en: string;
  courseId: string;
  order: number;
  youtubeId?: string; // YouTube link or ID (optional)
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Video>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    const snapshot = await getDocs(collection(db, "courses"));
    setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Course)));
  };

  // Fetch videos
  const fetchVideos = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "videos"));
    setVideos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Video)));
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
    fetchVideos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!form.courseId) {
        setError("Please select a course");
        return;
      }
      if (!form.youtubeId) {
        setError("يرجى إدخال رابط أو معرف فيديو يوتيوب");
        return;
      }
      if (editingId) {
        await updateDoc(doc(db, "videos", editingId), {
          ...form,
          order: Number(form.order),
          youtubeId: form.youtubeId || "",
        });
      } else {
        await addDoc(collection(db, "videos"), {
          ...form,
          order: Number(form.order),
          youtubeId: form.youtubeId || "",
        });
      }
      setForm({});
      setEditingId(null);
      fetchVideos();
    } catch (err) {
      setError("Error saving video");
    }
  };

  const handleEdit = (video: Video) => {
    setForm(video);
    setEditingId(video.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await deleteDoc(doc(db, "videos", id));
    fetchVideos();
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-2 md:px-0" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      <h1 className="text-3xl font-extrabold mb-8 text-blue-700 dark:text-blue-300 text-right">إدارة الفيديوهات</h1>
      <div className="mb-6 text-right">
        <label className="block mb-2 font-semibold text-blue-700 dark:text-blue-200">تصفية حسب الدورة</label>
        <select
          className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-zinc-900 dark:text-white"
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
        >
          <option value="">كل الدورات</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.titleAr}</option>
          ))}
        </select>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 mb-10"
      >
        <input
          name="title_ar"
          placeholder="عنوان الفيديو (بالعربية)"
          value={form.title_ar || ""}
          onChange={handleChange}
          className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <input
          name="title_en"
          placeholder="عنوان الفيديو (بالإنجليزية)"
          value={form.title_en || ""}
          onChange={handleChange}
          className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <select
          name="courseId"
          value={form.courseId || ""}
          onChange={handleChange}
          className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        >
          <option value="">اختر الدورة</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.titleAr}
            </option>
          ))}
        </select>
        <input
          name="order"
          placeholder="ترتيب الفيديو (رقم)"
          type="number"
          value={form.order || ""}
          onChange={handleChange}
          className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <input
          name="youtubeId"
          placeholder="رابط أو معرف فيديو يوتيوب (إجباري)"
          value={form.youtubeId || ""}
          onChange={handleChange}
          className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <div className="col-span-1 md:col-span-2 flex gap-3 justify-end mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {editingId ? "تحديث" : "إضافة"} فيديو
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-400 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-500 transition"
              onClick={() => {
                setForm({});
                setEditingId(null);
              }}
            >
              إلغاء
            </button>
          )}
        </div>
        {error && <div className="text-red-600 col-span-2 font-bold text-right mt-2">{error}</div>}
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-right" dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              <th className="p-3 text-right font-bold text-zinc-700 dark:text-zinc-200">عنوان (بالعربية)</th>
              <th className="p-3 text-right font-bold text-zinc-700 dark:text-zinc-200">عنوان (بالإنجليزية)</th>
              <th className="p-3 text-right font-bold text-zinc-700 dark:text-zinc-200">الدورة</th>
              <th className="p-3 text-right font-bold text-zinc-700 dark:text-zinc-200">الترتيب</th>
              <th className="p-3 text-right font-bold text-zinc-700 dark:text-zinc-200">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-blue-700 dark:text-blue-200 font-bold text-lg">جاري التحميل...</td>
              </tr>
            ) : ([...videos].filter(v => !selectedCourseId || v.courseId === selectedCourseId).length === 0) ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-zinc-500 dark:text-zinc-300 font-bold text-lg">لا توجد فيديوهات.</td>
              </tr>
            ) : (
              [...videos]
                .filter(v => !selectedCourseId || v.courseId === selectedCourseId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((video) => (
                  <tr key={video.id} className="border-t border-zinc-200 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                    <td className="p-3 group-hover:text-blue-700 transition font-bold">{video.title_ar}</td>
                    <td className="p-3">{video.title_en}</td>
                    <td className="p-3">{courses.find((c) => c.id === video.courseId)?.titleAr || "-"}</td>
                    <td className="p-3">{video.order}</td>
                    <td className="p-3 flex gap-3 justify-end">
                      <button
                        className="bg-yellow-500 text-white px-4 py-1 rounded-xl font-bold shadow hover:bg-yellow-600 transition"
                        onClick={() => handleEdit(video)}
                      >
                        تعديل
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-1 rounded-xl font-bold shadow hover:bg-red-700 transition"
                        onClick={() => handleDelete(video.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
