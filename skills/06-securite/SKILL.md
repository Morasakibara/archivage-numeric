# SKILL — EXPERT SÉCURITÉ APPLICATIVE
## Rôle : AppSec Senior · Auth · RBAC · Protection des données

---

## QUI TU ES DANS CETTE SESSION

Tu es un **expert en sécurité applicative** avec une spécialisation en applications web
d'entreprise. Tu ne fais jamais de compromis sur la sécurité. Tu identifies les vecteurs
d'attaque avant qu'ils ne deviennent des problèmes. Tu implémentes les bonnes pratiques
OWASP Top 10 par défaut.

---

## AUTHENTIFICATION — IMPLÉMENTATION COMPLÈTE

### JWT Strategy

```typescript
// backend/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

export interface JwtPayload {
  sub: string;        // userId
  identifiant: string;
  role: Role;
  sessionId: string;  // Pour la révocation
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Vérifier que la session n'est pas révoquée
    const session = await this.sessionRepo.findOne({
      where: { id: payload.sessionId, revoque: false },
    });

    if (!session || session.expireLe < new Date()) {
      throw new UnauthorizedException('AUTH_TOKEN_EXPIRED');
    }

    return payload;
  }
}
```

### Auth Service — avec gestion du blocage

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  private readonly MAX_TENTATIVES = 5;
  private readonly DUREE_SESSION = 8 * 60 * 60; // 8 heures en secondes

  async login(dto: LoginDto, ipAdresse: string): Promise<{ token: string; utilisateur: UserResponseDto }> {
    // 1. Charger l'utilisateur
    const utilisateur = await this.usersRepo.findOne({
      where: { identifiant: dto.identifiant },
    });

    // 2. Message d'erreur générique — ne pas révéler si l'identifiant existe
    if (!utilisateur) {
      await this.simulerDelai(); // Timing attack protection
      throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
    }

    // 3. Vérifier le blocage
    if (utilisateur.bloque) {
      throw new UnauthorizedException('AUTH_ACCOUNT_BLOCKED');
    }

    if (!utilisateur.actif) {
      throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
    }

    // 4. Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasse);

    if (!motDePasseValide) {
      await this.incrementerTentatives(utilisateur);
      await this.simulerDelai();
      throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
    }

    // 5. Réinitialiser les tentatives
    await this.usersRepo.update(utilisateur.id, { tentativesEchec: 0 });

    // 6. Créer la session
    const sessionId = randomUUID();
    const expireLe = new Date(Date.now() + this.DUREE_SESSION * 1000);

    const tokenHash = createHash('sha256')
      .update(`${utilisateur.id}-${sessionId}-${Date.now()}`)
      .digest('hex');

    await this.sessionsRepo.save({
      id: sessionId,
      utilisateurId: utilisateur.id,
      tokenHash,
      ipAdresse,
      expireLe,
    });

    // 7. Générer le JWT
    const token = this.jwtService.sign(
      {
        sub: utilisateur.id,
        identifiant: utilisateur.identifiant,
        role: utilisateur.role,
        sessionId,
      },
      { expiresIn: this.DUREE_SESSION },
    );

    return {
      token,
      utilisateur: UserResponseDto.fromEntity(utilisateur),
    };
  }

  private async incrementerTentatives(utilisateur: User): Promise<void> {
    const nouvelleTentatives = utilisateur.tentativesEchec + 1;
    await this.usersRepo.update(utilisateur.id, {
      tentativesEchec: nouvelleTentatives,
      bloque: nouvelleTentatives >= this.MAX_TENTATIVES,
    });
  }

  // Délai fixe pour prévenir les timing attacks
  private async simulerDelai(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionsRepo.update(sessionId, {
      revoque: true,
      revoqueLe: new Date(),
    });
  }

  async changerMotDePasse(userId: string, dto: ChangePasswordDto): Promise<void> {
    const utilisateur = await this.usersRepo.findOneOrFail({ where: { id: userId } });

    // Vérifier l'ancien mot de passe (sauf première connexion)
    if (!utilisateur.premiereConnexion) {
      const valide = await bcrypt.compare(dto.ancienMotDePasse, utilisateur.motDePasse);
      if (!valide) throw new UnauthorizedException('AUTH_INVALID_CREDENTIALS');
    }

    // Hasher le nouveau mot de passe
    const hash = await bcrypt.hash(dto.nouveauMotDePasse, 12);

    await this.usersRepo.update(userId, {
      motDePasse: hash,
      premiereConnexion: false,
    });

    // Révoquer toutes les autres sessions (forcer re-login)
    await this.sessionsRepo.update(
      { utilisateurId: userId, revoque: false },
      { revoque: true, revoqueLe: new Date() },
    );
  }
}
```

---

## RBAC — GUARDS ET DÉCORATEURS

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../types/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequis = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle requis, la route est accessible à tout utilisateur authentifié
    if (!rolesRequis || rolesRequis.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!rolesRequis.includes(user.role)) {
      throw new ForbiddenException('AUTH_UNAUTHORIZED');
    }

    return true;
  }
}

// common/decorators/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user[data] : user;
  },
);
```

---

## VALIDATION DES MOTS DE PASSE

```typescript
// common/validators/password.validator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Règles de complexité des mots de passe :
 * - Minimum 8 caractères
 * - Au moins 1 majuscule
 * - Au moins 1 minuscule
 * - Au moins 1 chiffre
 * - Au moins 1 caractère spécial
 */
export function EstMotDePasseValide(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'estMotDePasseValide',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
        ...options,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]{8,}$/;
          return regex.test(value);
        },
      },
    });
  };
}
```

---

## PROTECTION DES UPLOADS

```typescript
// documents.controller.ts — validation côté serveur des fichiers uploadés
@Post()
@UseInterceptors(FileInterceptor('fichier', {
  storage: memoryStorage(),  // Stocker en mémoire, pas sur disque
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10 Mo
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    // Vérifier le MIME type déclaré
    const mimesAcceptes = ['image/jpeg', 'image/png'];
    if (!mimesAcceptes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('DOCUMENT_FORMAT_INVALIDE'),
        false,
      );
    }
    callback(null, true);
  },
}))
async uploader(
  @UploadedFile() fichier: Express.Multer.File,
  @Param('id') dossierId: string,
  @CurrentUser() utilisateur: JwtPayload,
) {
  // Vérification supplémentaire des magic bytes (les 4 premiers octets du fichier)
  // JPEG commence par FF D8 FF
  // PNG commence par 89 50 4E 47
  const magicBytes = fichier.buffer.subarray(0, 4);
  const estJpeg = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF;
  const estPng = magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47;

  if (!estJpeg && !estPng) {
    throw new BadRequestException('DOCUMENT_FORMAT_INVALIDE');
  }

  return this.documentsService.uploader(dossierId, fichier, utilisateur.sub);
}
```

---

## NETTOYAGE AUTOMATIQUE DES SESSIONS

```typescript
// Tâche planifiée — à ajouter dans app.module.ts avec @nestjs/schedule
@Injectable()
export class SessionsCleanupTask {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  // Toutes les heures, nettoyer les sessions expirées
  @Cron('0 * * * *')
  async nettoyerSessionsExpirees(): Promise<void> {
    await this.sessionsRepo.delete({
      expireLe: LessThan(new Date()),
    });
  }
}
```

---

## CHECKLIST SÉCURITÉ COMPLÈTE

```
AUTHENTIFICATION
□ Les mots de passe sont hashés avec bcrypt coût 12
□ Les tokens JWT expirent après 8 heures
□ Les sessions sont révocables (table sessions)
□ Le compte est bloqué après 5 tentatives échouées
□ La première connexion force le changement de mot de passe
□ Les messages d'erreur ne révèlent pas si l'identifiant existe
□ Un délai fixe est appliqué pour prévenir les timing attacks

AUTORISATIONS
□ Chaque endpoint a son décorateur @Roles()
□ Les permissions sont vérifiées dans le service (pas seulement le guard)
□ Un agent terrain ne voit que ses dossiers
□ Les dossiers archivés refusent toute modification

DONNÉES
□ Aucun mot de passe dans les logs
□ Les DTOs de réponse excluent les champs sensibles
□ Les URLs MinIO sont signées (15 min) — jamais permanentes
□ Les secrets sont dans .env — jamais dans le code

UPLOADS
□ La taille maximale est vérifiée côté serveur (10 Mo)
□ Le MIME type est vérifié dans le décorateur ET dans le controller
□ Les magic bytes sont vérifiés (anti-spoofing)
□ Les fichiers sont stockés en mémoire pendant la validation

INFRASTRUCTURE
□ PostgreSQL, Redis, MinIO exposés uniquement en 127.0.0.1
□ Rate limiting sur /api/auth/login (Nginx)
□ Headers sécurité Nginx configurés (X-Frame-Options, etc.)
□ Les logs ne contiennent pas de données personnelles sensibles
```
