import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';

interface IOpenAIResponse {
  status: HttpStatus;
  message: string;
}

@Controller('/api/v1')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
  ) {}

  @Post('/openAI')
  async getOpenAIResponse(
    @Body('message') message: string,
  ): Promise<IOpenAIResponse> {
    try {
      const chat = await this.appService.chatAI(message);
      this.logger.log(`Response body: ${chat}`);
      const response: IOpenAIResponse = {
        status: HttpStatus.OK,
        message: chat,
      };
      return response;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
