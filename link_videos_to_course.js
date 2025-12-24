// Usage: node link_videos_to_course.js <courseId>
// Make sure you have a service account key and set GOOGLE_APPLICATION_CREDENTIALS env variable

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (process.argv.length < 3) {
  console.error('Usage: node link_videos_to_course.js <courseId>');
  process.exit(1);
}

const courseId = process.argv[2];

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function linkAllVideosToCourse() {
  const videosRef = db.collection('videos');
  const snapshot = await videosRef.get();
  const batch = db.batch();
  let count = 0;

  snapshot.forEach((doc) => {
    batch.update(doc.ref, { courseId });
    count++;
  });

  await batch.commit();
  console.log(`Linked ${count} videos to courseId: ${courseId}`);
}

linkAllVideosToCourse().catch((err) => {
  console.error('Error linking videos:', err);
  process.exit(1);
});
