// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wzpbwqozhxcoyaaaigrm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGJ3cW96aHhjb3lhYWFpZ3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDI1NzEsImV4cCI6MjA1NzExODU3MX0.LPiimvEIsY2uKexv6KTZyyRRoysxM070QlZPYbn7QPk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);