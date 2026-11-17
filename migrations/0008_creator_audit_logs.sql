-- ====================================================================
-- RIYMO / LIBERTADGO: MIGRATION 0008 - TRAZABILIDAD DE CREADORES
-- Propósito: Tabla inmutable de auditoría para perfiles de creadores.
-- Registra eventos de creación, edición y cambios de visibilidad (is_public).
-- NOTA: NO EJECUTAR AUTOMÁTICAMENTE. Pendiente de autorización en Neon PostgreSQL.
-- Mientras no se ejecute, el backend gestiona la trazabilidad en búfer
-- de memoria persistente de forma segura y transparente.
-- ====================================================================

CREATE TABLE IF NOT EXISTS creator_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  admin_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  admin_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'VISIBILITY_CHANGE')),
  previous_data JSONB,
  new_data JSONB,
  change_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_audit_creator_id ON creator_audit_logs(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_audit_created_at ON creator_audit_logs(created_at DESC);
