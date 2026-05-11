-- +migrate up
ALTER TABLE subcategorias ADD COLUMN IF NOT EXISTS prefijo_codigo VARCHAR(4);

-- +migrate down
ALTER TABLE subcategorias DROP COLUMN IF EXISTS prefijo_codigo;