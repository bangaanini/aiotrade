export type MemberGuideType = "video" | "pdf";

export type MemberGuideAsset = {
  bytes: number | null;
  createdAt: string;
  format: string | null;
  id: string;
  label: string;
  originalFilename: string | null;
  publicId: string;
  secureUrl: string;
};

export type MemberGuidePost = {
  createdAt: string;
  description: string;
  embedUrl: string | null;
  fileAssetId: string | null;
  fileUrl: string | null;
  id: string;
  isPublished: boolean;
  publishedAt: string;
  sortOrder: number;
  title: string;
  type: MemberGuideType;
  updatedAt: string;
};
