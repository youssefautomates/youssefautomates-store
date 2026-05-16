require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndFix() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }

  console.log("Existing buckets:", buckets.map(b => b.name));

  const exists = buckets.find(b => b.name === 'products');
  if (!exists) {
    console.log("Creating 'products' bucket...");
    const { error: createError } = await supabase.storage.createBucket('products', {
      public: true
    });
    if (createError) {
      console.error("Error creating bucket:", createError);
    } else {
      console.log("Bucket 'products' created successfully.");
    }
  } else {
    console.log("Bucket 'products' already exists. Making sure it's public...");
    await supabase.storage.updateBucket('products', { public: true });
  }

  // Create a policy to allow anyone to upload if not already there? 
  // Usually RLS on buckets is managed in the UI, but we can try to add a generic policy if needed.
  // But 'public: true' usually allows public READ. For UPLOAD, we need RLS policies.
  console.log("Note: You might need to add RLS policies for UPLOAD in the Supabase Dashboard if this still fails.");
}
checkAndFix();
