export interface GTMParams {
  tagId: string;
}

// todo: migrate this to a fern definition
export interface CustomerAnalytics {
  // amplitude?: {
  //     apiKey: string;
  // };
  // clearbit?: {
  //     publicApiKey: string;
  // };
  // fathom?: {
  //     siteId: string;
  // };
  ga4?: {
    measurementId: string;
  };
  gtm?: GTMParams;
  // hotjar?: {
  //     hjid: number;
  //     hjsv: number;
  // };
  // koala?: {
  //     publicApiKey: string;
  // };
  // logrocket?: {
  //     appId: string;
  // };
  // mixpanel?: {
  //     projectToken: string;
  // };
  // pirsch?: {
  //     id: string;
  // };
  // plausible?: {
  //     domain: string;
  // };
  // posthog?: {
  //     apiKey: string;
  //     apiHost?: string;
  // };
}
