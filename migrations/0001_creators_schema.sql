-- ====================================================================
-- LIBERTADGO: MIGRATION 0001 - MÓDULO CREADORES Y AUTENTICACIÓN
-- Dialecto: PostgreSQL 14+
-- Restricciones territoriales: Exclusivo La Libertad, Perú
-- Integración: Los establecimientos turísticos se vinculan por place_id
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE USUARIOS DEL SISTEMA
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. PERFILES DE CREADORES (OPCIONAL POR USUARIO)
CREATE TABLE IF NOT EXISTS creator_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  handle VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  primary_platform VARCHAR(30) NOT NULL CHECK (primary_platform IN ('tiktok', 'instagram', 'youtube')),
  tiktok_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  total_approved_videos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_handle ON creator_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_public ON creator_profiles(is_public) WHERE is_public = TRUE;

-- 4. PUBLICACIONES DE VIDEO (SUBMISSIONS)
CREATE TABLE IF NOT EXISTS video_submissions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  creator_profile_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE SET NULL,
  platform VARCHAR(30) NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube')),
  external_video_id VARCHAR(100) NOT NULL,
  video_url TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  thumbnail_url TEXT, -- Explicitamente nullable
  title VARCHAR(150) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('PLACE', 'ROUTE', 'GENERAL')),
  category VARCHAR(50) NOT NULL,
  locality_id VARCHAR(50), -- Acotado a localidades de La Libertad
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'OBSERVED', 'HIDDEN')),
  moderation_notes TEXT,
  moderated_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  -- Métricas internas de LibertadGO (diferenciadas de métricas externas de redes)
  internal_views_count INTEGER NOT NULL DEFAULT 0,
  internal_saves_count INTEGER NOT NULL DEFAULT 0,
  -- Métricas externas opcionales en JSON (no inventadas)
  external_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Evitar publicaciones duplicadas por plataforma e identificador externo
  CONSTRAINT uq_platform_external_id UNIQUE (platform, external_video_id)
);

CREATE INDEX IF NOT EXISTS idx_videos_status ON video_submissions(status);
CREATE INDEX IF NOT EXISTS idx_videos_locality ON video_submissions(locality_id);
CREATE INDEX IF NOT EXISTS idx_videos_category ON video_submissions(category);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON video_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_content_type ON video_submissions(content_type);
CREATE INDEX IF NOT EXISTS idx_videos_approved_feed ON video_submissions(created_at DESC) WHERE status = 'APPROVED';

-- 5. RELACIÓN N:M VIDEOS Y LUGARES TURÍSTICOS (DIRECTORIO PLACE)
CREATE TABLE IF NOT EXISTS video_places (
  id VARCHAR(64) PRIMARY KEY,
  video_id VARCHAR(64) NOT NULL REFERENCES video_submissions(id) ON DELETE CASCADE,
  place_id VARCHAR(64) NOT NULL, -- Referencia a Place.id del catálogo existente
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_video_place UNIQUE (video_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_video_places_place_id ON video_places(place_id);
CREATE INDEX IF NOT EXISTS idx_video_places_video_id ON video_places(video_id);

-- 6. REGISTRO AUDITABLE DE MODERACIÓN ADMINISTRATIVA
CREATE TABLE IF NOT EXISTS video_moderation_logs (
  id VARCHAR(64) PRIMARY KEY,
  video_id VARCHAR(64) NOT NULL REFERENCES video_submissions(id) ON DELETE CASCADE,
  admin_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  admin_name VARCHAR(100) NOT NULL,
  previous_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  reason TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_video_id ON video_moderation_logs(video_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_admin_id ON video_moderation_logs(admin_user_id);

-- 7. VIDEOS GUARDADOS POR USUARIOS (BOOKMARKS)
CREATE TABLE IF NOT EXISTS saved_videos (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(64) NOT NULL REFERENCES video_submissions(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_saved_video UNIQUE (user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_videos_user_id ON saved_videos(user_id);

-- 8. DENUNCIAS O REPORTES DE VIDEOS
CREATE TABLE IF NOT EXISTS video_reports (
  id VARCHAR(64) PRIMARY KEY,
  video_id VARCHAR(64) NOT NULL REFERENCES video_submissions(id) ON DELETE CASCADE,
  reported_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('broken_link', 'inappropriate', 'wrong_location', 'spam', 'other')),
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);
