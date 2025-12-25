"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../firebase";
import { getDocs, collection, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";


interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  imageUrl: string;
  instructor: string;
}

interface Video {
  id: string;
  title_ar: string;
  title_en?: string;
  order: number;
  videoUrl?: string;
  youtubeId?: string;
  courseId?: string;
}


const CoursePage = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Video>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const params = useParams();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const courseSnap = await getDocs(collection(db, "courses"));
      const found = courseSnap.docs.find((doc) => doc.id === courseId);
      if (found) setCourse({ id: found.id, ...found.data() } as Course);
      const videosSnap = await getDocs(query(collection(db, "videos"), where("courseId", "==", courseId)));
      setVideos(videosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Video)));
      setLoading(false);
    };
    if (courseId) fetchData();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper to extract YouTube video ID from URL or input
  function extractYouTubeId(input: string): string {
    // If input is already an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    // Try to extract from full URL
    const match = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Calculate next order automatically
      const nextOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order || 0)) + 1 : 1;
      let youtubeId = form.youtubeId || "";
      if (form.youtubeId) {
        youtubeId = extractYouTubeId(form.youtubeId);
      }
      if (editingId) {
        await updateDoc(doc(db, "videos", editingId), {
          title_ar: form.title_ar,
          courseId,
          order: form.order || nextOrder,
          youtubeId,
        });
      } else {
        await addDoc(collection(db, "videos"), {
          title_ar: form.title_ar,
          courseId,
          order: nextOrder,
          youtubeId,
        });
      }
      setForm({});
      setEditingId(null);
      // Refresh videos
      const videosSnap = await getDocs(query(collection(db, "videos"), where("courseId", "==", courseId)));
      setVideos(videosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Video)));
    } catch (err) {
      setError("حدث خطأ أثناء حفظ الفيديو. حاول مرة أخرى.");
    }
  };

  const handleEdit = (video: Video) => {
    setForm(video);
    setEditingId(video.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الفيديو؟")) return;
    await deleteDoc(doc(db, "videos", id));
    // Refresh videos
    const videosSnap = await getDocs(query(collection(db, "videos"), where("courseId", "==", courseId)));
    setVideos(videosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Video)));
  };

  if (loading) return <div className="text-white p-8">جاري التحميل...</div>;
  if (!course) return <div className="text-red-500 p-8">لم يتم العثور على الدورة.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col md:flex-row gap-8 items-center mb-10">
        <img src={course.imageUrl} alt={course.titleEn} className="w-40 h-40 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700" />
        <div className="flex-1 text-right">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 mb-2">{course.titleAr} / {course.titleEn}</h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-2 font-medium">{course.descriptionAr}</p>
          <div className="text-zinc-500 dark:text-zinc-400 mb-2">المدرس: {course.instructor}</div>
          <div className="text-zinc-400 mb-2">عدد الدروس: {videos.length}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200">إضافة / تعديل فيديو</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <input
            name="title_ar"
            placeholder="عنوان الفيديو (بالعربية)"
            value={form.title_ar || ""}
            onChange={handleChange}
            className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <input
            name="youtubeId"
            placeholder="رابط أو معرف فيديو يوتيوب (اختياري)"
            value={form.youtubeId || ""}
            onChange={handleChange}
            className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {editingId ? "تحديث الفيديو" : "إضافة الفيديو"}
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
          {error && <div className="text-red-600 font-bold text-right mt-2">{error}</div>}
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200">قائمة الفيديوهات</h2>
        {videos.length === 0 ? (
          <div className="text-zinc-500 dark:text-zinc-300 text-center py-8">لا توجد فيديوهات بعد.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {videos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((video) => (
              <div key={video.id} className="flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-xl shadow p-4 gap-4 hover:bg-blue-50 dark:hover:bg-zinc-700 transition">
                <div className="flex-1 text-right">
                  <div className="font-bold text-lg text-zinc-900 dark:text-white mb-1">درس :{video.order} {video.title_ar}</div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-300 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    </svg>
                    <span>الأسئلة: 0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">{video.order}</span>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    onClick={() => handleEdit(video)}
                  >
                    تعديل
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    onClick={() => handleDelete(video.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
