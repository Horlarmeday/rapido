import { sign } from 'jsonwebtoken';
import { post } from '../axios';

export class Zoom {
  private baseUrl = 'https://api.zoom.us/v2/';
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly token: string;
  private readonly headers: { Authorization: string; 'content-type': string };

  constructor() {
    this.apiKey = <string>process.env.ZOOM_API_KEY;
    this.secretKey = <string>process.env.ZOOM_API_SECRET_KEY || '2345678';
    this.token = sign(
      { iss: this.apiKey, exp: new Date().getTime() + 5000 },
      this.secretKey,
    );
    this.headers = {
      Authorization: `Bearer ${this.token}`,
      'content-type': 'application/json',
    };
  }

  async createMeeting({ topic, start_time }) {
    const url = `${this.baseUrl}users/me/meetings`;
    const settings = this.settings({ topic, start_time });
    return await post(url, { ...settings }, { headers: this.headers });
  }

  private settings({ topic, start_time }) {
    return {
      topic,
      type: 2,
      start_time,
      duration: '45',
      agenda: 'Scheduled Appointment',
      settings: {
        //alternative_hosts,
        host_video: 'true',
        participant_video: 'true',
        join_before_host: 'false',
        mute_upon_entry: 'false',
        auto_recording: 'cloud',
      },
    };
  }
}
