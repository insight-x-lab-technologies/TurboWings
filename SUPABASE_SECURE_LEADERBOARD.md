# TurboWings - Leaderboard global seguro com Supabase Edge Function

Este guia descreve a forma mais simples de manter o jogo em GitHub Pages e codigo aberto, mas impedir que o browser grave diretamente resultados no banco. A ideia e:

1. O cliente continua lendo leaderboards com a chave publica do Supabase.
2. O cliente deixa de fazer `insert` direto em `global_scores` e `daily_scores`.
3. Uma Supabase Edge Function chamada `submit-score` recebe o resultado, valida regras basicas e grava usando `SUPABASE_SERVICE_ROLE_KEY`.
4. O banco bloqueia `insert`, `update` e `delete` para `anon` e `authenticated`.

Referencias oficiais:
- Edge Functions: https://supabase.com/docs/guides/functions/quickstart
- Secrets em Edge Functions: https://supabase.com/docs/guides/functions/secrets
- CORS em Edge Functions: https://supabase.com/docs/guides/functions/cors
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- API keys: https://supabase.com/docs/guides/api/api-keys

## 1. Ajustar seguranca das tabelas

No Supabase Dashboard, abra SQL Editor e rode:

```sql
alter table public.players enable row level security;
alter table public.global_scores enable row level security;
alter table public.daily_scores enable row level security;

drop policy if exists "public read players" on public.players;
drop policy if exists "public read global_scores" on public.global_scores;
drop policy if exists "public read daily_scores" on public.daily_scores;

create policy "public read players"
on public.players
for select
to anon, authenticated
using (true);

create policy "public read global_scores"
on public.global_scores
for select
to anon, authenticated
using (true);

create policy "public read daily_scores"
on public.daily_scores
for select
to anon, authenticated
using (true);

revoke insert, update, delete on public.players from anon, authenticated;
revoke insert, update, delete on public.global_scores from anon, authenticated;
revoke insert, update, delete on public.daily_scores from anon, authenticated;

grant select on public.players to anon, authenticated;
grant select on public.global_scores to anon, authenticated;
grant select on public.daily_scores to anon, authenticated;

grant select, insert, update, delete on public.players to service_role;
grant select, insert, update, delete on public.global_scores to service_role;
grant select, insert, update, delete on public.daily_scores to service_role;
```

Opcional, mas recomendado para evitar varios registros diarios do mesmo jogador:

```sql
create unique index if not exists daily_scores_player_day_unique
on public.daily_scores (player_id, challenge_date);
```

Opcional para auditoria:

```sql
alter table public.global_scores
add column if not exists client_version text,
add column if not exists validation_hash text;

alter table public.daily_scores
add column if not exists client_version text,
add column if not exists validation_hash text;
```

## 2. Criar a Edge Function

Instale e autentique a Supabase CLI, se ainda nao tiver:

```bash
npm install -g supabase
supabase login
supabase link --project-ref SEU_PROJECT_REF
```

Crie a funcao:

```bash
supabase functions new submit-score
```

Substitua o arquivo `supabase/functions/submit-score/index.ts` por:

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type ScorePayload = {
  playerName?: string;
  score?: number;
  difficultyId?: string;
  coinsCollected?: number;
  flightLevelReached?: number;
  durationSeconds?: number;
  obstaclesPassed?: number;
  powerUpsCollected?: number;
  isDaily?: boolean;
  challengeDate?: string;
  clientVersion?: string;
};

const DIFFICULTIES = new Set(["breeze", "normal", "storm", "turbo", "legend"]);
const MAX_RUN_SECONDS = 60 * 30;
const MAX_SCORE_PER_SECOND = 12;
const MAX_SCORE_GRACE = 50;
const MAX_COINS_PER_SECOND = 8;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function normalizeName(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function normalizeInt(value: unknown, min: number, max: number) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function validate(payload: ScorePayload) {
  const playerName = normalizeName(payload.playerName);
  const difficultyId = String(payload.difficultyId || "normal");
  const score = normalizeInt(payload.score, 0, 1000000);
  const durationSeconds = normalizeInt(payload.durationSeconds, 0, MAX_RUN_SECONDS);
  const coinsCollected = normalizeInt(payload.coinsCollected, 0, 1000000);
  const flightLevelReached = normalizeInt(payload.flightLevelReached, 1, 999);
  const obstaclesPassed = normalizeInt(payload.obstaclesPassed, 0, 1000000);
  const powerUpsCollected = normalizeInt(payload.powerUpsCollected, 0, 1000000);
  const isDaily = !!payload.isDaily;
  const challengeDate = String(payload.challengeDate || todayUtc());
  const clientVersion = String(payload.clientVersion || "unknown").slice(0, 40);

  if (!playerName) return { ok: false, error: "invalid_player" };
  if (!DIFFICULTIES.has(difficultyId)) return { ok: false, error: "invalid_difficulty" };
  if (isDaily && challengeDate !== todayUtc()) return { ok: false, error: "invalid_daily_date" };
  if (score > durationSeconds * MAX_SCORE_PER_SECOND + MAX_SCORE_GRACE) {
    return { ok: false, error: "score_out_of_bounds" };
  }
  if (coinsCollected > durationSeconds * MAX_COINS_PER_SECOND + 30) {
    return { ok: false, error: "coins_out_of_bounds" };
  }
  if (obstaclesPassed > score + 10) return { ok: false, error: "obstacles_out_of_bounds" };

  return {
    ok: true,
    data: {
      playerName,
      difficultyId,
      score,
      durationSeconds,
      coinsCollected,
      flightLevelReached,
      obstaclesPassed,
      powerUpsCollected,
      isDaily,
      challengeDate,
      clientVersion
    }
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const hashSecret = Deno.env.get("LEADERBOARD_HASH_SECRET") || "change-me";

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "server_not_configured" }, 500);
  }

  let payload: ScorePayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const result = validate(payload);
  if (!result.ok) {
    return json({ error: result.error }, 400);
  }

  const data = result.data;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const usernameKey = data.playerName.toLowerCase();
  let { data: player, error: playerLookupError } = await supabase
    .from("players")
    .select("id, username")
    .eq("username_key", usernameKey)
    .maybeSingle();

  if (playerLookupError) return json({ error: "player_lookup_failed" }, 500);

  if (!player) {
    const created = await supabase
      .from("players")
      .insert({
        username: data.playerName,
        username_key: usernameKey
      })
      .select("id, username")
      .single();

    if (created.error) return json({ error: "player_create_failed" }, 500);
    player = created.data;
  }

  const validationHash = await sha256(
    `${hashSecret}:${player.id}:${data.score}:${data.difficultyId}:${data.challengeDate}:${data.durationSeconds}`
  );

  if (data.isDaily) {
    const existing = await supabase
      .from("daily_scores")
      .select("id, score")
      .eq("player_id", player.id)
      .eq("challenge_date", data.challengeDate)
      .maybeSingle();

    if (existing.error) return json({ error: "daily_lookup_failed" }, 500);
    if (existing.data && existing.data.score >= data.score) {
      return json({ ok: true, accepted: false, reason: "lower_than_existing" });
    }

    const row = {
      player_id: player.id,
      player_name: data.playerName,
      challenge_date: data.challengeDate,
      score: data.score,
      coins_collected: data.coinsCollected,
      client_version: data.clientVersion,
      validation_hash: validationHash
    };

    const saved = existing.data
      ? await supabase.from("daily_scores").update(row).eq("id", existing.data.id).select().single()
      : await supabase.from("daily_scores").insert(row).select().single();

    if (saved.error) return json({ error: "daily_save_failed" }, 500);
    return json({ ok: true, accepted: true, row: saved.data });
  }

  const saved = await supabase
    .from("global_scores")
    .insert({
      player_id: player.id,
      player_name: data.playerName,
      score: data.score,
      difficulty_id: data.difficultyId,
      coins_collected: data.coinsCollected,
      flight_level: data.flightLevelReached,
      duration_seconds: data.durationSeconds,
      client_version: data.clientVersion,
      validation_hash: validationHash
    })
    .select()
    .single();

  if (saved.error) return json({ error: "global_save_failed" }, 500);
  return json({ ok: true, accepted: true, row: saved.data });
});
```

## 3. Configurar secrets

No dashboard do Supabase, copie a `service_role key` em Project Settings > API.

Configure os secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY"
supabase secrets set LEADERBOARD_HASH_SECRET="um-texto-grande-aleatorio"
```

Nao coloque estes valores no GitHub.

## 4. Deploy

```bash
supabase functions deploy submit-score
```

A URL final fica neste formato:

```text
https://SEU_PROJECT_REF.supabase.co/functions/v1/submit-score
```

## 5. Teste manual

```bash
curl -i -X POST "https://SEU_PROJECT_REF.supabase.co/functions/v1/submit-score" \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "Teste",
    "score": 120,
    "difficultyId": "normal",
    "coinsCollected": 10,
    "flightLevelReached": 2,
    "durationSeconds": 30,
    "obstaclesPassed": 20,
    "powerUpsCollected": 1,
    "isDaily": false,
    "clientVersion": "v1"
  }'
```

Esperado:

```json
{"ok":true,"accepted":true}
```

## 6. Alteracao necessaria no jogo

Depois da funcao estar publicada, altere o JavaScript do jogo para:

1. Continuar usando a chave publica apenas para ler leaderboards.
2. Parar de chamar `insert` direto em `global_scores` e `daily_scores`.
3. Chamar `submit-score` via `fetch`.

Exemplo:

```js
async function submitScoreSecure(scoreData) {
  const response = await fetch("https://SEU_PROJECT_REF.supabase.co/functions/v1/submit-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerName: scoreData.playerName,
      score: scoreData.score,
      difficultyId: scoreData.difficultyId,
      coinsCollected: scoreData.coinsCollected,
      flightLevelReached: scoreData.flightLevelReached,
      durationSeconds: scoreData.timeSurvived,
      obstaclesPassed: scoreData.obstaclesPassed,
      powerUpsCollected: scoreData.powerUpsCollected,
      isDaily: !!scoreData.isDaily,
      challengeDate: scoreData.challengeDate,
      clientVersion: "v1"
    })
  });

  return response.json();
}
```

## 7. Limites desta seguranca

Isto nao torna o leaderboard impossivel de fraudar, porque o cliente ainda roda no browser do jogador. Mas melhora muito:

- A chave de escrita deixa de estar no JavaScript.
- O banco rejeita escrita direta com a chave publica.
- Scores absurdos sao bloqueados antes de chegar ao banco.
- A tabela ganha trilha de auditoria com `validation_hash`.
- As regras ficam centralizadas e podem ser endurecidas sem republicar o jogo.

Para uma seguranca ainda maior no futuro, registre eventos resumidos da partida e valide a evolucao do score no servidor.
