import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { Dialogs } from './entity/dialog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @InjectRepository(Dialogs) private readonly dialogs: Repository<Dialogs>,
  ) {}
  async chatAI(message: string): Promise<string> {
    try {
      const prompt = [{
        role: 'system',
        content:
          "รายละเอียดโปรโมชันบัตรเครดิต:\n\nกสิกรไทย:\n- รับเครดิตเงินคืน 12% เมื่อใช้คะแนน K Point แลกเท่ายอดใช้จ่าย  \n- ลงทะเบียนผ่าน SMS\n\nกรุงเทพ:\n- แลกคะแนนสะสมตามยอดใช้จ่าย รับเครดิตเงินคืนสูงสุด 16%\n- จำกัดการแลกคะแนน 500,000 คะแนน\n- ลงทะเบียนผ่าน SMS\n\nซิตี้แบงก์:  \n- ใช้คะแนนสะสมเท่ายอดใช้จ่าย รับเครดิตเงินคืนสูงสุด 15%\n- จำกัดการแลกคะแนน 100,000 คะแนน\n- ลงทะเบียนที่จุดลงทะเบียน\n\nออมสิน:\n- ใช้คะแนน GSB Reward Point แลกเท่ายอดใช้จ่าย \n- รับเครดิตเงินคืนสูงสุด 15% \n- จำกัดแลกคะแนนสูงสุด 100,000 คะแนน\n- ลงทะเบียนผ่าน SMS\n\nกรุงศรี:\n- รับเครดิตเงินคืนสูงสุด 800 บาท\n- แลกคะแนนรับเครดิตเงินคืนเพิ่ม 10%  \n- แลกคะแนนรับ e-Coupon Siam Gift Card \n\nKTC:\n- ใช้คะแนน KTC FOREVER เท่ายอดใช้จ่าย รับเครดิตเงินคืน 12% \n- ลงทะเบียนแสกน QR Code\n\nคาร์ดเอ็กซ์และซีไอเอ็มบี:\n- ใช้คะแนน CardX Rewards เท่ายอดซื้อ \n- รับเครดิตเงินคืน 10-12% \n- จำกัดแลกคะแนน 200,000 คะแนน\n- ลงทะเบียนที่จุดลงทะเบียน\n\nทหารไทย:  \n- ใช้คะแนนสะสมแลกเท่ายอดใช้จ่าย \n- รับเครดิตเงินคืน 12-15%\n- จำกัดแลกคะแนน 100,000 คะแนน\n- ลงทะเบียนที่จุดลงทะเบียน\n\nบัตรเครดิตกลุ่ม reserve ของทหารไทย:\n- ttb reserve infinite\n- ttb reserve signature\n\nบัตรเครดิตที่มีคะแนนสะสมของทหารไทย:  \n- ttb absolute\n- ttb so fast\n- ttb royal top pass\n- TMB Absolute\n- TMB So Fast  \n- TMB Royal Top Brass\n- TBANK Black Diamond\n- TBANK Blue Diamond  \n- TBANK Diamond\n\nกิจกรรมและสิทธิประโยชน์อื่นๆ:\n\n1) กิจกรรม \"ใบเสร็จมีค่า ยิ่งสะสม ยิ่งได้\":\n- สำหรับลูกค้า ONESIAM SuperApp\n- ระยะเวลา 1-30 เม.ย. 66  \n- นำใบเสร็จสะสมยอดใช้จ่าย รับรางวัล:\n  - iPhone 14 Yellow 1 รางวัล\n  - AirPods 3 2 รางวัล \n  - 3,000 VIZ Coins 10 รางวัล\n- ใบเสร็จจากร้านค้าที่ระบุ ลำดับใบเสร็จกำหนดผู้ชนะ\n- ประกาศผล 31 พ.ค. 66 ทาง Facebook ONESIAM\n- ผู้ชนะแสดงบัตรประชาชนและ VIZ Profile\n- รับรางวัลที่สยามพารากอน 1-30 มิ.ย. 66\n\n2) คูปองเครื่องดื่ม KOI The''' 19 บาท (ปกติ 55 บาท):\n- สมาชิก ONESIAM SuperApp ใหม่ ลงทะเบียนครั้งแรก  \n- เก็บคูปอง 1-30 เม.ย. 66 ใช้ได้ถึง 15 พ.ค. 66\n- จำกัด 5,000 สิทธิ์\n- แสดง QR Code ที่ร้าน\n\n3) คูปองส่วนลด 300 บาท เมื่อช้อป 1,000 บาทขึ้นไปบนแอป:  \n- สมาชิกใหม่ลงทะเบียนครั้งแรกเท่านั้น\n- รับและใช้คูปอง 1-30 เม.ย. 66\n- จำกัด 5,000 สิทธิ์\n\n4) ฟรี 100 VIZ Coins เมื่อช้อปสะสมยอด 1,000 บาท: \n- สมาชิกใหม่ลงทะเบียนครั้งแรกเท่านั้น\n- รับและใช้สิทธิ์ 1-30 เม.ย. 66\n- จำกัด 5,000 สิทธิ์  \n- แสดงคูปองและใบเสร็จรับ 100 VIZ Coins ใน 24 ชม.\n\n5) แต่งหน้าฟรีที่ JUNGSAEMMOOL ตลอดปี:\n- ไม่รวมกันคิ้ว ติดขนตา \n- สมาชิก ONESIAM SuperApp เท่านั้น\n- โทรจองสาขาล่วงหน้า 1 วัน  \n- แสดง VIZ Profile รับสิทธิ์\n\n6) จอดรถฟรีเพิ่ม 2 ชม. ที่ไอคอนสยามและ ICS:\n- สมาชิก ONESIAM SuperApp เท่านั้น  \n- แสดง VIZ Profile รับสิทธิ์ที่ไอคอนสยาม ชั้น M\n- ใช้สิทธิ์ได้ 1 เม.ย. - 31 ธ.ค. 66 \n\n7) ใบเสร็จมีค่า ยิ่งสะสมยิ่งได้ ที่สยามเซ็นเตอร์:\n- สมาชิก ONESIAM SuperApp เท่านั้น\n- ระยะเวลา 1-30 เม.ย. 66  \n- นำใบเสร็จ 100+ บาทสะสมยอดที่ร้านค้าที่ระบุ\n- รับฟรี 10 VIZ Coins/ใบเสร็จ \n- จำกัด 10 สิทธิ์/วัน 30 สิทธิ์/สมาชิก \n- ใช้ VIZ Coins ได้ถึง 30 มิ.ย. 66\n\n8) คูปองส่วนลด 100 บาท เมื่อใช้จ่าย 300 บาทบนแอป: \n- สมาชิก ONESIAM SuperApp เท่านั้น\n- รับและใช้คูปอง 1-30 เม.ย. 66\n- จำกัด 2,000 สิทธิ์  \n- รับตั๋วหนังเมเจอร์ 1 ใบฟรี (ใช้ได้เฉพาะสาขาพารากอนและไอคอนสยาม)\n\nรายการร้านค้าและบริการ Siam Paragon:\n\nชั้น BF:\n- MR.SKY: เปลี่ยนแบตรีโมตรถยนต์, เจาะเข็มขัด  \n- FLOWER DÉCOR\n- AUTO SPA\n- Sealife Ocean World/Show\n- Bag Studio: ซ่อมกระเป๋ารองเท้า\n\nชั้น GF:\nร้านอาหาร เครื่องดื่ม ขนม:  \n- McDonald'''s, MK Gold, Fuji, Starbucks Coffee\n- Gourmet Market: ร้านอาหารและของสด\n- ร้านอาหารไทย ก๋วยเตี๋ยว ลูกชิ้น คอหมูย่าง  \n- After You, Krispy Kreme, Ben'''s Cookies\n\nธนาคารและสถาบันการเงิน:\n- ธนาคารกรุงเทพ กสิกรไทย ไทยพาณิชย์ ทหารไทยธนชาต\n- สาขาพิเศษ Krungsri Smart, Citi, UOB Express\n\nร้าน Korean Street:\n- Nature Republic, Tony Moly, It'''s Skin\n\nร้านแฟชั่น กระเป๋า รองเท้า:\n- Zara, H&M, Uniqlo, Aldo, Charles & Keith \n\nร้านเครื่องประดับ นาฬิกา:\n- De Preco, Glintz, Leila, King of Amulet  \n\nร้านเสื้อผ้า:\n- Ecco, DKNY\n\nร้านยา Boots\n\nชั้น 2F:\nร้านรถยนต์หรู:\n- Maserati, Bentley, Porsche, Lamborghini, Harley Davidson, Rolls Royce, BMW, Mini, Ducati, Aston Martin\n\nร้านบริการทางการเงิน:\n- Krungsri Smart\n\nร้านขายเครื่องเสียง:\n- Bose, Sony, Focal, Bang & Olufsen\n\nร้านหนังสือ:  \n- นายอินทร์, Asia Books, Kinokuniya\n\nร้านขายแว่นตา:\n- Glassaholic (Ray Ban, Oakley, Dior, Fendi)\n\nClinic และสถานบริการความงาม\n\nร้านเสื้อผ้าบุรุษ:\n- Homme, Lacoste, Nautica, Pierre Cardin\n\nร้านกระเป๋าเดินทาง\n\nร้าน Adidas, Osim, Prima Gold, Eye Lab, iStudio, Samsung, Vivo, Dyson, Linn\n\nชั้น 3F:\nไอที คอมพิวเตอร์ มือถือ กล้อง: \n- Banana, IT City, Power Buy, Jaymart\n\nร้าน Gadget  \n\nร้านเครื่องเขียน อุปกรณ์สำนักงาน\n\nร้านของเล่นเด็ก:  \n- Lego, Hasbro, Mattel\n\nร้านชุดว่ายน้ำ:\n- Speedo, Billabong, Roxy  \n\nร้าน Lingerie: \n- Wacoal, Triumph, Sabina, BSC\n\nร้านเสื้อผ้าและอุปกรณ์กีฬา:\n- Nike, Adidas\n\nร้านเฟอร์นิเจอร์แบรนด์ดัง:\n- Index Livingmall, Trend Design, Barbara Barry, Ralph Lauren\n\nร้านของฝาก ของที่ระลึก:  \n- Naraya\n\nร้านแว่นตา:\n- IC Berlin, Paris Miki\n\nร้านถ่ายรูป DJI & Hasselblad\n\nชั้น 4F:\nพื้นที่ร้านอาหาร ภัตตาคาร:\n- Lukkaithong, Sushi Den, Chabuton, Midtown\n\nพื้นที่ Exotique Thai สปาและผลิตภัณฑ์ไทย:\n- Harnn, Erb, Panpuri, Vuudh\n\nพื้นที่ Next Tech:\n- TikTok, Connex Space, Siam Sandbox by Jaymart \n\nพื้นที่ Bright Space:\n- โรงเรียนสอนศิลปะ เต้นรำ ดนตรี ภาษา  \n- คลินิกความงาม ทันตกรรม\n\nสาขาผู้ให้บริการมือถือ AIS, DTAC, True\n\nธนาคาร กรุงไทย ออมสิน กรุงศรี\n\nร้านออกกำลังกาย Fitness First\n\nร้านเฟอร์นิเจอร์ ของตกแต่งบ้าน ของใช้ในครัว\n\nร้านของขวัญ ของที่ระลึก\n\nร้านขายสินค้าสัตว์เลี้ยง Pet Shop\n\nชั้น 5F:\nโรงภาพยนตร์ Paragon Cineplex, IMAX\n\nร้านอาหารและคาเฟ่ในโรงหนัง:  \n- Starbucks, Sushi Seki, KOF & Amattisimo\n\nRoyal Paragon Hall จัดงานอีเวนต์\n\nชั้น MF:\nแบรนด์เครื่องสำอาง น้ำหอม:\n- CHANEL, NARS, MAC, Lancome, Sulwhasoo, Jo Malone, Penhaligon'''s, Prada, Gucci, Hermes, Giorgio Armani\n\nแบรนด์แว่นตาและแว่นกันแดด:\n- Oakley, Ray Ban, Alexander McQueen \n\nแบรนด์แฟชั่นหรูระดับโลก:\n- Louis Vuitton, Cartier, Burberry, Jimmy Choo, Ermenegildo Zegna\n\nร้านสินค้าไลฟ์สไตล์หรู:\n- Montblanc, Tumi\n\nร้านนาฬิกาไฮเอนด์:\n- Rolex, Omega, Patek Philippe, Tudor, Van Cleef & Arpels\n\nร้านเครื่องประดับเพชรพลอย:  \n- Tiffany & Co., Swarovski\n\nรายการร้านค้าและบริการใน ICONSIAM, ICS:\n\nชั้น B2:\n- ICON WASH: บริการซักรีด\n- AIRPORTELS: บริการขนส่งกระเป๋า\n- MISTER SKY: ทำกุญแจ ซ่อมรองเท้า\n\nชั้น B1:\n- DHL Express, Kerry Express: บริการขนส่ง\n- Thailand Post: ไปรษณีย์ \n- Pet Safari: อาหารและอุปกรณ์สัตว์เลี้ยง\n- Sin Chai Hua: ซักอบรีด  \n- MOMOKO: ทำความสะอาดกระเป๋ารองเท้า\n- Bhu Mhai Lifestyle Spa, EXPERT Watch \n- ICONIC Your Design: ปักชื่อ ออกแบบเสื้อยืด\n\nชั้น GF:\nร้านอาหารและเครื่องดื่ม:\n- Blue by Alain Ducasse, Jumbo Seafood, TWG Tea  \n- Pang Cha, Coffee Beans by Dao, OMU, MOM'''S TOUCH, MOS BURGER\n\nแบรนด์เครื่องหนังหรู:  \n- Hermes, Louis Vuitton  \n- Cartier, Tiffany & Co.\n- Rimowa\n\nVeranda Zone:\n- D'''ARK Dinner Cruise, ร้านอาหารหลากหลาย\n- TrueCoffee, Susan Corissant \n- 7-Eleven\n\nอื่นๆ:  \n- SookSiam (ร้านค้าสินค้าไทย), NaRaYa, Dear Tummy \n\nชั้น MF (ICONLUXE): \nแบรนด์เครื่องสำอางและความงาม:\n- CHANEL, Dior, Estee Lauder, L'''OCCITANE, MAC, Jo Malone, Atelier de Prestige\n\nแฟชั่นแบรนด์เนมระดับโลก:\n- Gucci, Bottega Veneta, Cartier, Louis Vuitton, Hermes, Prada, Tiffany & Co., Dolce & Gabbana, Bulgari, Fendi, Saint Laurent, Dior, CELINE, Coach, Versace, Rimowa, Boss\n\nแฟชั่นแบรนด์อื่นๆ:  \n- Michael Kors, Swatch, Longchamp, Maison Kitsuné, KWANPEN, Victoria'''s Secret, H&M, COS, Zara, Bath & Body Works\n\nอื่นๆ: \n- Takashimaya Department Store\n\nชั้น 1:\nแฟชั่นและรองเท้า:\n- Louis Vuitton, COS, ZARA, Philipp Plein, Takashimaya, Evisu, Lacoste, H&M, Onitsuka Tiger, Birkenstock, Samsonite, Champion\n\nร้านอาหาร คาเฟ่:\n- % Arabica, Starbucks, Blue by Alain Ducasse\n\nอื่นๆ:\n- 333Gallery, Artventure, Agata (Art Gallery)  \n- Maserati, Porsche, Dyson, Bang & Olufsen, L'''Occitane\n\nชั้น 2:\nแฟชั่นและรองเท้า:  \n- H&M, Uniqlo, Lyn, Lyn Around, Charles & Keith, Levi'''s, New Era, Aldo, Vans, JD Sports\n\nความงาม:\n- LUSH, Fashion TV Cosmetics\n\nอื่นๆ:\n- AIS, Greyhound Cafe, MINISO, Watsons\n\nชั้น 3:\nร้านรถยนต์:  \n- Lamborghini, BMW, Mercedes, Volvo, Porsche, Harley Davidson\n\nแฟชั่น รองเท้า กีฬา:\n- JD Sports, Converse, Crocs, Vans, New Balance, FILA, Reebok, Skechers, Under Armour, Nike, Onitsuka Tiger, Lacoste, Swatch, Herschel, Eastpak, Jansport, Anello, The North Face\n\nร้านอาหารและคาเฟ่:  \n- Buddhi Belly, Kyo Roll En\n\nอื่นๆ:\n- MUJI, Loft (Lifestyle)\n\nชั้น 4:\nร้านอาหารและเครื่องดื่ม:  \n- Bar B Q Plaza, Shabushi, Café Amazon, Evaime Shabu, S&P, Tenjo Sushi, KFC, Bonchon, Kub Kao''' Kub Pla  \n- TrueCoffee, Susan \n\nแบรนด์ไลฟ์สไตล์ ICONCRAFT\n\nธนาคาร SCB, Kasikornbank\n\nอื่นๆ:  \n- True Sphere (IT), Harnn, THANN, Banana, AIS\n\nชั้น 5:  \nKids & Edutainment:\n- Babies Genius, Phonics 1st, Hit Galleria, Scientia, KPN Music Academy, Se-ed, ABC Baby\n- Viemus Music School, Yamaha Music School\n\nคลินิกความงาม สุขภาพ:\n- SLC Siam Laser Clinic, The Vanish Clinic, Pruksa Prime Clinic, THONGLOR DENTAL, Pewdee Clinic, The Heritage Nail Spa, CHABA Nails & Eyelashes, MILK\n\nร้านอาหาร:  \n- Baan Ying Cafe & Meal, THIPSAMAI, LukKaiThong, Mae Sri Ruen, Crazy Rich, MK LIVE, Hong Bao, Nice Two Meat U\n\nธนาคาร:\n- TMBThanachart, Krungthai, Krungsri, UOB, TISCO, GSB\n\nอื่นๆ:\n- Naiin Books, Watsons, Toys R Us, Mt. Sapola  \n\nชั้น 6:\nร้านอาหาร คาเฟ่:  \n- After You, ChaTraMue, Beard Papa, Katsugyu, James Boulangerie, Yuzu Ramen, Mil Toast, Mo-Mo-Paradise, Bonchon, IPPUDO, YAYOI, Sushi Den, The Bibimbab, Great Harbor, Evaime Shabu  \n\nEntertainment:\n- Fitness First, TRUE ICON HALL, ICON CINECONIC, MEGA HarborLand\n\nชั้น 7:\nTRUE ICON HALL\nStarbucks Reserve\n\nรายการร้านค้าและบริการใน Siam Center:\n\nชั้น 1:\nแฟชั่น เครื่องประดับ:  \n- Kloset, Tube Gallery, Fri 27 Nov, Les Nereides, Frank Garcon\n- โซน Absolute Siam (แบรนด์ไทยกว่า 100 แบรนด์) \n- โซน The Wonder Room (ดีไซเนอร์ไทยหลากสไตล์)\n\nอื่นๆ:  \n- AIS, Starbucks, Baking Soda  \n- Iconic (ที่ห้อยกระเป๋า พวงกุญแจ) \n- FabLab (ดีไซเนอร์อิสระ)\n\nชั้น 2:\nร้านอาหารนานาชาติ:\n- Tonkatsu Wako, Bar B Q, Yuzu Suki, Bonchon, Yayoi, Hachiban, After You, The Alley\n\nแฟชั่น:\n- Levi'''s, CC-OO, Havaianas, Villains, Charles & Keith, New Era, Lyn  \n\nบริการ:\n- Watsons, Pruksa Clinic, St. Peter Optical, AIS\n\nร้านขนม เครื่องดื่ม:\n- Minimelts, Fuku Matcha, Yenly Yours, Shiba-Jung, ERR, Candy Crush\n\nชั้น 3:  \n- Se-ed (ร้านหนังสือ)\n- Mr.DIY (ร้าน DIY ทั่วไป)\n- Muse Music Academy, INNER STUDIO (สอนดนตรี)\n- ร้านอาหาร Santa Fe, Daynighto (คาเฟ่)  \n- Skechers (รองเท้า)\n\nชั้น 4: \n- TORA CHA (ชานมไข่มุก)\n- Muscle Inc. (อาหารเสริม) \n- You&I Premium Suki Buffet \n\nชั้น MF:\nเครื่องสำอาง:\n- Oriental Princess, Cute Press\n\nแฟชั่น:\n- U.S. Polo, BEAUTRIUM, Pierre Cardin, Skechers, Rock Me, Dr.Martens\n\nการแบ่งข้อมูลออกเป็นส่วนย่อยๆ ตามหมวดหมู่ชัดเจน จะช่วยให้ง่ายต่อการนำไปใช้ train model ได้อย่างมีประสิทธิภาพมากขึ้น สามารถแยกเรียนรู้และทำความเข้าใจข้อมูลแต่ละส่วนได้โดยไม่ปะปนกัน ทั้งรายละเอียดของโปรโมชัน กิจกรรม และรายชื่อร้านค้าบริการแบ่งตามศูนย์การค้าและชั้นต่างๆ ช่วยให้ง่ายต่อการค้นหาและนำข้อมูลไปใช้ประโยชน์ต่อไป",
      }];
      const openai = new OpenAI({
        apiKey: this.configService.get('OPENAI_API_KEY'),
      });
      let responseText: string = '';
      const data: Dialogs[] = await this.dialogs.find(
        {
          order: {
            createTime: 'ASC',
          },
        }
      );
      let value = data.map((item) => {
        return {
          role: item.role,
          content: item.content,
        };
      });
      let content = [];
      content.push(...prompt,...value);

      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          ...content,
          { role: 'user', content: message },
        ],
        stream: true,
      });
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
        responseText += content;
        process.stdout.write(content);
        }
      }
      await Promise.all([
        await this.dialogs.save({ role: 'user', content: message}),
        await this.dialogs.save({ role: 'assistant', content: responseText}),
      ]);
      return responseText;
    } catch (error) {
      throw error;
    }
  }
}
