-- ============================================================================
-- Setup 'imports' storage bucket for raw file storage
--
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This script is idempotent (safe to run multiple times)
-- ============================================================================

-- Step 1: Create the imports bucket (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false,  -- private bucket
  10485760,  -- 10MB file size limit
  ARRAY[
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can upload to their own imports folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own imports" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own imports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own imports" ON storage.objects;

-- Step 3: Create RLS policies
-- File path structure: imports/{userId}/{timestamp}_{filename}

-- INSERT policy: Allow users to upload to their folder
CREATE POLICY "Users can upload to their own imports folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- SELECT policy: Allow users to download their files
CREATE POLICY "Users can read their own imports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- UPDATE policy: Allow users to update their files
CREATE POLICY "Users can update their own imports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- DELETE policy: Allow users to delete their files
CREATE POLICY "Users can delete their own imports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Step 4: Verify setup
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'imports';

-- Show created policies
SELECT
  policyname,
  tablename,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%imports%';
