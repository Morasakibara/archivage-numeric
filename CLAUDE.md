# CLAUDE.md — Système d'archivage numérique · Entreprise d'électricité

> Claude Code lit ce fichier automatiquement à chaque session.
> Il définit les skills disponibles et le comportement attendu.

---

## PROJET

Application fullstack d'archivage numérique pour une entreprise d'électricité (Cameroun).
- 8 agents maximum · Hébergement on-premise Ubuntu 24.04 LTS · Interface en français
- Stack : NestJS · React 18 · React Native/Expo · PostgreSQL · Redis · MinIO · Docker

## DOCUMENTS DE RÉFÉRENCE

Lire ces fichiers en début de session si besoin de contexte projet :
- `docs/guide-technique.md` — Architecture complète, phases, conventions de code
- `docs/cahier-des-charges.md` — Exigences fonctionnelles et règles métier

---

## SKILLS DISPONIBLES

Les skills sont dans `skills/`. **Lire le skill orchestrateur EN PREMIER**, puis les skills
concernés par la tâche en cours.

| Dossier                    | Rôle                                      |
|----------------------------|-------------------------------------------|
| `skills/00-orchestrateur/` | 🎯 Chef de projet — À LIRE EN PREMIER     |
| `skills/01-backend-nestjs/`| ⚙️  Backend NestJS · API REST · TypeORM   |
| `skills/02-frontend-react/`| 🖥️  Frontend React 18 · TailwindCSS       |
| `skills/03-mobile-expo/`   | 📱 Mobile React Native · Expo · Caméra   |
| `skills/04-database/`      | 🗄️  PostgreSQL · Migrations · Index       |
| `skills/05-infrastructure/`| 🚀 Docker · Nginx · Sauvegardes           |
| `skills/06-securite/`      | 🔒 Auth JWT · RBAC · OWASP                |
| `skills/07-tests/`         | 🧪 Tests E2E · NestJS · SuperTest         |

### Ordre de lecture par type de tâche

**Infrastructure / Docker :**
```
00-orchestrateur → 05-infrastructure → 04-database
```

**Backend :**
```
00-orchestrateur → 01-backend-nestjs → 06-securite → 07-tests
```

**Frontend web :**
```
00-orchestrateur → 02-frontend-react
```

**Mobile :**
```
00-orchestrateur → 03-mobile-expo
```

**Tests :**
```
00-orchestrateur → 07-tests → [skill du module testé]
```

---

## COMMANDE DE DÉMARRAGE DE SESSION

Utilise cette commande pour démarrer chaque session de travail :

```
Lis CLAUDE.md, puis skills/00-orchestrateur/SKILL.md, puis les skills nécessaires.
Nous travaillons sur la Phase [N], Semaine [N].
La tâche est : [description de la tâche].
```

---

## RÈGLES ABSOLUES (résumé — détail dans chaque skill)

```
❌ JAMAIS supprimer une donnée — archiver uniquement
❌ JAMAIS mettre un secret en dur dans le code
❌ JAMAIS retourner le mot de passe dans une réponse API
❌ JAMAIS ignorer une erreur TypeScript avec `any`
✅ TOUJOURS valider côté serveur même si validé côté client
✅ TOUJOURS utiliser des transactions pour les opérations multi-tables
✅ TOUJOURS écrire les commentaires et messages d'erreur en français
✅ TOUJOURS vérifier les permissions au niveau du service, pas seulement du guard
```
