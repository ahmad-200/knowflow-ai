import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zibbybksaogdqqycqyrw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYmJ5YmtzYW9nZHFxeWNxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MTQzODEsImV4cCI6MjEwMTQ5MDM4MX0.wH6tpF0atBU6yCp2d1n6lgqMGqqb161CRh-Ne9buIug";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);