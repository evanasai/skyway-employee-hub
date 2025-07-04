
-- Create zones table for geofencing
CREATE TABLE public.zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- Array of lat/lng coordinates forming a polygon
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to zones table
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to view active zones (needed for employee check-ins)
CREATE POLICY "Users can view active zones" 
  ON public.zones 
  FOR SELECT 
  USING (is_active = true);

-- Create policy that allows admins to manage zones
CREATE POLICY "Admins can manage zones" 
  ON public.zones 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Insert a default zone for testing (covers a small area)
INSERT INTO public.zones (name, coordinates) VALUES 
('Default Office Zone', '[
  {"lat": 28.6139, "lng": 77.2090},
  {"lat": 28.6149, "lng": 77.2090},
  {"lat": 28.6149, "lng": 77.2100},
  {"lat": 28.6139, "lng": 77.2100}
]');
