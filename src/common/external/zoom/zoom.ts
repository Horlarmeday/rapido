import { sign } from 'jsonwebtoken';
import { get, post, put } from '../axios';

export type CreateMeetingType = {
  topic: string;
  start_time: Date;
  duration?: string;
};

export enum MeetingStatus {
  END = 'end',
  RECOVER = 'recover',
}

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

  async createMeeting({ topic, start_time, duration }: CreateMeetingType) {
    const url = `${this.baseUrl}/users/me/meetings`;
    const settings = this.settings({ topic, start_time, duration });
    return await post(url, { ...settings }, { headers: this.headers });
  }

  async cancelMeeting(meetingId: string, meetingStatus: MeetingStatus) {
    const url = `${this.baseUrl}/meetings/${meetingId}/status`;
    const body = { action: meetingStatus };
    return await put(url, { ...body }, { headers: this.headers });
  }

  async getPastMeetingDetails(meetingId: string) {
    const url = `${this.baseUrl}/past_meetings/${meetingId}`;
    return await get(url, { headers: this.headers });
  }

  private settings({ topic, start_time, duration = '5' }) {
    return {
      topic,
      type: 2,
      start_time,
      duration,
      agenda: 'Scheduled Appointment',
      settings: {
        // alternative_hosts,
        host_video: 'true',
        participant_video: 'true',
        join_before_host: 'true',
        mute_upon_entry: 'false',
        auto_recording: 'cloud',
      },
    };
  }
}
