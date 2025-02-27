import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateContactDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @Matches(
    /^\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}$/,
    {
      message: 'Phone number is invalid',
    },
  )
  phone?: string;
}
