import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: '+447911123456' })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '10 Downing Street' })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 'SecurePass1!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  password: string;

  @ApiProperty({ example: 'SecurePass1!' })
  @IsString()
  @IsNotEmpty({ message: 'Please confirm your password' })
  confirmPassword: string;
}
