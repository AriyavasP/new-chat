import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { Dialogs } from './entity/dialog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
const fs = require('fs');

@Injectable()
export class AppService {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @InjectRepository(Dialogs) private readonly dialogs: Repository<Dialogs>,
  ) {}
  async chatAI(message: string): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: this.configService.get('OPENAI_API_KEY'),
      });
      let responseText: string = '';
      const data: Dialogs[] = await this.dialogs.find({
        order: {
          createTime: 'DESC',
        },
        take: 4
      });
      let value = data.map((item) => {
        return {
          role: item.role,
          content: item.content,
        };
      });
      const prompt = [
        {
          "role": "system",
          "content": ``
        }
      ];
      let content = [];
      content.push(...prompt, ...value);

      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [...content, { role: 'user', content: message }],
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      });
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          responseText += content;
          process.stdout.write(content);
        }
      }
      await Promise.all([
        await this.dialogs.save({ role: 'assistant', content: responseText, topic: 'conversation' }),
        await this.dialogs.save({ role: 'user', content: message, topic: 'conversation' }),
      ]);
      return responseText;
    } catch (error) {
      throw error;
    }
  }

  async generateTopic(message: string): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: this.configService.get('OPENAI_API_KEY'),
      });

      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: "system",
          content: "คุณเป็น AI ผู้ช่วยในการแยกประเภทคำถามที่ถามเกี่ยวกับศูนย์การค้า โดยจะต้องวิเคราะห์คำถามและจัดประเภทให้อยู่ในหนึ่งในสามหัวข้อหลักดังนี้:\nPromotion - คำถามเกี่ยวกับโปรโมชั่น ส่วนลด แพ็คเกจ ของแถม สิทธิพิเศษ หรือของรางวัลพิเศษ\nLocation - คำถามเกี่ยวกับสถานที่ตั้ง การเดินทางมายังสถานที่นั้น หรือการติดต่อ\nหากคำถามไม่สามารถจัดอยู่ในสามหัวข้อนี้ได้ ให้ตอบว่า 'Promotion'"
        },
        {
          "role": "user",
          "content": "โปรโมชั่นบัตรเครดิตมีอะไรบ้าง"
        },
        {
          "role": "assistant",
          "content": "Promotion"
        },
        {
          "role": "user",
          "content": "รายการร้านค้าใน siamcenter"
        },
        {
          "role": "assistant",
          "content": "Location"
        },
        {
          "role": "user",
          "content": "ข้อมูลเกี่ยวกับโปรโมชั่น"
        },
        {
          "role": "assistant",
          "content": "Promotion"
        },
        {
          "role": "user",
          "content": "ร้านอาหารที่ชั้น 1F มีร้านอะไรบ้าง"
        },
        {
          "role": "assistant",
          "content": "Location"
        },
        {
          "role": "user",
          "content": "จอดรถฟรีที่ไอคอนสยามต้องทำอย่างไร"
        },
        {
          "role": "assistant",
          "content": "Promotion"
        },
        {
          "role": "user",
          "content": "Zara專賣店在哪裡"
        },
        {
          "role": "assistant",
          "content": "Location"
        },
        { 
          role: 'user', 
          content: message 
        }
      ],
        stream: true,
        temperature: 0.1,
        max_tokens: 128,
      });
      let responseText: string = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          responseText += content;
          process.stdout.write(content);
        }
      }

      return responseText;
    } catch (error) {
      throw error;
    }
  }
}
