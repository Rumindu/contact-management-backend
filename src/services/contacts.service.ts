import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';
import { validate } from 'class-validator';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

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
    await this.validateEmailUniqueness(createContactDto.email);
    const contact = this.contactRepository.create(createContactDto);
    const errors = await validate(contact);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) =>
        Object.values(error.constraints || {}).join(', '),
      );
      throw new BadRequestException(errorMessages);
    }
    return await this.contactRepository.save(contact);
  }

  async findAll({ search = '' }: { search?: string }): Promise<Contact[]> {
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
  }

  async findOne(id: number): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'createdAt'],
    });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async delete(id: number): Promise<Contact> {
    const contact = await this.findOne(id);
    await this.contactRepository.delete(id);
    this.logger.log(`Contact with ID ${id} deleted successfully`);
    return contact;
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
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
  }
}
