import { Timestamp } from './timestamp.model';

export interface StripeSubscription {
	ended_at: Timestamp;
  stripeLink: string;
  product: Product;
  cancel_at_period_end: boolean;
  canceled_at: Timestamp;
  trial_start: Timestamp;
  trial_end: Timestamp;
  items: Item[];
  quantity: number;
  current_period_start: Timestamp;
  cancel_at: Timestamp;
  metadata: any;
  created: Timestamp;
  status: string;
  current_period_end: Timestamp;
  prices: Price2[];
  role: string;
  price: Price3;
  id: string
}

interface Product {
  converter: any;
  _key: Key;
  type: string;
  firestore: Firestore
}

interface Key {
  path: Path
}

interface Path {
  segments: string[];
  offset: number;
  len: number
}

interface Firestore {
  app: App;
  databaseId: DatabaseId;
  settings: Settings
}

interface App {
  _isDeleted: boolean;
  _options: Options;
  _config: Config;
  _name: string;
  _automaticDataCollectionEnabled: boolean;
  _container: Container
}

interface Options {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string
}

interface Config {
  name: string;
  automaticDataCollectionEnabled: boolean
}

interface Container {
  name: string;
  providers: Providers
}

interface Providers {}

interface DatabaseId {
  projectId: string;
  database: string
}

interface Settings {
  host: string;
  ssl: boolean;
  ignoreUndefinedProperties: boolean;
  cacheSizeBytes: number;
  experimentalForceLongPolling: boolean;
  experimentalAutoDetectLongPolling: boolean;
  experimentalLongPollingOptions: ExperimentalLongPollingOptions;
  useFetchStreams: boolean
}

interface ExperimentalLongPollingOptions {}

interface Item {
  quantity: number;
  tax_rates: any[];
  subscription: string;
  billing_thresholds: any;
  object: string;
  metadata: Metadata;
  id: string;
  plan: Plan;
  created: number;
  price: Price
}

interface Metadata {}

interface Plan {
  object: string;
  tiers_mode: any;
  usage_type: string;
  metadata: Metadata2;
  amount: number;
  currency: string;
  aggregate_usage: any;
  transform_usage: any;
  nickname: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  product: string;
  interval_count: number;
  interval: string;
  trial_period_days: any;
  amount_decimal: string;
  id: string;
  livemode: boolean
}

interface Metadata2 {}

interface Price {
  custom_unit_amount: any;
  tiers_mode: any;
  created: number;
  nickname: string;
  lookup_key: any;
  billing_scheme: string;
  object: string;
  type: string;
  recurring: Recurring;
  unit_amount: number;
  metadata: Metadata3;
  product: Product2;
  tax_behavior: string;
  currency: string;
  active: boolean;
  unit_amount_decimal: string;
  id: string;
  transform_quantity: any;
  livemode: boolean
}

interface Recurring {
  interval_count: number;
  interval: string;
  usage_type: string;
  aggregate_usage: any;
  trial_period_days: any
}

interface Metadata3 {}

interface Product2 {
  description: any;
  package_dimensions: any;
  livemode: boolean;
  tax_code: string;
  id: string;
  unit_label: any;
  attributes: any[];
  name: string;
  default_price: string;
  active: boolean;
  updated: number;
  created: number;
  shippable: any;
  metadata: Metadata4;
  statement_descriptor: any;
  url: any;
  type: string;
  images: any[];
  object: string
}

interface Metadata4 {
  firebaseRole: string
}

interface Price2 {
  converter: any;
  _key: Key2;
  type: string;
  firestore: Firestore2
}

interface Key2 {
  path: Path2
}

interface Path2 {
  segments: string[];
  offset: number;
  len: number
}

interface Firestore2 {
  app: App2;
  databaseId: DatabaseId2;
  settings: Settings2
}

interface App2 {
  _isDeleted: boolean;
  _options: Options2;
  _config: Config2;
  _name: string;
  _automaticDataCollectionEnabled: boolean;
  _container: Container2
}

interface Options2 {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string
}

interface Config2 {
  name: string;
  automaticDataCollectionEnabled: boolean
}

interface Container2 {
  name: string;
  providers: Providers2
}

interface Providers2 {}

interface DatabaseId2 {
  projectId: string;
  database: string
}

interface Settings2 {
  host: string;
  ssl: boolean;
  ignoreUndefinedProperties: boolean;
  cacheSizeBytes: number;
  experimentalForceLongPolling: boolean;
  experimentalAutoDetectLongPolling: boolean;
  experimentalLongPollingOptions: ExperimentalLongPollingOptions2;
  useFetchStreams: boolean
}

interface ExperimentalLongPollingOptions2 {}

interface Price3 {
  converter: any;
  _key: Key3;
  type: string;
  firestore: Firestore3
}

interface Key3 {
  path: Path3
}

interface Path3 {
  segments: string[];
  offset: number;
  len: number
}

interface Firestore3 {
  app: App3;
  databaseId: DatabaseId3;
  settings: Settings3
}

interface App3 {
  _isDeleted: boolean;
  _options: Options3;
  _config: Config3;
  _name: string;
  _automaticDataCollectionEnabled: boolean;
  _container: Container3
}

interface Options3 {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string
}

interface Config3 {
  name: string;
  automaticDataCollectionEnabled: boolean
}

interface Container3 {
  name: string;
  providers: Providers3
}

interface Providers3 {}

interface DatabaseId3 {
  projectId: string;
  database: string
}

interface Settings3 {
  host: string;
  ssl: boolean;
  ignoreUndefinedProperties: boolean;
  cacheSizeBytes: number;
  experimentalForceLongPolling: boolean;
  experimentalAutoDetectLongPolling: boolean;
  experimentalLongPollingOptions: ExperimentalLongPollingOptions3;
  useFetchStreams: boolean
}

interface ExperimentalLongPollingOptions3 {}
