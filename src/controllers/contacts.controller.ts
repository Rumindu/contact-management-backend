import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
}
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Contact>> {
    const contact = await this.contactsService.create(createContactDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Contact created successfully',
      data: contact,
    };
  }

  @Get()
  async findAll(
    @Query() query: { search?: string },
  ): Promise<ApiResponse<Contact[]>> {
    const search = query.search?.toString();
    const contacts = await this.contactsService.findAll({ search });
    return {
      statusCode: HttpStatus.OK,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Contact>> {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }
    const contact = await this.contactsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact retrieved successfully',
      data: contact,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Contact>> {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }
    const deletedContact = await this.contactsService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact deleted successfully',
      data: deletedContact,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ApiResponse<Contact>> {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }
    const updatedContact = await this.contactsService.update(
      id,
      updateContactDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact updated successfully',
      data: updatedContact,
    };
  }
}
