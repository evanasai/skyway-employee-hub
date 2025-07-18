-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false);

-- Create policies for employee documents
CREATE POLICY "Admins can view employee documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'employee-documents');

CREATE POLICY "Admins can upload employee documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'employee-documents');

CREATE POLICY "Admins can update employee documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'employee-documents');

CREATE POLICY "Admins can delete employee documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'employee-documents');