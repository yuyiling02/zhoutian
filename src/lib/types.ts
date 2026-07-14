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