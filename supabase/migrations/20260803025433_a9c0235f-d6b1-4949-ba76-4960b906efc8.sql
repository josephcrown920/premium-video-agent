CREATE POLICY "artifacts_own_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'artifacts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "artifacts_own_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artifacts' AND (storage.foldername(name))[1] = auth.uid()::text);