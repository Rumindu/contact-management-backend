import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactsRepository.create(createContactDto);
    return this.contactsRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactsRepository.find();
  }

  async remove(id: number): Promise<void> {
    const result = await this.contactsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }
}
