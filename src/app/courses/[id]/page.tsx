"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../firebase";
import { getDocs, collection, query, where } from "firebase/firestore";

interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  imageUrl: string;
  instructor: string;
}

export default function CourseDetailsPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonCount, setLessonCount] = useState<number>(0);
  const router = useRouter();
  const params = useParams();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      const snapshot = await getDocs(collection(db, "courses"));
      const found = snapshot.docs.find((doc) => doc.id === courseId);
      if (found) {
        setCourse({ id: found.id, ...found.data() } as Course);
        // Fetch videos for this course to count lessons
        const videosSnap = await getDocs(query(collection(db, "videos"), where("courseId", "==", courseId)));
        setLessonCount(videosSnap.size);
      }
      setLoading(false);
    };
    if (courseId) fetchCourseAndLessons();
  }, [courseId]);

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!course) return <div className="text-red-500 p-8">Course not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-zinc-900 rounded shadow p-6 flex flex-col md:flex-row gap-6 items-center">
        <img src={course.imageUrl} alt={course.titleEn} className="w-48 h-48 object-cover rounded" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{course.titleAr} / {course.titleEn}</h1>
          <p className="text-zinc-300 mb-2">{course.descriptionAr}</p>
          <div className="text-zinc-400 mb-2">Instructor: {course.instructor}</div>
          <div className="text-zinc-400 mb-2">Lessons: {lessonCount}</div>
        </div>
      </div>
      {/* TODO: Add videos and quiz management for this course here */}
      <div className="mt-8">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => router.push(`/videos?courseId=${course.id}`)}
        >
          Manage Videos
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ml-4"
          onClick={() => router.push(`/quizzes?courseId=${course.id}`)}
        >
          Manage Final Quiz
        </button>
      </div>
    </div>
  );
}
