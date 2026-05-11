# GEMINI.md — Système d'archivage numérique · Entreprise d'électricité

> Gemini CLI lit ce fichier automatiquement à chaque session (équivalent de CLAUDE.md).

---

## PROJET

Application fullstack d'archivage numérique pour une entreprise d'électricité (Cameroun).
- 8 agents maximum · Hébergement on-premise Ubuntu 24.04 LTS · Interface en français
- Stack : NestJS · React 18 · React Native/Expo · PostgreSQL · Redis · MinIO · Docker

## DOCUMENTS DE RÉFÉRENCE

```
@docs/guide-technique.md       ← Architecture complète, phases, conventions
@docs/cahier-des-charges.md    ← Exigences fonctionnelles et règles métier
```

---

## SKILLS DISPONIBLES

Les skills sont dans `skills/`. **Lire le skill orchestrateur EN PREMIER.**

Avec Gemini CLI, charge les skills avec la syntaxe `@chemin/SKILL.md` :

| Commande                            | Rôle                                    |
|-------------------------------------|-----------------------------------------|
| `@skills/00-orchestrateur/SKILL.md` | 🎯 Chef de projet — À LIRE EN PREMIER   |
| `@skills/01-backend-nestjs/SKILL.md`| ⚙️  Backend NestJS · API REST · TypeORM |
| `@skills/02-frontend-react/SKILL.md`| 🖥️  Frontend React 18 · TailwindCSS     |
| `@skills/03-mobile-expo/SKILL.md`   | 📱 Mobile React Native · Expo           |
| `@skills/04-database/SKILL.md`      | 🗄️  PostgreSQL · Migrations · Index     |
| `@skills/05-infrastructure/SKILL.md`| 🚀 Docker · Nginx · Sauvegardes         |
| `@skills/06-securite/SKILL.md`      | 🔒 Auth JWT · RBAC · OWASP              |
| `@skills/07-tests/SKILL.md`         | 🧪 Tests E2E · NestJS · SuperTest       |

### Ordre de lecture par type de tâche

**Infrastructure / Docker :**
```
@skills/00-orchestrateur/SKILL.md @skills/05-infrastructure/SKILL.md @skills/04-database/SKILL.md
```

**Backend :**
```
@skills/00-orchestrateur/SKILL.md @skills/01-backend-nestjs/SKILL.md @skills/06-securite/SKILL.md @skills/07-tests/SKILL.md
```

**Frontend web :**
```
@skills/00-orchestrateur/SKILL.md @skills/02-frontend-react/SKILL.md
```

**Mobile :**
```
@skills/00-orchestrateur/SKILL.md @skills/03-mobile-expo/SKILL.md
```

**Tests :**
```
@skills/00-orchestrateur/SKILL.md @skills/07-tests/SKILL.md
```

---

## COMMANDE DE DÉMARRAGE DE SESSION

```
@skills/00-orchestrateur/SKILL.md @skills/01-backend-nestjs/SKILL.md
Nous travaillons sur la Phase [N], Semaine [N].
La tâche est : [description de la tâche].
```

---

## RÈGLES ABSOLUES

```
❌ JAMAIS supprimer une donnée — archiver uniquement
❌ JAMAIS mettre un secret en dur dans le code
❌ JAMAIS retourner le mot de passe dans une réponse API
✅ TOUJOURS valider côté serveur même si validé côté client
✅ TOUJOURS utiliser des transactions pour les opérations multi-tables
✅ TOUJOURS écrire les commentaires et messages d'erreur en français
```
