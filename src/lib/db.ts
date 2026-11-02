import mongoose from 'mongoose';

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; uri?: string };
const g = globalThis as unknown as { _mongo?: Cache };
const cache: Cache = g._mongo ?? (g._mongo = { conn: null, promise: null });

export async function connect() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must be a MongoDB connection string');
  }
  if (cache.conn?.connection.readyState === 1 && cache.uri === uri) return cache.conn;
  if (!cache.promise || cache.uri !== uri) {
    cache.uri = uri;
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
  return cache.conn;
}
