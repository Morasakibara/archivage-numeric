import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }
    return user;
  }

  async findOneByIdentifiant(identifiant: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { identifiant },
      addSelect: ['mot_de_passe'], // Nécessaire pour l'auth
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: [
        { identifiant: createUserDto.identifiant },
        { email: createUserDto.email },
      ],
    });

    if (existing) {
      throw new ConflictException('Identifiant ou email déjà utilisé');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedMotDePasse = await bcrypt.hash(createUserDto.motDePasse, salt);

    const user = this.userRepository.create({
      ...createUserDto,
      motDePasse: hashedMotDePasse,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOneById(id);
    user.actif = !user.actif;
    return this.userRepository.save(user);
  }

  async changePassword(id: string, nouveauMotDePasse: string): Promise<void> {
    const salt = await bcrypt.genSalt(12);
    const hashedMotDePasse = await bcrypt.hash(nouveauMotDePasse, salt);
    await this.userRepository.update(id, {
      motDePasse: hashedMotDePasse,
      premiereConnexion: false,
    });
  }
}
