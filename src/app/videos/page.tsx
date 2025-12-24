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
      if (editingId) {
        await updateDoc(doc(db, "videos", editingId), {
          ...form,
          order: Number(form.order),
        });
      } else {
        await addDoc(collection(db, "videos"), {
          ...form,
          order: Number(form.order),
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
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-right">إدارة الفيديوهات</h1>
      <div className="mb-4 text-right">
        <label className="block mb-1 font-semibold text-white">تصفية حسب الدورة</label>
        <select
          className="p-2 rounded border bg-zinc-900 text-white border-zinc-700"
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
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-900 p-4 rounded shadow mb-8"
      >
        <input
          name="title_ar"
          placeholder="عنوان الفيديو (بالعربية)"
          value={form.title_ar || ""}
          onChange={handleChange}
          className="p-2 rounded border text-right"
          required
        />
        <input
          name="title_en"
          placeholder="عنوان الفيديو (بالإنجليزية)"
          value={form.title_en || ""}
          onChange={handleChange}
          className="p-2 rounded border text-right"
          required
        />
        <select
          name="courseId"
          value={form.courseId || ""}
          onChange={handleChange}
          className="p-2 rounded border text-right"
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
          className="p-2 rounded border text-right"
          required
        />
        <div className="col-span-1 md:col-span-2 flex gap-2 justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "تحديث" : "إضافة"} فيديو
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              onClick={() => {
                setForm({});
                setEditingId(null);
              }}
            >
              إلغاء
            </button>
          )}
        </div>
        {error && <div className="text-red-600 col-span-2">{error}</div>}
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-900 rounded shadow text-right" dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>
          <thead>
            <tr>
              <th className="p-2 text-right">عنوان (بالعربية)</th>
              <th className="p-2 text-right">عنوان (بالإنجليزية)</th>
              <th className="p-2 text-right">الدورة</th>
              <th className="p-2 text-right">الترتيب</th>
              <th className="p-2 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">جاري التحميل...</td>
              </tr>
            ) : ([...videos].filter(v => !selectedCourseId || v.courseId === selectedCourseId).length === 0) ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">لا توجد فيديوهات.</td>
              </tr>
            ) : (
              [...videos]
                .filter(v => !selectedCourseId || v.courseId === selectedCourseId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((video) => (
                  <tr key={video.id} className="border-t">
                    <td className="p-2">{video.title_ar}</td>
                    <td className="p-2">{video.title_en}</td>
                    <td className="p-2">
                      {courses.find((c) => c.id === video.courseId)?.titleAr || "-"}
                    </td>
                    <td className="p-2">{video.order}</td>
                    <td className="p-2 flex gap-2 justify-end">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        onClick={() => handleEdit(video)}
                      >
                        تعديل
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
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
