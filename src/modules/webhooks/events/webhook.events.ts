export class WebhookEvents {
  private event: string;
  private data: any;
  constructor({ event, data }) {
    this.event = event;
    this.data = data;
  }
}
