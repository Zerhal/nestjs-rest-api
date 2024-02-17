import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  Equals,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message: 'Password must meet certain criteria',
  })
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @Equals('password', { message: 'Confirm password must match the password' })
  readonly confirm: string;
}
