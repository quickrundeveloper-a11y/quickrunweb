const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');

// 1. Load Environment Variables from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key] = value;
    }
  });
}

// 2. Configure Firebase (Client SDK)
const firebaseConfig = {
  apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Config
if (!firebaseConfig.projectId) {
  console.error("Error: Could not load NEXT_PUBLIC_FIREBASE_PROJECT_ID from .env.local");
  console.error("Please ensure .env.local exists and contains your Firebase credentials.");
  process.exit(1);
}

// 3. Initialize App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTIONS_TO_UPDATE = ["grocery", "food", "categories"];

function createSlug(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[\(\)\[\]\{\}]/g, "") // Remove brackets explicitly
    .replace(/[^\w\s-]/g, "")       // Remove other special chars
    .trim()
    .replace(/\s+/g, "-");          // Replace spaces with hyphens
}

async function processCollection(collectionName) {
  console.log(`\nStarting slug generation for collection: ${collectionName}...`);
  
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionName}.`);
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    const batchSize = 500;
    let batch = writeBatch(db);
    let operationCount = 0;

    for (const d of snapshot.docs) {
      const data = d.data();
      
      // Skip if imageSlug already exists
      if (data.imageSlug) {
        skippedCount++;
        continue;
      }

      const name = data.name || data.title; // Check 'name' or 'title'
      if (!name) {
        console.warn(`Skipping doc ${d.id} in ${collectionName}: No 'name' or 'title' field.`);
        continue;
      }

      const imageSlug = createSlug(name);
      
      const docRef = doc(db, collectionName, d.id);
      batch.update(docRef, { imageSlug: imageSlug });
      updatedCount++;
      operationCount++;

      // Commit batch if limit reached
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`Committed batch of ${operationCount} updates...`);
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    // Commit remaining
    if (operationCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${operationCount} updates.`);
    }

    console.log(`--- Summary for ${collectionName} ---`);
    console.log(`Total Documents: ${snapshot.size}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

  } catch (error) {
    console.error(`Error processing ${collectionName}:`, error);
  }
}

async function generateSlugs() {
  console.log(`Project ID: ${firebaseConfig.projectId}`);
  
  for (const colName of COLLECTIONS_TO_UPDATE) {
    await processCollection(colName);
  }
}

generateSlugs();
