import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const methode = req.method;

    // Seules les mutations sont auditées par défaut via l'intercepteur
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(methode)) {
      return next.handle();
    }

    const utilisateur = req.user;
    const route = req.route?.path || req.url;

    return next.handle().pipe(
      tap(() => {
        this.auditService.enregistrer({
          utilisateurId: utilisateur?.id,
          action: `${methode} ${route}`,
          ipAdresse: req.ip,
          details: { body: req.body },
        });
      }),
    );
  }
}
