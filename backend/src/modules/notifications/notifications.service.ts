import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(data: {
    destinataireId: string;
    dossierId?: string;
    type: string;
    message: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async findByUser(utilisateurId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { destinataireId: utilisateurId },
      order: { creeLe: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, utilisateurId: string): Promise<void> {
    await this.notificationRepository.update(
      { id, destinataireId: utilisateurId },
      { lu: true },
    );
  }

  async markAllAsRead(utilisateurId: string): Promise<void> {
    await this.notificationRepository.update(
      { destinataireId: utilisateurId },
      { lu: true },
    );
  }
}
