import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(loginDto: LoginDto, ipAdresse?: string) {
    const user = await this.usersService.findOneByIdentifiant(loginDto.identifiant);

    if (!user || !(await bcrypt.compare(loginDto.motDePasse, user.motDePasse))) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (!user.actif || user.bloque) {
      throw new UnauthorizedException('Compte désactivé ou bloqué');
    }

    this.auditService.enregistrer({
      utilisateurId: user.id,
      action: 'connexion',
      ipAdresse,
    });

    const payload = { 
      sub: user.id, 
      identifiant: user.identifiant, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        premiereConnexion: user.premiereConnexion,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOneByIdentifiant((await this.usersService.findOneById(userId)).identifiant);
    
    // findOneById n'inclut pas le MDP par défaut, donc on utilise findOneByIdentifiant qui l'ajoute via addSelect dans UsersService
    // Mais attendez, findOneByIdentifiant prend l'identifiant. 
    // Faisons ça proprement.

    if (!user || !(await bcrypt.compare(changePasswordDto.ancienMotDePasse, user.motDePasse))) {
      throw new BadRequestException('Ancien mot de passe incorrect');
    }

    await this.usersService.changePassword(userId, changePasswordDto.nouveauMotDePasse);
    return { message: 'Mot de passe modifié avec succès' };
  }
}
