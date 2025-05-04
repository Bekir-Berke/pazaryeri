import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {AuthGuard} from '../auth/auth.guard';
import {PermissionsGuard} from '../auth/permissions.guard';
import {Permissions} from '../auth/permissions.decorator';
import {Permission} from '../auth/permissions.enum';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.UPDATE_ORDER)
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req:Request) {
    const storeId = req['user'].sub;
    return this.invoiceService.create(createInvoiceDto, storeId);
  }
  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(+id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(+id);
  }
}
