import db from './db';
import { hashPassword } from './utils/auth';

interface SeedPhoto {
  title: string;
  description: string;
  imageUrl: string;
  location?: string;
  camera?: string;
  lens?: string;
  tags: string[];
  takenAt?: string;
  isFeatured?: boolean;
  palette?: string[];
  aspectRatio?: number;
  aiNotes?: string;
  views?: number;
}

interface SeedCollection {
  name: string;
  description: string;
  coverPhotoTitle: string;
  heroImageUrl?: string;
  photoTitles: string[];
}

interface SeedExhibition {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  heroImageUrl?: string;
}

const photos: SeedPhoto[] = [
  {
    title: '晨光下的贡多拉',
    description: '黎明的金色轻拂威尼斯潟湖，贡多拉在雾气中静候第一位旅人。',
    imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80',
    location: '威尼斯, 意大利',
    camera: 'Fujifilm GFX 100S',
    lens: 'GF 32-64mm F4',
    tags: ['威尼斯', '旅行', '晨光', '水面'],
    takenAt: '2023-06-14',
    isFeatured: true,
    palette: ['#1f2933', '#f59e0b', '#fef3c7'],
    aspectRatio: 3 / 2,
    aiNotes: '适合作为首页横幅的浪漫旅行作品。',
    views: 1840,
  },
  {
    title: '星辉下的山脊',
    description: '银河在夏夜的高山之巅缓缓升起，山脊如同沉睡的巨龙。',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    location: '勃朗峰, 法国',
    camera: 'Sony A7R V',
    lens: 'FE 14mm F1.8 GM',
    tags: ['星空', '山脉', '夜色', '自然'],
    takenAt: '2022-08-20',
    isFeatured: true,
    palette: ['#0b1120', '#1e3a8a', '#38bdf8'],
    aspectRatio: 16 / 9,
    aiNotes: '星轨的动势使作品极具沉浸感。',
    views: 2360,
  },
  {
    title: '城市脉搏',
    description: '雨后城市在霓虹中复苏，街道反射出科技感十足的冷色光影。',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-6479632d630a?auto=format&fit=crop&w=1600&q=80',
    location: '东京, 日本',
    camera: 'Leica Q3',
    lens: 'Summilux 28mm F1.7',
    tags: ['街头', '雨夜', '霓虹', '城市'],
    takenAt: '2023-11-02',
    isFeatured: true,
    palette: ['#0f172a', '#22d3ee', '#c084fc'],
    aspectRatio: 4 / 3,
    aiNotes: '极致的色彩对比，适合用作系列封面。',
    views: 3210,
  },
  {
    title: '荒漠低语',
    description: '风在撒哈拉雕琢沙丘，线条和光影勾勒出大地的极简诗意。',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    location: '撒哈拉, 摩洛哥',
    camera: 'Nikon Z9',
    lens: 'NIKKOR Z 70-200mm F2.8',
    tags: ['沙漠', '极简', '自然', '风光'],
    takenAt: '2021-10-05',
    palette: ['#f59e0b', '#78350f', '#fef3c7'],
    aspectRatio: 3 / 2,
    aiNotes: '极具雕塑感的线条组合，适合做成巨幅装置。',
    views: 980,
  },
  {
    title: '森林的心跳',
    description: '晨雾在古老的杉树间升腾，鸟鸣伴着光束穿透林间。',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    location: '屋久岛, 日本',
    camera: 'Canon EOS R5',
    lens: 'RF 24-70mm F2.8',
    tags: ['森林', '雾气', '绿色', '自然'],
    takenAt: '2022-04-28',
    isFeatured: false,
    palette: ['#052e16', '#22c55e', '#bbf7d0'],
    aspectRatio: 4 / 3,
    aiNotes: '层叠的绿色营造出沉浸式的呼吸感。',
    views: 1420,
  },
  {
    title: '冰川之眼',
    description: '冰川湖泊在夏季融化，呈现出晶莹剔透的蓝色弧线。',
    imageUrl: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=1600&q=80',
    location: '杰古沙龙冰河湖, 冰岛',
    camera: 'Phase One IQ4',
    lens: 'Schneider 45mm LS',
    tags: ['冰川', '蓝色', '航拍', '自然'],
    takenAt: '2021-07-15',
    palette: ['#0ea5e9', '#0369a1', '#e0f2fe'],
    aspectRatio: 16 / 10,
    aiNotes: '冷暖交织，适合作为环保主题的视觉主画面。',
    views: 1675,
  },
  {
    title: '光的礼拜堂',
    description: '布鲁日古老教堂的彩色玻璃在午后投射出缤纷光影。',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    location: '布鲁日, 比利时',
    camera: 'Hasselblad X2D',
    lens: 'XCD 45mm F3.5',
    tags: ['建筑', '色彩', '室内', '历史'],
    takenAt: '2020-09-11',
    isFeatured: false,
    palette: ['#3b0764', '#f97316', '#facc15'],
    aspectRatio: 3 / 2,
    aiNotes: '色彩与结构结合的建筑摄影典范。',
    views: 890,
  },
  {
    title: '极夜极光',
    description: '北极的夜空如丝绸般舞动，雪原反射着绿色的光。',
    imageUrl: 'https://images.unsplash.com/photo-1443926818681-717d074a57af?auto=format&fit=crop&w=1600&q=80',
    location: '特罗姆瑟, 挪威',
    camera: 'Sony A1',
    lens: 'FE 24mm F1.4 GM',
    tags: ['极光', '雪', '夜空', '自然'],
    takenAt: '2022-12-01',
    isFeatured: true,
    palette: ['#052e16', '#0f172a', '#34d399'],
    aspectRatio: 16 / 9,
    aiNotes: '动态感十足的极光作品，适合沉浸式投影。',
    views: 2056,
  },
];

const collections: SeedCollection[] = [
  {
    name: '光影的旅程',
    description: '记录世界不同角落光影与人文的诗意瞬间。',
    coverPhotoTitle: '晨光下的贡多拉',
    heroImageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80',
    photoTitles: ['晨光下的贡多拉', '城市脉搏', '光的礼拜堂'],
  },
  {
    name: '自然的心跳',
    description: '探索自然界的壮丽与静谧，感受地球原初的呼吸。',
    coverPhotoTitle: '星辉下的山脊',
    heroImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80',
    photoTitles: ['星辉下的山脊', '荒漠低语', '森林的心跳', '极夜极光'],
  },
  {
    name: '蓝色星球',
    description: '以航拍视角审视水体与大地的亲密对话。',
    coverPhotoTitle: '冰川之眼',
    heroImageUrl: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?auto=format&fit=crop&w=2400&q=80',
    photoTitles: ['冰川之眼', '晨光下的贡多拉', '极夜极光'],
  },
];

const exhibitions: SeedExhibition[] = [
  {
    title: '流动的光景 2024 巡展',
    description: '通过沉浸式影像与声音互动，呈现摄影与科技融合的无限可能。',
    location: '上海当代艺术馆',
    startDate: '2024-05-01',
    endDate: '2024-06-30',
    heroImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80',
  },
  {
    title: '星夜与山脊专题展',
    description: '精选十年间的高山与星空主题作品，结合气候数据进行多媒体叙事。',
    location: '东京森美术馆',
    startDate: '2024-09-10',
    endDate: '2024-10-31',
    heroImageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2000&q=80',
  },
];

function seedAdmins() {
  const adminCountRow = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count?: number } | undefined;
  const adminCount = adminCountRow?.count ?? 0;
  if (adminCount === 0) {
    const passwordHash = hashPassword('visionary123');
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('curator', passwordHash);
    console.log('✅ 管理员账号已创建: curator / visionary123');
  }
}

function seedPhotos() {
  const insert = db.prepare(`
    INSERT INTO photos (title, description, image_url, location, camera, lens, tags, taken_at, is_featured, palette, aspect_ratio, ai_notes, views)
    VALUES (@title, @description, @imageUrl, @location, @camera, @lens, @tags, @takenAt, @isFeatured, @palette, @aspectRatio, @aiNotes, @views)
  `);
  const update = db.prepare(`
    UPDATE photos SET description=@description, image_url=@imageUrl, location=@location, camera=@camera, lens=@lens, tags=@tags, taken_at=@takenAt,
      is_featured=@isFeatured, palette=@palette, aspect_ratio=@aspectRatio, ai_notes=@aiNotes, views=@views
    WHERE title=@title
  `);

  const photoIdMap: Record<string, number> = {};

  const transaction = db.transaction((items: SeedPhoto[]) => {
    items.forEach((item) => {
      const exists = db.prepare('SELECT id FROM photos WHERE title = ?').get(item.title) as { id: number } | undefined;
      const payload = {
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        location: item.location ?? null,
        camera: item.camera ?? null,
        lens: item.lens ?? null,
        tags: JSON.stringify(item.tags),
        takenAt: item.takenAt ?? null,
        isFeatured: item.isFeatured ? 1 : 0,
        palette: item.palette ? JSON.stringify(item.palette) : null,
        aspectRatio: item.aspectRatio ?? null,
        aiNotes: item.aiNotes ?? null,
        views: item.views ?? Math.floor(Math.random() * 900 + 300),
      };
      if (exists) {
        update.run(payload);
        photoIdMap[item.title] = exists.id;
      } else {
        const info = insert.run(payload);
        photoIdMap[item.title] = Number(info.lastInsertRowid);
      }
    });
  });

  transaction(photos);
  return photoIdMap;
}

function seedCollections(photoIdMap: Record<string, number>) {
  const insert = db.prepare(`
    INSERT INTO collections (name, description, cover_photo_id, hero_image_url)
    VALUES (@name, @description, @coverPhotoId, @heroImageUrl)
  `);
  const update = db.prepare(`
    UPDATE collections SET description=@description, cover_photo_id=@coverPhotoId, hero_image_url=@heroImageUrl
    WHERE name=@name
  `);
  const setPhotos = db.prepare('INSERT OR IGNORE INTO photo_collections (photo_id, collection_id) VALUES (?, ?)');
  const clearPhotos = db.prepare('DELETE FROM photo_collections WHERE collection_id = ?');

  const transaction = db.transaction((items: SeedCollection[]) => {
    items.forEach((item) => {
      const coverId = photoIdMap[item.coverPhotoTitle];
      const exists = db.prepare('SELECT id FROM collections WHERE name = ?').get(item.name) as { id: number } | undefined;
      if (exists) {
        update.run({
          name: item.name,
          description: item.description,
          coverPhotoId: coverId ?? null,
          heroImageUrl: item.heroImageUrl ?? null,
        });
        clearPhotos.run(exists.id);
        item.photoTitles.forEach((title) => {
          const photoId = photoIdMap[title];
          if (photoId) {
            setPhotos.run(photoId, exists.id);
          }
        });
      } else {
        const info = insert.run({
          name: item.name,
          description: item.description,
          coverPhotoId: coverId ?? null,
          heroImageUrl: item.heroImageUrl ?? null,
        });
        const collectionId = Number(info.lastInsertRowid);
        item.photoTitles.forEach((title) => {
          const photoId = photoIdMap[title];
          if (photoId) {
            setPhotos.run(photoId, collectionId);
          }
        });
      }
    });
  });

  transaction(collections);
}

function seedExhibitions() {
  const insert = db.prepare(`
    INSERT INTO exhibitions (title, description, location, start_date, end_date, hero_image_url)
    VALUES (@title, @description, @location, @startDate, @endDate, @heroImageUrl)
  `);
  const update = db.prepare(`
    UPDATE exhibitions SET description=@description, location=@location, start_date=@startDate, end_date=@endDate, hero_image_url=@heroImageUrl
    WHERE title=@title
  `);

  const transaction = db.transaction((items: SeedExhibition[]) => {
    items.forEach((item) => {
      const exists = db.prepare('SELECT id FROM exhibitions WHERE title = ?').get(item.title);
      if (exists) {
        update.run(item);
      } else {
        insert.run(item);
      }
    });
  });

  transaction(exhibitions);
}

function main() {
  console.log('🌱 开始初始化摄影作品数据库...');
  seedAdmins();
  const photoIdMap = seedPhotos();
  seedCollections(photoIdMap);
  seedExhibitions();
  console.log('✨ 数据初始化完成');
}

main();
