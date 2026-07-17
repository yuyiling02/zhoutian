export interface Artwork {
  id: number;
  author: string;
  title: string;
  modelFile: string;
  thumbnail: string;
  /** IndexedDB 中存储的模型文件 key（用于刷新后恢复） */
  _modelFileKey?: string;
  /** IndexedDB 中存储的缩略图 key */
  _thumbnailKey?: string;
}

export type ArtworkConfig = Artwork[];

export type CreativeCategory = 'collage-poetry' | 'paper-cutting';

export interface CreativeWork {
  id: string;
  category: CreativeCategory;
  author: string;
  title: string;
  imageUrl: string;
  createdAt: string;
}
