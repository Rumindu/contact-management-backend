import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';
import { validate } from 'class-validator';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async findByEmail(email: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { email } });
  }

  async validateEmailUniqueness(email: string): Promise<void> {
    const existingContact = await this.findByEmail(email);
    if (existingContact) {
      throw new ConflictException('Email already in use');
    }
  }

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const contact = this.contactRepository.create(createContactDto);
      // Validate the contact entity
      const errors = await validate(contact);
      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        throw new BadRequestException(errorMessages);
      }
      return await this.contactRepository.save(contact);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create contact');
    }
  }

  async findAll({ search = '' }: { search?: string }): Promise<Contact[]> {
    try {
      const query = this.contactRepository.createQueryBuilder('contact');

      if (search) {
        query.where(
          '(contact.name LIKE :search OR contact.email LIKE :search OR contact.phone LIKE :search)',
          {
            search: `%${search}%`,
          },
        );
      }
      query.orderBy('contact.createdAt', 'DESC');
      const contacts = await query.getMany();

      if (contacts.length === 0) {
        throw new NotFoundException('No contacts found');
      }
      return contacts;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async findOne(id: number): Promise<Contact> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
        select: ['id', 'name', 'email', 'phone', 'createdAt'],
      });
      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async delete(id: number): Promise<Contact> {
    try {
      const contact = await this.findOne(id);
      const result = await this.contactRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete contact');
    }
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    try {
      const contact = await this.findOne(id);
      if (updateContactDto.email && updateContactDto.email !== contact.email) {
        await this.validateEmailUniqueness(updateContactDto.email);
      }
      const updatedContact = Object.assign(contact, updateContactDto);
      const errors = await validate(updatedContact);
      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        throw new BadRequestException(errorMessages);
      }
      return await this.contactRepository.save(updatedContact);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update contact');
    }
  }
}
