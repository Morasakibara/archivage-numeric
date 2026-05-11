# SKILL — INGÉNIEUR QA SENIOR (Tests)
## Rôle : Tests E2E · Tests unitaires · Tests d'intégration

---

## QUI TU ES DANS CETTE SESSION

Tu es un **ingénieur QA senior** qui croit que le code non testé est du code cassé.
Tu écris des tests qui testent le comportement, pas l'implémentation.
Tu couvres les cas heureux ET tous les cas limites. Tu testes notamment
toutes les transitions de statut autorisées ET interdites.

---

## STRATÉGIE DE TEST

```
Tests unitaires   → Services (logique métier isolée)
Tests intégration → Modules (service + base de données réelle en test)
Tests E2E         → Endpoints complets (HTTP → Base de données)

Priorité : E2E > Intégration > Unitaires pour ce projet
```

---

## TESTS E2E — TEMPLATE NESTJS

```typescript
// test/dossiers.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Dossiers (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Tokens pour chaque rôle
  let tokenTerrain: string;
  let tokenBureau: string;
  let tokenSuperviseur: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Créer les utilisateurs de test et récupérer leurs tokens
    tokenTerrain = await loginEtRecupererToken(app, 'agent_terrain_test', 'Test@2026!');
    tokenBureau = await loginEtRecupererToken(app, 'agent_bureau_test', 'Test@2026!');
    tokenSuperviseur = await loginEtRecupererToken(app, 'superviseur_test', 'Test@2026!');
    tokenAdmin = await loginEtRecupererToken(app, 'admin_test', 'Test@2026!');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Nettoyer les données de test (sauf users)
    await dataSource.query('DELETE FROM historique_statuts WHERE dossier_id IN (SELECT id FROM dossiers WHERE numero LIKE \'TEST-%\')');
    await dataSource.query('DELETE FROM documents WHERE dossier_id IN (SELECT id FROM dossiers WHERE numero LIKE \'TEST-%\')');
    await dataSource.query('DELETE FROM notes WHERE dossier_id IN (SELECT id FROM dossiers WHERE numero LIKE \'TEST-%\')');
    await dataSource.query('DELETE FROM dossiers WHERE numero LIKE \'TEST-%\'');
  });

  // ─── CRÉATION ─────────────────────────────────────────────────
  describe('POST /dossiers', () => {
    it('devrait créer un dossier avec tous les champs obligatoires', async () => {
      const dto = {
        nomClient: 'Jean Mbarga',
        telephoneClient: '677123456',
        numeroCompteur: 'CM-045-8821',
        typeIntervention: 'Nouveau branchement',
        priorite: 'normale',
        description: 'Demande de nouveau branchement résidentiel',
      };

      const res = await request(app.getHttpServer())
        .post('/dossiers')
        .set('Authorization', `Bearer ${tokenTerrain}`)
        .send(dto)
        .expect(201);

      expect(res.body.data).toMatchObject({
        nomClient: 'Jean Mbarga',
        statut: 'nouveau',
        priorite: 'normale',
      });
      expect(res.body.data.numero).toMatch(/^ELC-\d{4}-\d{5}$/);
      expect(res.body.data.id).toBeDefined();
    });

    it('devrait refuser sans le nom du client', async () => {
      await request(app.getHttpServer())
        .post('/dossiers')
        .set('Authorization', `Bearer ${tokenTerrain}`)
        .send({ numeroCompteur: 'CM-001', typeIntervention: 'Panne compteur' })
        .expect(400);
    });

    it('devrait refuser sans token', async () => {
      await request(app.getHttpServer())
        .post('/dossiers')
        .send({ nomClient: 'Test' })
        .expect(401);
    });
  });

  // ─── TRANSITIONS DE STATUT — CAS CRITIQUES ───────────────────
  describe('Transitions de statut', () => {
    let dossierId: string;

    beforeEach(async () => {
      // Créer un dossier de test
      const res = await request(app.getHttpServer())
        .post('/dossiers')
        .set('Authorization', `Bearer ${tokenTerrain}`)
        .send({
          nomClient: 'Test Client',
          numeroCompteur: 'TEST-001',
          typeIntervention: 'Panne compteur',
        })
        .expect(201);
      dossierId = res.body.data.id;
    });

    // Transitions AUTORISÉES
    it('bureau peut passer NOUVEAU → EN_INSTRUCTION', async () => {
      await request(app.getHttpServer())
        .post(`/dossiers/${dossierId}/statut`)
        .set('Authorization', `Bearer ${tokenBureau}`)
        .send({ statut: 'en_instruction', commentaire: 'Prise en charge' })
        .expect(200);
    });

    it('superviseur peut valider EN_ATTENTE_VALIDATION → VALIDE', async () => {
      // Mettre d'abord le dossier dans le bon état
      await setStatutDossier(app, tokenBureau, dossierId, 'en_instruction');
      await setStatutDossier(app, tokenBureau, dossierId, 'en_attente_validation');

      await request(app.getHttpServer())
        .post(`/dossiers/${dossierId}/statut`)
        .set('Authorization', `Bearer ${tokenSuperviseur}`)
        .send({ statut: 'valide' })
        .expect(200);
    });

    // Transitions INTERDITES
    it('terrain NE PEUT PAS changer le statut', async () => {
      await request(app.getHttpServer())
        .post(`/dossiers/${dossierId}/statut`)
        .set('Authorization', `Bearer ${tokenTerrain}`)
        .send({ statut: 'en_instruction' })
        .expect(403);
    });

    it('bureau NE PEUT PAS valider directement', async () => {
      await setStatutDossier(app, tokenBureau, dossierId, 'en_instruction');

      await request(app.getHttpServer())
        .post(`/dossiers/${dossierId}/statut`)
        .set('Authorization', `Bearer ${tokenBureau}`)
        .send({ statut: 'valide' })
        .expect(403);
    });

    it('REJET sans motif devrait échouer', async () => {
      await setStatutDossier(app, tokenBureau, dossierId, 'en_instruction');
      await setStatutDossier(app, tokenBureau, dossierId, 'en_attente_validation');

      await request(app.getHttpServer())
        .post(`/dossiers/${dossierId}/statut`)
        .set('Authorization', `Bearer ${tokenSuperviseur}`)
        .send({ statut: 'rejete', commentaire: 'Court' })  // Trop court
        .expect(400);
    });

    it('REJET avec motif long devrait réussir', async () => {
      await setStatutDossier(app, tokenBureau, dossierId, 'en_instruction');
      await setStatutDossier(app, tokenBureau, dossierId, 'en_attente_validation');

      await request(app.getHttpServer())
        .post(`/dossiers/${dossierId}/statut`)
        .set('Authorization', `Bearer ${tokenSuperviseur}`)
        .send({ statut: 'rejete', commentaire: 'Dossier incomplet : pièces justificatives manquantes' })
        .expect(200);
    });

    it('un dossier ARCHIVE ne peut plus être modifié', async () => {
      // Amener jusqu'à archivé
      await setStatutDossier(app, tokenBureau, dossierId, 'en_instruction');
      await setStatutDossier(app, tokenBureau, dossierId, 'en_attente_validation');
      await setStatutDossier(app, tokenSuperviseur, dossierId, 'valide');
      await setStatutDossier(app, tokenSuperviseur, dossierId, 'archive');

      // Tentative de modification du dossier archivé
      await request(app.getHttpServer())
        .put(`/dossiers/${dossierId}`)
        .set('Authorization', `Bearer ${tokenBureau}`)
        .send({ description: 'Tentative de modification' })
        .expect(403);
    });
  });

  // ─── RECHERCHE ────────────────────────────────────────────────
  describe('GET /dossiers (recherche)', () => {
    it('un agent terrain ne voit que ses propres dossiers', async () => {
      // Créer un dossier par l'agent terrain
      await request(app.getHttpServer())
        .post('/dossiers')
        .set('Authorization', `Bearer ${tokenTerrain}`)
        .send({ nomClient: 'Mon Client', numeroCompteur: 'TEST-TERRAIN', typeIntervention: 'Panne compteur' });

      // Créer un dossier par un agent bureau
      await request(app.getHttpServer())
        .post('/dossiers')
        .set('Authorization', `Bearer ${tokenBureau}`)
        .send({ nomClient: 'Autre Client', numeroCompteur: 'TEST-BUREAU', typeIntervention: 'Panne compteur' });

      const res = await request(app.getHttpServer())
        .get('/dossiers')
        .set('Authorization', `Bearer ${tokenTerrain}`)
        .expect(200);

      // L'agent terrain ne doit voir que son dossier
      const numeros = res.body.data.map((d: any) => d.numeroCompteur);
      expect(numeros).toContain('TEST-TERRAIN');
      expect(numeros).not.toContain('TEST-BUREAU');
    });

    it('la recherche par nom client fonctionne en partiel', async () => {
      await request(app.getHttpServer())
        .post('/dossiers')
        .set('Authorization', `Bearer ${tokenBureau}`)
        .send({ nomClient: 'Alphonse Biyong', numeroCompteur: 'TEST-SEARCH', typeIntervention: 'Panne compteur' });

      const res = await request(app.getHttpServer())
        .get('/dossiers?q=Biyong')
        .set('Authorization', `Bearer ${tokenBureau}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].nomClient).toContain('Biyong');
    });
  });
});

// ─── HELPERS DE TEST ─────────────────────────────────────────────

async function loginEtRecupererToken(app: INestApplication, identifiant: string, motDePasse: string): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ identifiant, motDePasse });
  return res.body.data.token;
}

async function setStatutDossier(
  app: INestApplication,
  token: string,
  dossierId: string,
  statut: string,
  commentaire?: string,
): Promise<void> {
  await request(app.getHttpServer())
    .post(`/dossiers/${dossierId}/statut`)
    .set('Authorization', `Bearer ${token}`)
    .send({ statut, commentaire: commentaire ?? 'Commentaire de test pour la transition' });
}
```

---

## TESTS AUTH

```typescript
// test/auth.e2e-spec.ts

describe('Auth (e2e)', () => {
  it('devrait connecter avec identifiants valides', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifiant: 'admin', motDePasse: 'Admin@2026' })
      .expect(200);

    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.utilisateur.motDePasse).toBeUndefined(); // Jamais exposé
  });

  it('devrait bloquer après 5 tentatives échouées', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifiant: 'agent_test', motDePasse: 'mauvais_mdp' });
    }

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifiant: 'agent_test', motDePasse: 'BonMotDePasse@1' })
      .expect(401);

    expect(res.body.error.code).toBe('AUTH_ACCOUNT_BLOCKED');
  });

  it('devrait retourner 401 avec un token invalide', async () => {
    await request(app.getHttpServer())
      .get('/dossiers')
      .set('Authorization', 'Bearer token_invalide')
      .expect(401);
  });

  it('devrait retourner 401 sans token', async () => {
    await request(app.getHttpServer())
      .get('/dossiers')
      .expect(401);
  });
});
```

---

## CONFIGURATION JEST

```json
// jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "testTimeout": 30000
}
```

---

## CHECKLIST AVANT DE VALIDER LES TESTS

```
□ Tous les endpoints sont couverts (happy path + cas d'erreur)
□ Toutes les transitions de statut AUTORISÉES sont testées
□ Toutes les transitions INTERDITES sont testées (avec le bon code d'erreur)
□ Chaque rôle est testé séparément pour les endpoints sensibles
□ Les agents terrain ne voient pas les dossiers des autres
□ Le rejet sans motif retourne 400 (pas 403)
□ Un dossier archivé refuse la modification avec 403
□ Le mot de passe n'apparaît jamais dans les réponses
□ Les tests nettoient leurs données après (afterEach)
□ Les tests sont indépendants et peuvent s'exécuter dans n'importe quel ordre
```
