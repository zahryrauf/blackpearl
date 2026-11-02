import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

function model<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

const Range = new Schema({ from: Date, to: Date, note: String }, { _id: false });

const yachtSchema = new Schema(
  {
    kind: { type: String, enum: ['sale', 'charter'], required: true, index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, default: 'Motor yacht' },
    builder: String,
    year: Number,
    lengthM: { type: Number, required: true },
    beamM: Number,
    draftM: Number,
    grossTonnage: Number,
    guests: Number,
    cabins: Number,
    crew: Number,
    region: String,
    season: String,
    description: String,
    // sale
    priceEUR: Number,
    status: { type: String, enum: ['available', 'under-offer', 'sold'], default: 'available' },
    // charter
    weeklyRateEUR: Number,
    vatPct: { type: Number, default: 0 },
    apaPct: { type: Number, default: 30 },
    blocked: [Range],
    // media + display
    images: [String],
    brochureUrl: String,
    palette: { type: String, default: 'mist' },
    sceneX: { type: Number, default: 0.08 },
    sceneW: { type: Number, default: 0.84 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
yachtSchema.index({ name: 'text', builder: 'text', description: 'text' });

const enquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    topic: { type: String, enum: ['buy', 'sell', 'charter', 'general'], default: 'general' },
    message: String,
    yachtSlug: String,
    source: String,
    status: { type: String, enum: ['new', 'contacted', 'viewing', 'offer', 'won', 'lost'], default: 'new', index: true },
    assignedTo: String,
    notes: String,
    ip: String,
  },
  { timestamps: true },
);

const bookingSchema = new Schema(
  {
    yachtSlug: { type: String, required: true, index: true },
    yachtName: String,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    guests: Number,
    message: String,
    totalEUR: Number,
    depositEUR: Number,
    status: { type: String, enum: ['requested', 'confirmed', 'deposit-paid', 'declined', 'cancelled'], default: 'requested', index: true },
    payToken: String,
    stripeSessionId: String,
    paidAt: Date,
  },
  { timestamps: true },
);

const articleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Journal' },
    excerpt: String,
    body: String,
    published: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const subscriberSchema = new Schema(
  { email: { type: String, required: true, unique: true, lowercase: true }, interests: [String], active: { type: Boolean, default: true } },
  { timestamps: true },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: String,
    role: { type: String, enum: ['admin', 'broker'], default: 'broker' },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export type YachtDoc = InferSchemaType<typeof yachtSchema> & { _id: unknown };
export const Yacht = model<YachtDoc>('Yacht', yachtSchema);
export const Enquiry = model<InferSchemaType<typeof enquirySchema>>('Enquiry', enquirySchema);
export const Booking = model<InferSchemaType<typeof bookingSchema>>('Booking', bookingSchema);
export const Article = model<InferSchemaType<typeof articleSchema>>('Article', articleSchema);
export const Subscriber = model<InferSchemaType<typeof subscriberSchema>>('Subscriber', subscriberSchema);
export const User = model<InferSchemaType<typeof userSchema>>('User', userSchema);
