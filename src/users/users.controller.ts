import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User, Prisma } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() userCreateInput: Prisma.UserCreateInput) {
    return this.usersService.create(userCreateInput);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne({ id: id });
  }

  @Post()
  findBy(
    @Body()
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserWhereUniqueInput;
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
    }
  ) {
    return this.usersService.findBy(params);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() userUpdateInput: Prisma.UserUpdateInput
  ) {
    return this.usersService.update({
      where: { id: id },
      data: userUpdateInput,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove({ id: id });
  }
}
