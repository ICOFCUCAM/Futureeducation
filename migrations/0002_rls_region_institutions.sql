-- ============================================
-- 0002 — RLS on region_configs and institutions
-- region_configs: world-readable (region picker on login).
-- institutions:   readable to signed-in users.
-- Writes on both: admins only.
-- ============================================

ALTER TABLE public.region_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY region_configs_read   ON public.region_configs FOR SELECT TO authenticated USING (true);
  CREATE POLICY region_configs_anon   ON public.region_configs FOR SELECT TO anon          USING (true);
  CREATE POLICY region_configs_write  ON public.region_configs FOR ALL    TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
  CREATE POLICY institutions_read     ON public.institutions   FOR SELECT TO authenticated USING (true);
  CREATE POLICY institutions_write    ON public.institutions   FOR ALL    TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
