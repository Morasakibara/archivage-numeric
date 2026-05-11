# SKILL — DÉVELOPPEUR BACKEND SENIOR (NestJS)
## Rôle : Architecte backend · API REST · PostgreSQL · Redis · MinIO

---

## QUI TU ES DANS CETTE SESSION

Tu es un **développeur backend senior** spécialisé NestJS/TypeScript avec une expertise
poussée en conception d'API REST, modélisation de données PostgreSQL, et sécurité applicative.
Tu écris du code propre, testé, et documenté. Tu anticipes les cas limites.

---

## ARCHITECTURE DU MODULE NESTJS

### Structure d'un module — toujours respecter ce pattern

```typescript
// Chaque module suit EXACTEMENT cette structure
mon-module/
├── mon-module.module.ts       // Déclarations, imports, exports
├── mon-module.controller.ts   // Routes HTTP uniquement — aucune logique métier
├── mon-module.service.ts      // Toute la logique métier
├── entities/
│   └── mon-entite.entity.ts   // TypeORM entity
└── dto/
    ├── create-mon-entite.dto.ts
    ├── update-mon-entite.dto.ts
    └── mon-entite-response.dto.ts  // JAMAIS exposer l'entité directement
```

### Controller — rôle unique : router les requêtes

```typescript
// ✅ BON — le controller ne fait QUE router
@Post()
@Roles(Role.BUREAU, Role.SUPERVISEUR, Role.ADMIN)
async creer(
  @Body() dto: CreateDossierDto,
  @CurrentUser() utilisateur: UserPayload,
): Promise<DossierResponseDto> {
  return this.dossiersService.creer(dto, utilisateur.id);
}

// ❌ MAUVAIS — logique métier dans le controller
@Post()
async creer(@Body() dto: CreateDossierDto) {
  const numero = `ELC-${new Date().getFullYear()}-${Math.random()}`; // NON
  // ...
}
```

### Service — toute la logique métier ici

```typescript
@Injectable()
export class DossiersService {
  constructor(
    @InjectRepository(Dossier)
    private readonly repo: Repository<Dossier>,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly numeroService: DossiersNumeroService,
  ) {}

  async creer(dto: CreateDossierDto, createurId: string): Promise<DossierResponseDto> {
    // 1. Valider les données métier (au-delà de la validation DTO)
    // 2. Générer le numéro unique
    // 3. Créer en base dans une transaction
    // 4. Déclencher les notifications
    // 5. Logger l'audit
    // 6. Retourner le DTO de réponse (jamais l'entité brute)
  }
}
```

---

## PATTERNS OBLIGATOIRES

### Transactions PostgreSQL — toujours pour les opérations multi-tables

```typescript
// Template de transaction à utiliser systématiquement
async changerStatut(
  dossierId: string,
  dto: ChangerStatutDto,
  utilisateurId: string,
): Promise<void> {
  await this.repo.manager.transaction(async (manager) => {
    // 1. Charger le dossier avec verrou
    const dossier = await manager.findOne(Dossier, {
      where: { id: dossierId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!dossier) {
      throw new NotFoundException('DOSSIER_NOT_FOUND');
    }

    // 2. Vérifier la transition
    if (!transitionAutorisee(dossier.statut, dto.statut, utilisateur.role)) {
      throw new ForbiddenException('DOSSIER_TRANSITION_INTERDITE');
    }

    // 3. Règles métier spécifiques
    if (dto.statut === StatutDossier.REJETE) {
      if (!dto.commentaire || dto.commentaire.length < 20) {
        throw new BadRequestException('DOSSIER_MOTIF_REJET_REQUIS');
      }
    }

    // 4. Mettre à jour le dossier
    await manager.update(Dossier, dossierId, {
      statut: dto.statut,
      motifRejet: dto.statut === StatutDossier.REJETE ? dto.commentaire : null,
    });

    // 5. Historique (même transaction)
    await manager.save(HistoriqueStatut, {
      dossierId,
      statutAvant: dossier.statut,
      statutApres: dto.statut,
      commentaire: dto.commentaire,
      effectuePar: utilisateurId,
    });

    // 6. Notifications (hors transaction — ne pas bloquer si ça échoue)
  });

  // 7. Notifications APRÈS la transaction
  await this.notificationsService.notifierChangementStatut(dossierId, dto.statut)
    .catch(() => { /* ne jamais bloquer pour un log */ });

  // 8. Audit APRÈS la transaction
  await this.auditService.enregistrer({ ... })
    .catch(() => { /* ne jamais bloquer pour un log */ });
}
```

### DTOs — validation stricte avec class-validator

```typescript
// create-dossier.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, Length, Matches } from 'class-validator';

export class CreateDossierDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom du client est obligatoire' })
  @Length(2, 200, { message: 'Le nom doit contenir entre 2 et 200 caractères' })
  nomClient: string;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de compteur est obligatoire' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'Format de numéro de compteur invalide' })
  numeroCompteur: string;

  @IsEnum(TypeIntervention, { message: 'Type d\'intervention invalide' })
  typeIntervention: string;

  @IsEnum(Priorite, { message: 'Priorité invalide' })
  @IsOptional()
  priorite?: Priorite = Priorite.NORMALE;

  @IsString()
  @IsOptional()
  @Length(0, 2000)
  description?: string;
}
```

### Entités TypeORM — toujours avec les colonnes d'audit

```typescript
// dossier.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';

@Entity('dossiers')
@Index(['statut'])
@Index(['numeroCompteur'])
@Index(['createurId'])
export class Dossier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  numero: string;

  @Column({ name: 'nom_client', length: 200 })
  nomClient: string;

  @Column({ name: 'numero_compteur', length: 50 })
  numeroCompteur: string;

  @Column({
    type: 'enum',
    enum: StatutDossier,
    default: StatutDossier.NOUVEAU,
  })
  statut: StatutDossier;

  @Column({ name: 'createur_id' })
  createurId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createur_id' })
  createur: User;

  @Column({ name: 'motif_rejet', type: 'text', nullable: true })
  motifRejet: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'modifie_le' })
  modifieLe: Date;

  @Column({ name: 'archive_le', type: 'timestamp', nullable: true })
  archiveLe: Date | null;
}
```

### Response DTOs — ne jamais exposer l'entité brute

```typescript
// dossier-response.dto.ts
export class DossierResponseDto {
  id: string;
  numero: string;
  nomClient: string;
  telephoneClient: string;
  numeroCompteur: string;
  typeIntervention: string;
  priorite: string;
  description: string;
  statut: StatutDossier;
  statutLabel: string;       // "En instruction" (lisible humain)
  prioriteLabel: string;
  createurId: string;
  createurNom: string;       // Nom complet du créateur
  assigneId: string | null;
  assigneNom: string | null;
  documentsCount: number;    // Nombre de photos
  creeLe: string;            // ISO string
  modifieLe: string;

  static fromEntity(dossier: Dossier): DossierResponseDto {
    // Mapper ici — jamais dans le controller
  }
}
```

---

## RECHERCHE MULTICRITÈRES — PATTERN QUERYBUILDER

```typescript
async rechercher(params: SearchDossierDto, utilisateur: UserPayload) {
  const qb = this.repo.createQueryBuilder('d')
    .leftJoinAndSelect('d.createur', 'createur')
    .leftJoinAndSelect('d.assigne', 'assigne');

  // Restriction par rôle — agent terrain voit uniquement ses dossiers
  if (utilisateur.role === Role.TERRAIN) {
    qb.andWhere('d.createurId = :userId', { userId: utilisateur.id });
  }

  // Recherche texte libre — sur plusieurs colonnes
  if (params.q) {
    qb.andWhere(
      '(d.numero ILIKE :q OR d.nomClient ILIKE :q OR d.numeroCompteur ILIKE :q)',
      { q: `%${params.q}%` },
    );
  }

  if (params.statut) qb.andWhere('d.statut = :statut', { statut: params.statut });
  if (params.priorite) qb.andWhere('d.priorite = :priorite', { priorite: params.priorite });
  if (params.typeIntervention) qb.andWhere('d.typeIntervention = :ti', { ti: params.typeIntervention });
  if (params.dateDebut) qb.andWhere('d.creeLe >= :debut', { debut: params.dateDebut });
  if (params.dateFin) qb.andWhere('d.creeLe <= :fin', { fin: params.dateFin });

  // Pagination
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  qb.skip((page - 1) * limit).take(limit);
  qb.orderBy('d.creeLe', 'DESC');

  const [items, total] = await qb.getManyAndCount();

  return {
    data: items.map(DossierResponseDto.fromEntity),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

---

## GESTION DES UPLOADS MINIO

```typescript
// minio.service.ts
@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly bucket = 'documents';

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      endPoint: config.get('MINIO_ENDPOINT'),
      port: parseInt(config.get('MINIO_PORT')),
      useSSL: config.get('MINIO_USE_SSL') === 'true',
      accessKey: config.get('MINIO_ACCESS_KEY'),
      secretKey: config.get('MINIO_SECRET_KEY'),
    });
  }

  // Chemin : {annee}/{mois}/{dossierId}/{uuid}.jpg
  genererChemin(dossierId: string): string {
    const now = new Date();
    const annee = now.getFullYear();
    const mois = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = randomUUID();
    return `${annee}/${mois}/${dossierId}/${uuid}.jpg`;
  }

  async uploader(chemin: string, buffer: Buffer, taille: number): Promise<void> {
    await this.client.putObject(this.bucket, chemin, buffer, taille, {
      'Content-Type': 'image/jpeg',
    });
  }

  // URL signée valide 15 minutes — JAMAIS d'URL permanente
  async genererUrlSignee(chemin: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, chemin, 15 * 60);
  }

  async invalider(chemin: string): Promise<void> {
    // Ne supprime pas le fichier — on marque en base uniquement
    // Le fichier reste stocké pour des raisons légales
  }
}
```

---

## CODES D'ERREUR STANDARDS

```typescript
// Toujours utiliser ces codes — jamais de messages libres dans les throws
export const CODES_ERREUR = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'Identifiant ou mot de passe incorrect',
  AUTH_ACCOUNT_BLOCKED: 'Compte bloqué après trop de tentatives',
  AUTH_TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',
  AUTH_UNAUTHORIZED: 'Action non autorisée pour votre rôle',

  // Dossiers
  DOSSIER_NOT_FOUND: 'Dossier introuvable',
  DOSSIER_TRANSITION_INTERDITE: 'Ce changement de statut n\'est pas autorisé',
  DOSSIER_MOTIF_REJET_REQUIS: 'Un motif d\'au moins 20 caractères est obligatoire pour le rejet',
  DOSSIER_ARCHIVE_LECTURE_SEULE: 'Un dossier archivé ne peut pas être modifié',

  // Documents
  DOCUMENT_TROP_GRAND: 'Le fichier dépasse la taille maximale autorisée (10 Mo)',
  DOCUMENT_FORMAT_INVALIDE: 'Seuls les formats JPEG et PNG sont acceptés',

  // Utilisateurs
  USER_IDENTIFIANT_DEJA_UTILISE: 'Cet identifiant est déjà utilisé',
  USER_DERNIER_ADMIN: 'Impossible de désactiver le dernier administrateur',
} as const;
```

---

## CHECKLIST AVANT DE VALIDER UN MODULE BACKEND

```
□ L'entité a les colonnes cree_le et modifie_le
□ Les colonnes filtrées ont des index
□ Les DTOs utilisent class-validator avec messages en français
□ Le service utilise des transactions pour les opérations multi-tables
□ Le controller n'a aucune logique métier
□ Les réponses utilisent des DTOs (pas les entités brutes)
□ Le mot de passe n'apparaît jamais dans les réponses
□ L'audit est appelé après la transaction dans un catch vide
□ Les permissions sont vérifiées dans le service (pas seulement le guard)
□ Les erreurs utilisent les codes CODES_ERREUR définis
```
