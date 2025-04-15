
// Supabase configuration constants
export const SUPABASE_URL = "https://wweihgiklnxetpqcpyyf.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3ZWloZ2lrbG54ZXRwcWNweXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MzcxMzksImV4cCI6MjA1MTIxMzEzOX0.MGXo-JjykqeUfnD6Zb7yhj6Klz7Wr1JND9WLpffnjUA";

// API endpoint paths
export const API_ENDPOINTS = {
  INSERT_DEVICE: '/rest/v1/rpc/insert_team_member_device',
  UPDATE_TRUST_STATUS: '/rest/v1/rpc/update_device_trust_status',
  GET_DEVICES: '/rest/v1/rpc/get_team_member_devices'
} as const;
