-- Create dashboard_settings table
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  layout VARCHAR(50) DEFAULT 'default',
  visible_widgets JSONB DEFAULT '["metrics", "revenue", "activity", "bookings"]',
  theme VARCHAR(20) DEFAULT 'light',
  refresh_interval INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_user_id ON dashboard_settings(user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dashboard_settings_updated_at
BEFORE UPDATE ON dashboard_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create or replace function to initialize dashboard settings for new users
CREATE OR REPLACE FUNCTION initialize_dashboard_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dashboard_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create dashboard settings for new users
CREATE TRIGGER create_dashboard_settings_for_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_dashboard_settings();
