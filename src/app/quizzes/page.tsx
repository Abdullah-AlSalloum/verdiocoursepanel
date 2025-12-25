"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
}

interface Quiz {
  id: string;
  courseId: string;
  title_ar: string;
  title_en: string;
  questions: any[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [form, setForm] = useState({
    courseId: "",
    title_ar: "",
    title_en: "",
    questions: [] as any[],
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Delete quiz by id
  const handleDelete = async (quizId: string) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الاختبار؟")) return;
    try {
      await deleteDoc(doc(db, "quizzes", quizId));
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (error) {
      alert("حدث خطأ أثناء الحذف. حاول مرة أخرى.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const courseSnap = await getDocs(collection(db, "courses"));
      setCourses(courseSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Course)));
      const quizSnap = await getDocs(collection(db, "quizzes"));
      setQuizzes(quizSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Quiz)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuiz) {
      await updateDoc(doc(db, "quizzes", editingQuiz.id), form);
      setQuizzes((prev) => prev.map((q) => (q.id === editingQuiz.id ? { ...q, ...form } : q)));
    } else {
      const docRef = await addDoc(collection(db, "quizzes"), form);
      setQuizzes((prev) => [...prev, { ...form, id: docRef.id }]);
    }
    setEditingQuiz(null);
    setForm({ courseId: "", title_ar: "", title_en: "", questions: [] });
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setForm({
      courseId: quiz.courseId,
      title_ar: quiz.title_ar,
      title_en: quiz.title_en,
      questions: quiz.questions || [],
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-2 md:px-0" dir="rtl" style={{ fontFamily: 'Cairo, Noto Sans Arabic, sans-serif' }}>
      {/* ...existing code for the page layout, form, and table... */}
      <h1 className="text-3xl font-extrabold mb-8 text-blue-700 dark:text-blue-300 text-right">إدارة الاختبارات</h1>
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
      <form onSubmit={handleSubmit} className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-right">
        <div className="col-span-1 md:col-span-2">
          <label className="block mb-2 font-semibold text-zinc-700 dark:text-zinc-200">الدورة</label>
          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          >
            <option value="">اختر الدورة</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titleAr} / {c.titleEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-zinc-700 dark:text-zinc-200">عنوان الاختبار (بالعربية)</label>
          <input
            name="title_ar"
            value={form.title_ar}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-zinc-700 dark:text-zinc-200">عنوان الاختبار (بالإنجليزية)</label>
          <input
            name="title_en"
            value={form.title_en}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
        </div>
        <div className="col-span-1 md:col-span-2 flex gap-3 justify-end mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {editingQuiz ? "تحديث" : "إضافة"}
          </button>
          {editingQuiz && (
            <button
              type="button"
              className="bg-gray-400 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-500 transition"
              onClick={() => {
                setEditingQuiz(null);
                setForm({ courseId: "", title_ar: "", title_en: "", questions: [] });
              }}
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-zinc-900 rounded shadow text-white text-right" dir="rtl" style={{fontFamily: 'Cairo, Noto Sans Arabic, sans-serif'}}>
          <thead>
            <tr>
              <th className="p-2 text-right text-zinc-200">الدورة</th>
              <th className="p-2 text-right text-zinc-200">عنوان (بالعربية)</th>
              <th className="p-2 text-right text-zinc-200">عنوان (بالإنجليزية)</th>
              <th className="p-2 text-right text-zinc-200">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-zinc-400">جاري التحميل...</td>
              </tr>
            ) : (quizzes.filter(q => !selectedCourseId || q.courseId === selectedCourseId).length === 0) ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-zinc-400">لا توجد اختبارات.</td>
              </tr>
            ) : (
              quizzes
                .filter(q => !selectedCourseId || q.courseId === selectedCourseId)
                .map((quiz) => (
                  <tr key={quiz.id} className="border-t border-zinc-700">
                    <td className="p-2">{courses.find((c) => c.id === quiz.courseId)?.titleAr || "-"}</td>
                    <td className="p-2">{quiz.title_ar}</td>
                    <td className="p-2">{quiz.title_en}</td>
                    <td className="p-2 flex gap-2 justify-end">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        onClick={() => handleEdit(quiz)}
                      >
                        تعديل
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                        onClick={() => handleDelete(quiz.id)}
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
