-- Storage Policies for "imports" bucket
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Allow authenticated users to upload files in their own folder
CREATE POLICY "Users can upload files to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to update their own files (for upsert)
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
