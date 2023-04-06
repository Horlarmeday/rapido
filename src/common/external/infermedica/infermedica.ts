import { v4 as uuidv4 } from 'uuid';
import { get, post } from '../axios';
import { SearchQueryDto } from '../../../modules/health-checkup/dto/search-query.dto';

export class Infermedica {
  private baseUrl = 'https://api.infermedica.com/v3/';
  private readonly apiKey: string;
  private readonly appId: string;
  private interviewId: string = uuidv4();
  private readonly headers: {
    'App-Key': string;
    'Content-Type': string;
    'App-Id': string;
  };
  constructor() {
    this.apiKey = <string>process.env.INFERMEDICA_API_KEY;
    this.appId = <string>process.env.INFERMEDICA_APP_ID;
    this.headers = {
      'Content-Type': 'application/json',
      'App-Id': this.appId,
      'App-Key': this.apiKey,
      ...(this.interviewId && { 'Interview-Id': this.interviewId }),
    };
  }

  parseFreeText(data) {
    return post(`${this.baseUrl}parse`, data, { headers: this.headers });
  }

  getRiskFactors(age: number) {
    return get(`${this.baseUrl}risk_factors?age.value=${age}`, this.headers);
  }

  getSuggestedSymptoms(data) {
    return post(`${this.baseUrl}suggest`, data, {
      headers: this.headers,
    });
  }

  diagnosis(data) {
    return post(`${this.baseUrl}diagnosis`, JSON.stringify(data), {
      headers: this.headers,
    });
  }

  explain(data) {
    return post(`${this.baseUrl}explain`, JSON.stringify(data), {
      headers: this.headers,
    });
  }

  search(data: SearchQueryDto) {
    const { phrase, sex, max_results, age } = data;
    const params = {
      phrase,
      'age.value': age,
      sex,
      max_results,
      types: 'symptom',
    };
    return get(`${this.baseUrl}search`, this.headers, params);
  }
}
