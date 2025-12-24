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

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "quizzes", id));
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white text-right">إدارة الاختبارات</h1>
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
      <form onSubmit={handleSubmit} className="mb-6 bg-zinc-800 p-4 rounded text-right">
        <div className="mb-2">
          <label className="block mb-1 text-zinc-200">الدورة</label>
          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className="w-full p-2 rounded border bg-zinc-900 text-white border-zinc-700 text-right"
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
        <div className="mb-2">
          <label className="block mb-1 text-zinc-200">عنوان الاختبار (بالعربية)</label>
          <input
            name="title_ar"
            value={form.title_ar}
            onChange={handleChange}
            className="w-full p-2 rounded border bg-zinc-900 text-white border-zinc-700 text-right"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1 text-zinc-200">عنوان الاختبار (بالإنجليزية)</label>
          <input
            name="title_en"
            value={form.title_en}
            onChange={handleChange}
            className="w-full p-2 rounded border bg-zinc-900 text-white border-zinc-700 text-right"
            required
          />
        </div>
        {/* إدارة الأسئلة يمكن إضافتها هنا */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition"
        >
          {editingQuiz ? "تحديث الاختبار" : "إضافة اختبار"}
        </button>
        {editingQuiz && (
          <button
            type="button"
            className="ml-2 px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
            onClick={() => {
              setEditingQuiz(null);
              setForm({ courseId: "", title_ar: "", title_en: "", questions: [] });
            }}
          >
            إلغاء
          </button>
        )}
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
