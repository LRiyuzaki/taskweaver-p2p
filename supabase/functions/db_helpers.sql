
-- Function to insert a team member device
CREATE OR REPLACE FUNCTION public.insert_team_member_device(
  p_team_member_id UUID,
  p_device_id TEXT,
  p_device_name TEXT,
  p_device_type TEXT,
  p_public_key TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id UUID;
BEGIN
  INSERT INTO public.team_member_devices(
    team_member_id, 
    device_id, 
    device_name, 
    device_type, 
    public_key, 
    registered_at, 
    updated_at, 
    trusted
  )
  VALUES (
    p_team_member_id, 
    p_device_id, 
    p_device_name, 
    p_device_type, 
    p_public_key, 
    NOW(), 
    NOW(), 
    false
  )
  RETURNING id INTO v_device_id;
  
  RETURN v_device_id;
END;
$$;

-- Function to update device trust status
CREATE OR REPLACE FUNCTION public.update_device_trust_status(
  p_device_id TEXT,
  p_trusted BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.team_member_devices
  SET 
    trusted = p_trusted,
    updated_at = NOW()
  WHERE 
    device_id = p_device_id;
  
  RETURN FOUND;
END;
$$;

-- Function to get team member devices
CREATE OR REPLACE FUNCTION public.get_team_member_devices(
  p_team_member_id UUID
)
RETURNS TABLE (
  id UUID,
  team_member_id UUID,
  device_id TEXT,
  device_name TEXT,
  device_type TEXT,
  public_key TEXT,
  registered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  trusted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.team_member_id,
    d.device_id,
    d.device_name,
    d.device_type,
    d.public_key,
    d.registered_at,
    d.updated_at,
    d.trusted
  FROM
    public.team_member_devices d
  WHERE
    d.team_member_id = p_team_member_id;
END;
$$;
