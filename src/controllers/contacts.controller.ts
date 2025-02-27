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
  InternalServerErrorException,
  Query,
  NotFoundException,
  ParseIntPipe,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string | string[];
}

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Contact>> {
    try {
      // Check for email uniqueness
      await this.contactsService.validateEmailUniqueness(
        createContactDto.email,
      );
      // Create new contact
      const contact = await this.contactsService.create(createContactDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Contact created successfully',
        data: contact,
      };
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Contact with this email already exists',
          error: 'Email must be unique',
        };
      }
      if (error instanceof BadRequestException) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          error: error.message,
        };
      }
      throw new InternalServerErrorException('Error creating contact');
    }
  }

  @Get()
  async findAll(
    @Query() query: { search?: string },
  ): Promise<ApiResponse<Contact[]>> {
    try {
      const search = query.search?.toString();
      const contacts = await this.contactsService.findAll({ search });
      return {
        statusCode: HttpStatus.OK,
        message: 'Contacts retrieved successfully',
        data: contacts,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No contacts found',
          data: [],
          error: error.message,
        };
      }
      throw new InternalServerErrorException('Error retrieving contacts');
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Contact>> {
    try {
      if (id <= 0) {
        throw new BadRequestException('ID must be a positive number');
      }
      const contact = await this.contactsService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Contact retrieved successfully',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Contact with ID ${id} not found`,
          error: error.message,
        };
      }
      if (error instanceof BadRequestException) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contact ID',
          error: error.message,
        };
      }
      throw new InternalServerErrorException('Error retrieving contact');
    }
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Contact>> {
    try {
      if (id <= 0) {
        throw new BadRequestException('ID must be a positive number');
      }
      const deletedContact = await this.contactsService.delete(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Contact deleted successfully',
        data: deletedContact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Contact with ID ${id} not found`,
          error: error.message,
        };
      }
      if (error instanceof BadRequestException) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contact ID',
          error: error.message,
        };
      }
      throw new InternalServerErrorException('Error deleting contact');
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ApiResponse<Contact>> {
    try {
      if (id <= 0) {
        throw new BadRequestException('ID must be a positive number');
      }
      // Service handles email uniqueness validation
      const updatedContact = await this.contactsService.update(
        id,
        updateContactDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Contact updated successfully',
        data: updatedContact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Contact with ID ${id} not found`,
          error: error.message,
        };
      }
      if (error instanceof BadRequestException) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          error: error.message,
        };
      }
      if (error instanceof ConflictException) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Email already in use',
          error: 'Email must be unique',
        };
      }
      throw new InternalServerErrorException('Error updating contact');
    }
  }
}
