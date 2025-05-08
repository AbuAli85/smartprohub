-- Create dashboard_metrics table for storing aggregated metrics
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_bookings INTEGER NOT NULL DEFAULT 0,
  confirmed_bookings INTEGER NOT NULL DEFAULT 0,
  pending_bookings INTEGER NOT NULL DEFAULT 0,
  cancelled_bookings INTEGER NOT NULL DEFAULT 0,
  total_contracts INTEGER NOT NULL DEFAULT 0,
  signed_contracts INTEGER NOT NULL DEFAULT 0,
  total_contract_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  UNIQUE(user_id)
);

-- Create revenue_data table for storing historical revenue data
CREATE TABLE IF NOT EXISTS revenue_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  source VARCHAR(50),
  UNIQUE(user_id, date, source)
);

-- Create activity_log table for storing user activity
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  related_id UUID,
  related_type VARCHAR(50)
);

-- Create dashboard_settings table for storing user dashboard preferences
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  layout JSONB,
  visible_widgets JSONB,
  time_period VARCHAR(20) DEFAULT 'month',
  UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_id ON dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_data_user_id ON revenue_data(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_data_date ON revenue_data(date);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_user_id ON dashboard_settings(user_id);

-- Create function to update dashboard metrics when a booking is created or updated
CREATE OR REPLACE FUNCTION update_dashboard_metrics_on_booking_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update dashboard metrics
  INSERT INTO dashboard_metrics (
    user_id,
    total_bookings,
    confirmed_bookings,
    pending_bookings,
    cancelled_bookings
  )
  SELECT
    NEW.user_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'confirmed'),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'cancelled')
  FROM
    bookings
  WHERE
    user_id = NEW.user_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_bookings = EXCLUDED.total_bookings,
    confirmed_bookings = EXCLUDED.confirmed_bookings,
    pending_bookings = EXCLUDED.pending_bookings,
    cancelled_bookings = EXCLUDED.cancelled_bookings,
    updated_at = NOW();
  
  -- Log activity
  INSERT INTO activity_log (
    user_id,
    activity_type,
    activity_data,
    related_id,
    related_type
  ) VALUES (
    NEW.user_id,
    'booking_' || TG_OP,
    jsonb_build_object(
      'id', NEW.id,
      'status', NEW.status,
      'service_id', NEW.service_id
    ),
    NEW.id,
    'booking'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking changes
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE update_dashboard_metrics_on_booking_change();

-- Create function to update dashboard metrics when a contract is created or updated
CREATE OR REPLACE FUNCTION update_dashboard_metrics_on_contract_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contract metrics
  INSERT INTO dashboard_metrics (
    user_id,
    total_contracts,
    signed_contracts,
    total_contract_value
  )
  SELECT
    NEW.user_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'signed'),
    SUM(value) FILTER (WHERE status = 'signed')
  FROM
    contracts
  WHERE
    user_id = NEW.user_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_contracts = EXCLUDED.total_contracts,
    signed_contracts = EXCLUDED.signed_contracts,
    total_contract_value = EXCLUDED.total_contract_value,
    updated_at = NOW();
  
  -- If contract is signed, add to revenue data
  IF NEW.status = 'signed' AND OLD.status IS DISTINCT FROM 'signed' THEN
    INSERT INTO revenue_data (
      user_id,
      date,
      revenue,
      source
    ) VALUES (
      NEW.user_id,
      CURRENT_DATE,
      NEW.value,
      'contract'
    )
    ON CONFLICT (user_id, date, source)
    DO UPDATE SET
      revenue = revenue_data.revenue + NEW.value;
  END IF;
  
  -- Log activity
  INSERT INTO activity_log (
    user_id,
    activity_type,
    activity_data,
    related_id,
    related_type
  ) VALUES (
    NEW.user_id,
    'contract_' || TG_OP,
    jsonb_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'status', NEW.status,
      'value', NEW.value
    ),
    NEW.id,
    'contract'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contract changes
CREATE TRIGGER on_contract_change
  AFTER INSERT OR UPDATE ON contracts
  FOR EACH ROW EXECUTE PROCEDURE update_dashboard_metrics_on_contract_change();
