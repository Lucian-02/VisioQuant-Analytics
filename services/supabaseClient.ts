
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// PRODUCTION CONFIGURATION
// Please replace the values below with your actual Supabase project details.
// Once these are set, the app will work automatically on any device.
// ------------------------------------------------------------------

// TODO: PASTE YOUR SUPABASE URL HERE (e.g., https://xyz.supabase.co)
const SUPABASE_URL: string = 'https://njnfzumbpxajbvthqgby.supabase.co'; 

// TODO: PASTE YOUR SUPABASE ANON PUBLIC KEY HERE
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbmZ6dW1icHhhamJ2dGhxZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTEyMDIsImV4cCI6MjA4MTAyNzIwMn0.546qFjo2HgqeuSGlfrDV_7Vg9Y0peg-Vw1DkzDsU79o';

// Helper to sanitize inputs
const cleanUrl = SUPABASE_URL ? SUPABASE_URL.trim() : '';
const cleanKey = SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.trim() : '';

// Check if keys are still placeholders or invalid
export const isConfigured = () => {
  return cleanUrl !== 'YOUR_SUPABASE_URL_HERE' && 
         cleanUrl.startsWith('http') &&
         cleanKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
         cleanKey.length > 0;
};

// Initialize Supabase Client Safely
// We wrap this in a try-catch to prevent the entire app from crashing (White Screen of Death)
// if the user accidentally pastes an invalid URL string.
let client: SupabaseClient;

try {
    if (isConfigured()) {
        client = createClient(cleanUrl, cleanKey);
    } else {
        // Use placeholder if not configured yet to keep the app running
        client = createClient('https://placeholder.supabase.co', 'placeholder');
    }
} catch (error) {
    console.error("Supabase Client Initialization Failed:", error);
    // Fallback to placeholder so the UI can render the error screen instead of crashing
    client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
