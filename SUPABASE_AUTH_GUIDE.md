# 🔐 HabitDB 2026 — Guia de Autenticação com Supabase

> Adiciona login/signup/logout + dados por usuário + migração do localStorage, sem reescrever o app.

---

## PARTE 1 — Configuração no Supabase (faça isso primeiro)

### 1.1 · Criar projeto
1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Dê um nome (ex: `habitdb-2026`), escolha uma senha forte para o DB e a região mais próxima (South America - São Paulo)
3. Aguarde ~2 min o projeto subir

### 1.2 · Habilitar Auth por Email/Senha
1. No menu lateral: **Authentication → Providers**
2. **Email** já vem habilitado por padrão ✅
3. Opcional: desative "Confirm email" em **Authentication → Email Templates → Settings** se não quiser email de confirmação agora (mais fácil para testar)

### 1.3 · Criar a tabela `user_data`
No menu lateral: **SQL Editor → New query** → cole e execute:

```sql
-- Tabela que guarda o JSON inteiro do app por usuário
CREATE TABLE IF NOT EXISTS user_data (
    user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data       JSONB       NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security: cada usuário acessa APENAS seus dados
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_vê_próprio_dado"
    ON user_data FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Índice para a query de upsert
CREATE INDEX IF NOT EXISTS idx_user_data_updated ON user_data(updated_at);
```

### 1.4 · Pegar as credenciais
1. **Settings → API** (menu lateral)
2. Copie:
   - **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** → `eyJhbGc...` (a chave longa)

> ⚠️ A `anon key` é pública — pode ir no frontend. **Nunca use a `service_role key` no frontend.**

---

## PARTE 2 — Alterações no `index.html`

Há **4 pontos** onde você altera o arquivo existente + **1 bloco grande** que você cola no final.

---

### PONTO 1 · Adicionar CDN do Supabase no `<head>`

**Onde:** logo após a linha do Chart.js (linha ~8)

**Antes:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**Depois:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

### PONTO 2 · Adicionar CSS do modal de login

**Onde:** dentro do `<style>`, no final (antes do fechamento `</style>`)

**Cole este bloco inteiro:**
```css
/* ── AUTH MODAL ─────────────────────────────────────────── */
#auth-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 10px 20px;
    background: rgba(15,23,42,0.8);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 20px;
    font-size: 0.9rem;
    flex-wrap: wrap;
}
#auth-bar .auth-user-info { color: #94a3b8; }
#auth-bar .auth-user-info strong { color: #e2e8f0; }
#auth-bar button {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: opacity 0.2s;
}
#auth-bar button:hover { opacity: 0.85; }
#auth-bar button.btn-outline {
    background: transparent;
    border: 1px solid rgba(99,102,241,0.5);
    color: #a5b4fc;
}
#auth-bar button.btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}
#auth-bar .sync-status { font-size: 0.8rem; color: #64748b; }
#auth-bar .sync-status.ok { color: #10b981; }
#auth-bar .sync-status.err { color: #ef4444; }

#auth-modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(2,6,23,0.85);
    backdrop-filter: blur(6px);
    z-index: 9999;
    align-items: center;
    justify-content: center;
}
#auth-modal-overlay.open { display: flex; }

#auth-modal {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 25px 50px rgba(0,0,0,0.6);
}
#auth-modal h2 { font-size: 1.6rem; color: #e2e8f0; margin-bottom: 6px; }
#auth-modal .auth-subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 28px; }
#auth-modal label { display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 6px; font-weight: 600; }
#auth-modal input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 12px 14px;
    color: #f1f5f9;
    font-size: 0.95rem;
    margin-bottom: 18px;
    outline: none;
    transition: border-color 0.2s;
}
#auth-modal input:focus { border-color: #6366f1; }
#auth-modal .auth-btn-primary {
    width: 100%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    border: none;
    padding: 13px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 12px;
    transition: opacity 0.2s;
}
#auth-modal .auth-btn-primary:hover { opacity: 0.9; }
#auth-modal .auth-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
#auth-modal .auth-toggle {
    text-align: center;
    color: #64748b;
    font-size: 0.88rem;
}
#auth-modal .auth-toggle a { color: #818cf8; cursor: pointer; text-decoration: underline; }
#auth-modal .auth-error {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.85rem;
    margin-bottom: 16px;
    display: none;
}
#auth-modal .auth-close {
    position: absolute;
    top: 16px; right: 20px;
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.4rem;
    cursor: pointer;
    line-height: 1;
}
#auth-modal { position: relative; }

#migrate-banner {
    display: none;
    background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05));
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    color: #fde68a;
    display: none;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}
#migrate-banner.show { display: flex; }
#migrate-banner strong { color: #fbbf24; }
#migrate-banner button {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
}
#migrate-banner .dismiss { background: transparent; border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; }
```

---

### PONTO 3 · Adicionar HTML do modal e barra de auth

**Onde:** dentro do `<body>`, logo **antes** da `<div class="container">` (primeira tag depois de `<body>`)

**Cole:**
```html
<!-- ── AUTH BAR ── -->
<div id="auth-bar">
    <span class="auth-user-info" id="auth-user-label" style="display:none">
        ☁️ Logado como <strong id="auth-user-email"></strong>
    </span>
    <span class="sync-status" id="sync-status"></span>
    <button class="btn-outline" id="btn-open-login" onclick="authModal.open('login')">🔑 Entrar / Criar conta</button>
    <button class="btn-danger" id="btn-logout" style="display:none" onclick="authHandlers.logout()">Sair</button>
</div>

<!-- ── MIGRAÇÃO ── -->
<div id="migrate-banner">
    <span>📦 <strong>Dados locais detectados!</strong> Sua conta está vazia. Deseja subir seus dados para a nuvem?</span>
    <button onclick="authHandlers.migrate()">⬆️ Subir meus dados</button>
    <button class="dismiss" onclick="document.getElementById('migrate-banner').classList.remove('show')">Agora não</button>
</div>

<!-- ── AUTH MODAL ── -->
<div id="auth-modal-overlay">
    <div id="auth-modal">
        <button class="auth-close" onclick="authModal.close()">×</button>
        <h2 id="auth-modal-title">Entrar</h2>
        <p class="auth-subtitle" id="auth-modal-subtitle">Seus hábitos sincronizados em qualquer dispositivo.</p>
        <div class="auth-error" id="auth-error"></div>
        <label for="auth-email">Email</label>
        <input type="email" id="auth-email" placeholder="voce@email.com" autocomplete="email">
        <label for="auth-password">Senha</label>
        <input type="password" id="auth-password" placeholder="••••••••" autocomplete="current-password">
        <div id="auth-name-field" style="display:none">
            <label for="auth-name">Nome / Apelido (opcional)</label>
            <input type="text" id="auth-name" placeholder="Como quer ser chamado">
        </div>
        <button class="auth-btn-primary" id="auth-submit-btn" onclick="authHandlers.submit()">Entrar</button>
        <div class="auth-toggle">
            <span id="auth-toggle-text">Não tem conta?</span>
            <a onclick="authModal.toggleMode()"> <span id="auth-toggle-link">Criar conta</span></a>
        </div>
    </div>
</div>
```

---

### PONTO 4 · Modificar `loadData()` e `saveData()`

**Onde:** linha ~536 e ~568 do arquivo original

**Antes (loadData):**
```javascript
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
```

**Depois (loadData) — substitua a função INTEIRA:**
```javascript
function loadData() {
    // Auth: se logado e temos dados remotos, eles já foram mesclados em initAuth
    // Esta função carrega apenas o localStorage (fallback / estado atual em memória)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
```
> ⚠️ Apenas adicione o comentário no topo — o corpo da função fica igual.

**Antes (saveData):**
```javascript
function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }
    catch(e) { console.error('Erro ao salvar:', e); }
}
```

**Depois (saveData) — substitua por:**
```javascript
function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); }
    catch(e) { console.error('Erro ao salvar:', e); }
    // Salvar na nuvem se logado (debounced)
    if (typeof saveRemoteDebounced === 'function') saveRemoteDebounced();
}
```

---

### PONTO 5 · Cole o bloco de Auth JS no final do arquivo

**Onde:** logo antes de `</script>` (última linha de JS, antes do fechamento `</script></body></html>`)

**Cole este bloco inteiro:**

```javascript
// ═══════════════════════════════════════════════════════════
// HABITDB AUTH — Supabase Integration
// ═══════════════════════════════════════════════════════════

// ── CONFIGURAÇÃO ─── Substitua com seus valores do Supabase
const SUPABASE_URL     = 'https://SEU_PROJETO.supabase.co';   // ← cole sua URL aqui
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ← cole sua anon key aqui

// ── CLIENTE ─────────────────────────────────────────────────
let supabase = null;
let currentUser = null;

function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.warn('[Auth] SDK do Supabase não carregou. Modo offline ativo.');
        return false;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
}

// ── REMOTE DATA ─────────────────────────────────────────────
async function getRemoteData(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        console.error('[Auth] Erro ao buscar dados:', error.message);
        return null;
    }
    return data || null;
}

async function saveRemoteData() {
    if (!supabase || !currentUser) return;
    setSyncStatus('saving');
    const { error } = await supabase
        .from('user_data')
        .upsert(
            { user_id: currentUser.id, data: appData, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
        );
    if (error) {
        console.error('[Auth] Erro ao salvar:', error.message);
        setSyncStatus('error');
    } else {
        setSyncStatus('ok');
    }
}

// Debounce para não spammar a API a cada clique
let saveRemoteTimer = null;
function saveRemoteDebounced() {
    clearTimeout(saveRemoteTimer);
    saveRemoteTimer = setTimeout(saveRemoteData, 800);
}

// ── MIGRAÇÃO LOCAL → REMOTO ──────────────────────────────────
async function migrateLocalToRemote() {
    const localRaw = localStorage.getItem(STORAGE_KEY);
    if (!localRaw || !currentUser) return;
    setSyncStatus('saving');
    const localData = JSON.parse(localRaw);
    const { error } = await supabase
        .from('user_data')
        .upsert(
            { user_id: currentUser.id, data: localData, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
        );
    if (error) {
        alert('❌ Erro na migração: ' + error.message);
        setSyncStatus('error');
    } else {
        document.getElementById('migrate-banner').classList.remove('show');
        setSyncStatus('ok');
        showToast('✅ Dados migrados para a nuvem com sucesso!');
    }
}

// ── RESOLUÇÃO DE CONFLITO (timestamp wins) ───────────────────
async function resolveAndLoadData(userId) {
    const remote = await getRemoteData(userId);

    // Sem dado remoto → usar local e subir
    if (!remote || !remote.data || Object.keys(remote.data).length === 0) {
        const localRaw = localStorage.getItem(STORAGE_KEY);
        if (localRaw) {
            // Mostrar banner de migração
            document.getElementById('migrate-banner').classList.add('show');
        }
        return; // Mantém appData já carregado do localStorage
    }

    const remoteTs = new Date(remote.updated_at).getTime();
    const localRaw = localStorage.getItem(STORAGE_KEY);
    const localTs  = localRaw
        ? (JSON.parse(localRaw).__updatedAt ? new Date(JSON.parse(localRaw).__updatedAt).getTime() : 0)
        : 0;

    if (remoteTs >= localTs) {
        // Remoto é mais novo → usar remoto
        Object.assign(appData, remote.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        updateMonthlyTotals();
        renderAll();
        setSyncStatus('ok');
    } else {
        // Local é mais novo → subir local para o remoto
        await saveRemoteData();
    }
}

// Adiciona __updatedAt ao appData para resolução de conflitos
const _origSaveData = saveData;
// (já modificamos saveData acima para chamar saveRemoteDebounced)

// ── UI HELPERS ────────────────────────────────────────────────
function setSyncStatus(state) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    if (state === 'saving') { el.textContent = '🔄 Salvando...'; el.className = 'sync-status'; }
    else if (state === 'ok') { el.textContent = '✅ Salvo'; el.className = 'sync-status ok'; setTimeout(()=>{ el.textContent=''; }, 3000); }
    else if (state === 'error') { el.textContent = '⚠️ Erro ao salvar'; el.className = 'sync-status err'; }
}

function showToast(msg) {
    let t = document.getElementById('sb-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'sb-toast';
        t.style.cssText = 'position:fixed;bottom:28px;right:24px;background:#1e293b;border:1px solid rgba(99,102,241,0.4);color:#e2e8f0;padding:14px 20px;border-radius:12px;font-size:0.9rem;z-index:99999;box-shadow:0 8px 30px rgba(0,0,0,0.4);transition:opacity 0.4s;';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function updateAuthBar(user) {
    const loginBtn  = document.getElementById('btn-open-login');
    const logoutBtn = document.getElementById('btn-logout');
    const userLabel = document.getElementById('auth-user-label');
    const userEmail = document.getElementById('auth-user-email');

    if (user) {
        loginBtn.style.display  = 'none';
        logoutBtn.style.display = 'inline-block';
        userLabel.style.display = 'inline';
        userEmail.textContent   = user.email;
    } else {
        loginBtn.style.display  = 'inline-block';
        logoutBtn.style.display = 'none';
        userLabel.style.display = 'none';
    }
}

// ── MODAL CONTROLLER ─────────────────────────────────────────
let authMode = 'login'; // 'login' | 'signup'

const authModal = {
    open(mode = 'login') {
        authMode = mode;
        document.getElementById('auth-modal-overlay').classList.add('open');
        authModal._render();
        setTimeout(() => document.getElementById('auth-email').focus(), 100);
    },
    close() {
        document.getElementById('auth-modal-overlay').classList.remove('open');
        authModal._clearError();
    },
    toggleMode() {
        authMode = authMode === 'login' ? 'signup' : 'login';
        authModal._render();
    },
    _render() {
        const isSignup = authMode === 'signup';
        document.getElementById('auth-modal-title').textContent    = isSignup ? 'Criar conta' : 'Entrar';
        document.getElementById('auth-modal-subtitle').textContent = isSignup
            ? 'Seus dados ficam seguros e sincronizados.'
            : 'Seus hábitos sincronizados em qualquer dispositivo.';
        document.getElementById('auth-submit-btn').textContent     = isSignup ? 'Criar conta' : 'Entrar';
        document.getElementById('auth-toggle-text').textContent    = isSignup ? 'Já tem conta?' : 'Não tem conta?';
        document.getElementById('auth-toggle-link').textContent    = isSignup ? 'Entrar' : 'Criar conta';
        document.getElementById('auth-name-field').style.display   = isSignup ? 'block' : 'none';
        authModal._clearError();
    },
    _clearError() {
        const el = document.getElementById('auth-error');
        el.style.display = 'none';
        el.textContent = '';
    },
    _showError(msg) {
        const el = document.getElementById('auth-error');
        el.textContent = msg;
        el.style.display = 'block';
    }
};

// ── AUTH HANDLERS ────────────────────────────────────────────
const authHandlers = {
    async submit() {
        if (!supabase) { authModal._showError('SDK não carregou. Recarregue a página.'); return; }
        const email    = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const btn      = document.getElementById('auth-submit-btn');

        if (!email || !password) { authModal._showError('Preencha email e senha.'); return; }
        if (password.length < 6) { authModal._showError('Senha mínima: 6 caracteres.'); return; }

        btn.disabled = true;
        btn.textContent = 'Aguarde...';
        authModal._clearError();

        try {
            let result;
            if (authMode === 'login') {
                result = await supabase.auth.signInWithPassword({ email, password });
            } else {
                const name = document.getElementById('auth-name').value.trim();
                result = await supabase.auth.signUp({
                    email, password,
                    options: { data: { name: name || email.split('@')[0] } }
                });
            }

            if (result.error) {
                authModal._showError(translateAuthError(result.error.message));
            } else {
                authModal.close();
                // onAuthStateChange vai disparar e cuidar do resto
            }
        } finally {
            btn.disabled = false;
            btn.textContent = authMode === 'login' ? 'Entrar' : 'Criar conta';
        }
    },

    async logout() {
        if (!supabase) return;
        await supabase.auth.signOut();
        currentUser = null;
        updateAuthBar(null);
        document.getElementById('migrate-banner').classList.remove('show');
        showToast('👋 Você saiu. Dados locais preservados.');
    },

    async migrate() {
        await migrateLocalToRemote();
    }
};

// ── TRADUZIR ERROS COMUNS ─────────────────────────────────────
function translateAuthError(msg) {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
    if (msg.includes('Email not confirmed'))        return 'Confirme seu email antes de entrar.';
    if (msg.includes('User already registered'))    return 'Email já cadastrado. Tente entrar.';
    if (msg.includes('Password should be'))         return 'Senha deve ter ao menos 6 caracteres.';
    return msg;
}

// ── INIT AUTH ────────────────────────────────────────────────
async function initAuth() {
    const sdkOk = initSupabase();
    if (!sdkOk) return; // Modo offline: app funciona normalmente só com localStorage

    // Fechar modal com Esc
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') authModal.close();
    });

    // Ouvir mudanças de sessão
    supabase.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user ?? null;
        updateAuthBar(currentUser);

        if (currentUser) {
            authModal.close();
            await resolveAndLoadData(currentUser.id);
        }
    });

    // Verificar sessão existente ao abrir o app
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        updateAuthBar(currentUser);
        await resolveAndLoadData(currentUser.id);
    }
}
```

---

### PONTO 6 · Chamar `initAuth()` em `initApp()`

**Antes:**
```javascript
function initApp() {
    loadData();
    updateMonthlyTotals();
```

**Depois:**
```javascript
function initApp() {
    loadData();
    updateMonthlyTotals();
    initAuth(); // ← adicione esta linha
```

---

## PARTE 3 — Checklist de Deploy no GitHub Pages

```
✅ Substitua SUPABASE_URL e SUPABASE_ANON_KEY pelos seus valores reais
✅ No Supabase → Authentication → URL Configuration:
     Site URL: https://SEU_USUARIO.github.io/habitdb-2026
     Redirect URLs: https://SEU_USUARIO.github.io/habitdb-2026/**
✅ Commit e push → GitHub Pages publica automaticamente
✅ Teste: abra o app, clique "Entrar / Criar conta", crie uma conta, registre um hábito, abra em outra aba/dispositivo
```

---

## PARTE 4 — Quando quiser migrar para escala (SaaS)

O esquema já está preparado. Você só precisará:

1. **Trocar o host** do GitHub Pages para Vercel/Netlify (grátis e mais rápido)
2. **Adicionar planos** via Stripe — criar coluna `plan` na tabela `user_data` ou tabela separada `subscriptions`
3. **Ativar confirmação de email** no Supabase Auth (já está lá, só habilitar)
4. **Separar o schema granular** — se quiser analytics por hábito, migrar de JSONB para a estrutura `registros_diarios` que você já tem no `schema.sql`

O Supabase Free comporta até 50.000 usuários ativos/mês — mais do que suficiente para o lançamento.

---

## Resumo dos pontos de alteração

| # | O que | Onde no arquivo |
|---|-------|-----------------|
| 1 | CDN do Supabase | `<head>`, após Chart.js |
| 2 | CSS do modal | Dentro de `<style>`, antes de `</style>` |
| 3 | HTML do modal + auth bar | `<body>`, antes de `<div class="container">` |
| 4a | `saveData()` | Linha ~568 — adicionar chamada ao debounce |
| 5 | Bloco JS Auth | Antes de `</script>` final |
| 6 | `initApp()` | Adicionar `initAuth()` após `loadData()` |

**Tempo estimado de implementação: ~20 minutos.**

---

*HabitDB 2026 — dados seguros na nuvem, app funcionando offline.*
