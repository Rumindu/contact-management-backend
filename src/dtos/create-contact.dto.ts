import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { IsPhoneNumber } from '../validators/phone-number.decorator';

export class CreateContactDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @IsPhoneNumber({ message: 'Phone number is invalid' })
  phone?: string; 
}
