# Guide d'installation des Skills
## Projet : Archivage numérique — Entreprise d'électricité

---

## Structure à copier dans ton projet

```
archivage-elec/                    ← racine de ton projet
├── CLAUDE.md                      ← lu automatiquement par Claude Code
├── .gemini/
│   └── GEMINI.md                  ← lu automatiquement par Gemini CLI
├── docs/
│   ├── guide-technique.md
│   └── cahier-des-charges.md
└── skills/
    ├── 00-orchestrateur/SKILL.md
    ├── 01-backend-nestjs/SKILL.md
    ├── 02-frontend-react/SKILL.md
    ├── 03-mobile-expo/SKILL.md
    ├── 04-database/SKILL.md
    ├── 05-infrastructure/SKILL.md
    ├── 06-securite/SKILL.md
    └── 07-tests/SKILL.md
```

---

## Installation — Claude Code

### Étape 1 : Copier les fichiers

Depuis l'archive que tu as téléchargée, copie tout le contenu
dans la racine de ton projet `archivage-elec/`.

```bash
# Si tu pars de zéro :
mkdir archivage-elec
cd archivage-elec

# Copier les fichiers skills + docs + CLAUDE.md
# (structure fournie dans l'archive)
```

### Étape 2 : Vérifier que CLAUDE.md est à la racine

```bash
ls archivage-elec/CLAUDE.md   # doit exister
```

Claude Code lit automatiquement `CLAUDE.md` à chaque session
dès que tu l'ouvres dans ce dossier.

### Étape 3 : Ouvrir le projet

```bash
cd archivage-elec
claude   # lance Claude Code dans ce dossier
```

Claude Code détecte et lit `CLAUDE.md` immédiatement.

### Étape 4 : Démarrer une session de travail

Dans Claude Code, tape :

```
Lis CLAUDE.md puis les skills nécessaires.
Nous travaillons sur la Phase 1, Semaine 1.
La tâche est : créer la structure Docker de base.
```

---

## Installation — Gemini CLI

### Étape 1 : Même structure de fichiers

Gemini CLI utilise les mêmes fichiers skills.
Le fichier `.gemini/GEMINI.md` est son équivalent de `CLAUDE.md`.

### Étape 2 : Ouvrir le projet

```bash
cd archivage-elec
gemini   # lance Gemini CLI dans ce dossier
```

Gemini CLI lit automatiquement `.gemini/GEMINI.md` au démarrage.

### Étape 3 : Charger les skills manuellement

Avec Gemini CLI, tu charges les skills avec la syntaxe `@fichier` :

```
# Exemple — tâche backend :
@skills/00-orchestrateur/SKILL.md @skills/01-backend-nestjs/SKILL.md @skills/06-securite/SKILL.md
Nous travaillons sur la Phase 1, Semaine 2.
La tâche est : créer le module auth (JWT + sessions).
```

```
# Exemple — tâche infrastructure :
@skills/00-orchestrateur/SKILL.md @skills/05-infrastructure/SKILL.md @skills/04-database/SKILL.md
La tâche est : créer le docker-compose.yml complet.
```

---

## Commandes de démarrage prêtes à l'emploi

### Phase 1 — Infrastructure + Auth (Semaines 1–4)

**Claude Code :**
```
Lis CLAUDE.md et les skills infrastructure + database.
Phase 1, Semaine 1 : créer la structure complète du projet
et le docker-compose.yml de production.
```

**Gemini CLI :**
```
@skills/00-orchestrateur/SKILL.md @skills/05-infrastructure/SKILL.md @skills/04-database/SKILL.md
Phase 1, Semaine 1 : créer la structure complète du projet
et le docker-compose.yml de production.
```

### Phase 1 — Module Auth (Semaine 2)

**Claude Code :**
```
Lis les skills backend + sécurité.
Phase 1, Semaine 2 : créer le module auth NestJS
(login, JWT, sessions révocables, blocage après 5 tentatives).
```

**Gemini CLI :**
```
@skills/00-orchestrateur/SKILL.md @skills/01-backend-nestjs/SKILL.md @skills/06-securite/SKILL.md
Phase 1, Semaine 2 : créer le module auth NestJS.
```

---

## Vérification que ça fonctionne

Après avoir tapé ta commande de démarrage, Claude/Gemini doit :

1. ✅ Annoncer qu'il a lu les skills
2. ✅ Résumer le contexte projet (électricité, Cameroun, 8 agents)
3. ✅ Lister les fichiers qu'il va créer
4. ✅ Respecter le format de réponse de l'orchestrateur :
   ```
   ## 📋 Ce que je vais faire
   ## 📁 Fichiers créés / modifiés
   ## ✅ Vérification
   ## ⚠️ Point d'attention
   ```

Si ces 4 points sont présents, les skills sont correctement chargés.
