-- ============================================================================
-- Create 'imports' storage bucket for raw file storage
-- Run this in Supabase SQL Editor or via migration
-- ============================================================================

-- Create the imports bucket (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false,
  10485760,  -- 10MB limit
  ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- RLS Policies for storage.objects
-- ============================================================================

-- Policy: Allow authenticated users to upload files to their own folder
-- Folder structure: imports/{userId}/{timestamp}_{filename}
CREATE POLICY "Users can upload to their own imports folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Policy: Allow authenticated users to read their own files
CREATE POLICY "Users can read their own imports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Policy: Allow authenticated users to update their own files
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

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own imports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
