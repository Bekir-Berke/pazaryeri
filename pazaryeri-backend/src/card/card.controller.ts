import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import {AuthGuard} from '../auth/auth.guard';
import {PermissionsGuard} from '../auth/permissions.guard';
import {UseGuards} from '@nestjs/common';
import {Permissions} from '../auth/permissions.decorator';
import {Permission} from '../auth/permissions.enum';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_CARD)
  create(@Body() createCardDto: CreateCardDto, @Req() req: Request,) {
    const userId = req['user'].sub;
    return this.cardService.create(userId,createCardDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_CARD)
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto, @Req() req: Request,) {
    const userId = req['user'].sub;
    return this.cardService.update(userId,id, updateCardDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_CARD)
  remove(@Param('id') id: string, @Req() req: Request,) {
    const userId = req['user'].sub;
    return this.cardService.remove(userId, id);
  }
}
