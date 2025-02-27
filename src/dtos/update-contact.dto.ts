import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class UpdateContactDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
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
