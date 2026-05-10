-- +migrate up
ALTER TABLE modulos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE modulos SET imagen_url = NULL WHERE imagen_url IS NULL;
UPDATE productos SET activo = true WHERE activo IS NULL;

-- +migrate down
ALTER TABLE modulos DROP COLUMN IF EXISTS imagen_url;
ALTER TABLE productos DROP COLUMN IF EXISTS activo;
ALTER TABLE cotizaciones DROP COLUMN IF EXISTS updated_at;
