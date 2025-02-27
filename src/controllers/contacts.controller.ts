import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Put,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';
import { Contact } from '../entities/contact.entity';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  async findAll(): Promise<Contact[]> {
    return this.contactsService.findAll();
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contactsService.remove(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(+id, updateContactDto);
  }
}
