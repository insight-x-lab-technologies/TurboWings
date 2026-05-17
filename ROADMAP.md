# TurboWings — Roadmap de Melhorias

> Branch de desenvolvimento: `develop/v2`
> Última atualização: 2026-05-16

---

## Grupo 1 — Engajamento e Retenção

### 1.1 Loja de Aeronaves (Shop)
**Status:** ✅ Implementado

Permite gastar moedas acumuladas para comprar e equipar novas aeronaves cosméticas.

- Catálogo de 8 aeronaves com preços progressivos
- Tela de loja acessível pela Home
- Estados: Equipada / Equipar / Comprar (mostra preço) / Bloqueada
- Seleção da aeronave persiste no localStorage
- Imagens da aeronave buscadas em `src/assets/images/jets/`

**Arquivos de imagem esperados (criar e subir):**
```
src/assets/images/jets/jet_phantom.png
src/assets/images/jets/jet_viper.png
src/assets/images/jets/jet_storm.png
src/assets/images/jets/jet_midnight.png
src/assets/images/jets/jet_solar.png
src/assets/images/jets/jet_nebula.png
src/assets/images/jets/jet_thunder.png
```
*(A aeronave "classic" usa o jet existente: `v1_default_gameplay_jet.png`)*

**Catálogo de Aeronaves:**
| ID | Nome | Preço | Classe |
|---|---|---|---|
| classic | Turbo Hawk X7 | 0 (grátis) | Balanceada |
| phantom | Phantom Strike | 500 | Velocidade |
| viper | Viper Edge | 1.000 | Ágil |
| storm | Storm Eagle | 2.500 | Pesada |
| midnight | Midnight Fury | 5.000 | Furtiva |
| solar | Solar Falcon | 8.000 | Resistência |
| nebula | Nebula X | 12.000 | Exótica |
| thunder | Thunder King | 20.000 | Lenda |

---

### 1.2 Placar Online (Supabase)
**Status:** ✅ Implementado

Usa Supabase como backend para placar global e por país.

**Supabase — SQL para executar no SQL Editor:**
```sql
-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  username_key TEXT UNIQUE NOT NULL,
  country_code CHAR(2),
  country_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global scores
CREATE TABLE IF NOT EXISTS global_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  difficulty_id TEXT NOT NULL DEFAULT 'normal',
  coins_collected INTEGER DEFAULT 0,
  flight_level INTEGER DEFAULT 1,
  duration_seconds NUMERIC DEFAULT 0,
  country_code CHAR(2),
  country_name TEXT,
  played_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_global_scores_score ON global_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_global_scores_country ON global_scores(country_code);
CREATE INDEX IF NOT EXISTS idx_global_scores_played ON global_scores(played_at DESC);

-- Daily challenge scores
CREATE TABLE IF NOT EXISTS daily_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  challenge_date DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  coins_collected INTEGER DEFAULT 0,
  country_code CHAR(2),
  played_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_daily_scores_date_score ON daily_scores(challenge_date, score DESC);

-- RLS (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_players" ON players FOR SELECT USING (true);
CREATE POLICY "public_insert_players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_global_scores" ON global_scores FOR SELECT USING (true);
CREATE POLICY "public_insert_global_scores" ON global_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_daily_scores" ON daily_scores FOR SELECT USING (true);
CREATE POLICY "public_insert_daily_scores" ON daily_scores FOR INSERT WITH CHECK (true);
```

**Funcionalidades:**
- Modo Offline (dados locais apenas) e Modo Online (Supabase)
- Verificação se jogador já existe ao criar novo jogo online
- Detecção automática de país via ipapi.co
- Placar global top-20 por pontuação
- Filtro por país no placar

---

### 1.3 Leaderboard com Abas (Local / Global / Diário)
**Status:** ✅ Implementado

A tela de leaderboard ganha 3 abas:
- **Local** — dados do localStorage (comportamento atual)
- **Global** — top 20 do Supabase (requer modo online)
- **Diário** — top 20 do dia do Desafio Diário

---

### 1.4 Score Card Compartilhável
**Status:** ✅ Implementado

Gera imagem PNG do resultado via Canvas e permite compartilhar:
- Web Share API (mobile) com arquivo de imagem
- Fallback: download da imagem (desktop)
- Botão "Compartilhar Resultado" na tela de Game Over

---

### 1.5 Desafio Diário (Daily Challenge)
**Status:** ✅ Implementado

Modo especial com seed fixa por data:
- Todos os jogadores do mundo veem exatamente os mesmos obstáculos
- Placar diário separado do placar global
- Só conta a melhor pontuação do dia por jogador
- Indicador visual no HUD durante o Desafio Diário
- Botão na Home Screen

---

## Grupo 2 — Variedade e Profundidade (Futuro)

- [ ] **2.1** Missão Semanal (Weekly Challenge) — missão especial que muda toda semana
- [ ] **2.2** Sistema de Combo / Close Call — bônus ao passar bem perto dos obstáculos
- [ ] **2.3** Novos Temas / Cenários — Noite Urbana, Espaço, Floresta (assets por IA)
- [ ] **2.4** Tutorial de Primeiro Acesso — overlay interativo na primeira jogada
- [ ] **2.5** Eventos Sazonais — Natal, Halloween, etc.

---

## Notas Técnicas

- Arquitetura: vanilla JS, IIFE modules — sem frameworks
- Backend: Supabase (REST API via fetch, sem SDK)
- Armazenamento local: localStorage via `TurboWingsStorage`
- Seeded RNG para Daily Challenge: algoritmo Mulberry32
- Score Card: Canvas 2D → `toDataURL` → Web Share API
