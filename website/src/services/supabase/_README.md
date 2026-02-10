## SUPABASE SQL FUNCTIONS

| ------ | ----------------------------------- | -------------------------------------------------------------------------- | -------- |
| schema | function_name | arguments | language |
| ------ | ----------------------------------- | -------------------------------------------------------------------------- | -------- |
| public | get_library_downloads | p_category text, p_id text, p_library text, p_release text, p_version text | sql |
| public | get_library_downloads_aggregates | p_category text, p_library text, p_release text, p_id text | sql |
| public | get_library_downloads_daily | p_days integer, p_category text, p_library text, p_release text, p_id text | sql |
| ------ | ----------------------------------- | -------------------------------------------------------------------------- | -------- |

/\*

- ────────────────────────────────────────────────────────────────
- Function: get_library_downloads
- ────────────────────────────────────────────────────────────────
- Purpose:
- Returns the total number of downloads for a single blueprint
- from the `library_downloads` table.
-
- Scope:
- • Transactional / per-blueprint counting
- • Used by frontend components (e.g. BlueprintImportCard,
-     BlueprintPage) to display total download counts
-
- Behavior:
- • `p_category` and `p_id` are REQUIRED
- • `p_library`, `p_release`, and `p_version` are OPTIONAL filters
- • Passing NULL to an optional parameter disables that filter
-
- Notes:
- • This function is NOT an analytics aggregate
- • It performs a raw COUNT(\*) over matching rows
- • Safe to call frequently (read-only, deterministic)
-
- Parameter Order (intentional):
- 1.  p_category
- 2.  p_id
- 3.  p_library
- 4.  p_release
- 5.  p_version
-
- Returns:
- bigint — total matching download records
  _/
  CREATE OR REPLACE FUNCTION public.get_library_downloads(
  p_category text,
  p_id text,
  p_library text DEFAULT NULL,
  p_release text DEFAULT NULL,
  p_version text DEFAULT NULL
  )
  RETURNS bigint
  LANGUAGE sql
  STABLE
  AS $$
  SELECT count(_)::bigint
  FROM public.library_downloads
  WHERE blueprint_category = p_category
  AND blueprint_id = p_id
  AND (p_library IS NULL OR blueprint_library = p_library)
  AND (p_release IS NULL OR blueprint_release = p_release)
  AND (p_version IS NULL OR blueprint_version = p_version);
  $$;

/\*

- ────────────────────────────────────────────────────────────────
- Function: get_library_downloads_aggregates
- ────────────────────────────────────────────────────────────────
- Purpose:
- Canonical analytics aggregate for library download metrics.
-
- Behavior:
- - Supports NULL filters for analytics (ALL dimensions)
- - Aggregates per (category, library, release, blueprint_id)
- - Used by metrics dashboard and analytics views
-
- Parameters (ORDER IS SIGNIFICANT):
- p_category → blueprint_category filter (nullable)
- p_library → blueprint_library filter (nullable)
- p_release → blueprint_release filter (nullable)
- p_id → blueprint_id filter (nullable)
-
- Returns:
- total_downloads → bigint
- last*downloaded → timestamptz
  */
  CREATE OR REPLACE FUNCTION public.get*library_downloads_aggregates(
  p_category text DEFAULT NULL,
  p_library text DEFAULT NULL,
  p_release text DEFAULT NULL,
  p_id text DEFAULT NULL
  )
  RETURNS TABLE (
  blueprint_category text,
  blueprint_library text,
  blueprint_release text,
  blueprint_id text,
  total_downloads bigint,
  last_downloaded timestamptz
  )
  LANGUAGE sql
  STABLE
  AS $$
  SELECT
  blueprint_category,
  blueprint_library,
  blueprint_release,
  blueprint_id,
  COUNT(*)::bigint AS total_downloads,
  MAX(download_date) AS last_downloaded
  FROM public.library_downloads
  WHERE
  (p_category IS NULL OR blueprint_category = p_category)
  AND (p_library IS NULL OR blueprint_library = p_library)
  AND (p_release IS NULL OR blueprint_release = p_release)
  AND (p_id IS NULL OR blueprint_id = p_id)
  GROUP BY
  blueprint_category,
  blueprint_library,
  blueprint_release,
  blueprint_id;
  $$;

/\*

- ────────────────────────────────────────────────────────────────
- Function: get_library_downloads_daily
- ────────────────────────────────────────────────────────────────
- Purpose:
- Daily download time series for library-level analytics.
-
- Notes:
- - Operates on public.library_downloads
- - All filters are optional (NULL = no filter)
- - Returns one row per calendar day
- - Canonical parameter order is LOCKED:
-       (p_days, p_category, p_library, p_release, p_id)
  _/
  CREATE OR REPLACE FUNCTION public.get_library_downloads_daily(
  p_days integer,
  p_category text DEFAULT NULL,
  p_library text DEFAULT NULL,
  p_release text DEFAULT NULL,
  p_id text DEFAULT NULL
  )
  RETURNS TABLE (
  day date,
  total bigint
  )
  LANGUAGE sql
  STABLE
  AS $$
  SELECT
  DATE(download_date) AS day,
  COUNT(_)::bigint AS total
  FROM public.library_downloads
  WHERE download_date >= (CURRENT_DATE - p_days)
  AND (p_category IS NULL OR blueprint_category = p_category)
  AND (p_library IS NULL OR blueprint_library = p_library)
  AND (p_release IS NULL OR blueprint_release = p_release)
  AND (p_id IS NULL OR blueprint_id = p_id)
  GROUP BY DATE(download_date)
  ORDER BY day ASC;
  $$;
