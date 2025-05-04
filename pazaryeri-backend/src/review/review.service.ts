import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {PrismaService} from '../prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma : PrismaService) {}
  create(userId:string, createReviewDto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
        orderItemId: createReviewDto.orderItemId,
      },
    })
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
