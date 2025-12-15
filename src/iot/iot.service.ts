import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  RequestTimeoutException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LinkDeviceDto } from './dto/link-device.dto';
import * as mqtt from 'mqtt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IotService implements OnModuleInit {
  private mqttClient: mqtt.MqttClient;
  private readonly brokerUrl = 'mqtt://test.mosquitto.org';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.connectToMqtt();
  }

  private connectToMqtt() {
    const host = this.configService.get<string>('MQTT_HOST');
    const port = this.configService.get<number>('MQTT_PORT');
    
    const brokerUrl = `mqtt://${host}:${port}`;

    console.log(`[IoT] Connecting to ${brokerUrl}...`);

    this.mqttClient = mqtt.connect(brokerUrl);

    this.mqttClient.on('connect', () => {
      console.log('[IoT] Connected to MQTT broker for IoT Service');
    });

    this.mqttClient.on('error', (err) => {
      console.error('[IoT] MQTT Connection Error:', err);
    });
  }

  async linkDevice(userId: number, dto: LinkDeviceDto) {
    const existing = await this.prisma.user.findUnique({
      where: { device_serial_id: dto.serial_number },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException(
        'This device is already linked to another user',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { device_serial_id: dto.serial_number },
    });

    return {
      status: 'success',
      message: 'Device linked successfully',
      serial_number: dto.serial_number,
    };
  }

  async unlinkDevice(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { device_serial_id: null },
    });

    return { status: 'success', message: 'Device unlinked successfully' };
  }

  async getDeviceStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { device_serial_id: true },
    });

    return {
      is_linked: !!user?.device_serial_id,
      serial_number: user?.device_serial_id || null,
    };
  }

  async getCurrentWeight(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { device_serial_id: true },
    });

    if (!user || !user.device_serial_id) {
      throw new BadRequestException('No smart scale linked to this account');
    }

    const serial = user.device_serial_id;
    const cmdTopic = `nutri-sense/devices/${serial}/cmd`;
    const dataTopic = `nutri-sense/devices/${serial}/data`;

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const timeout = setTimeout(() => {
        this.mqttClient.unsubscribe(dataTopic);
        reject(
          new RequestTimeoutException(
            'Scale did not respond in time (60s timeout)',
          ),
        );
      }, 60000);

      this.mqttClient.subscribe(dataTopic, (err) => {
        if (err) {
          clearTimeout(timeout);
          reject(
            new BadRequestException('Failed to subscribe to device topic'),
          );
        }

        console.log(
          `[IoT] Sending GET_WEIGHT to ${serial} at ${new Date().toISOString()}`,
        );
        this.mqttClient.publish(cmdTopic, 'GET_WEIGHT');
      });

      const messageHandler = (topic: string, message: Buffer) => {
        if (topic === dataTopic) {
          clearTimeout(timeout);
          this.mqttClient.removeListener('message', messageHandler);
          this.mqttClient.unsubscribe(dataTopic);

          const duration = Date.now() - startTime;
          console.log(
            `[IoT] Response received from ${serial}. Time taken: ${duration}ms`,
          );

          try {
            const data = JSON.parse(message.toString());
            resolve(data);
          } catch (e) {
            reject(
              new BadRequestException('Invalid data received from device'),
            );
          }
        }
      };

      this.mqttClient.on('message', messageHandler);
    });
  }
}
